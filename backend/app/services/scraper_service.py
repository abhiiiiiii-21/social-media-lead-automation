import asyncio
from typing import Dict, List, Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.database.session import AsyncSessionLocal
from app.automation.playwright.browser_manager import BrowserManager
from app.automation.playwright.session_manager import SessionManager
from app.automation.instagram.progress_tracker import ProgressTracker
from app.automation.instagram.search.comment_search import execute_comment_search
from app.automation.instagram.search.keyword_search import execute_keyword_search
from app.automation.instagram.search.hashtag_search import execute_hashtag_search
from app.automation.instagram.search.location_search import execute_location_search
from app.automation.instagram.search.username_search import execute_username_search
from app.automation.instagram.profile_parser import parse_profile
from app.automation.instagram.lead_storage import store_lead
from app.automation.common.rate_controller import RateController
from app.automation.common.automation_settings import get_automation_config

# In-memory dictionary to track tasks so we can cancel them
_RUNNING_TASKS: Dict[str, asyncio.Task] = {}


class ScraperService:
    def __init__(self, db_session: Optional[AsyncSession] = None):
        self.db = db_session
        
    async def start_scraping(
        self, 
        campaign_id: str,
        account_name: str = "default",
        search_mode: str = "COMMENT",
        source_query: Optional[str] = "",
        post_urls: Optional[List[str]] = None,
        keyword_filter: Optional[str] = None,
        max_profiles: int = 100,
        max_scrolls: int = 50,
        include_replies: bool = True,
        skip_duplicates: bool = True,
        profile_enrichment: bool = True,
        min_followers: Optional[int] = None,
        max_followers: Optional[int] = None,
        min_posts: Optional[int] = None,
        max_posts: Optional[int] = None,
        language: Optional[str] = None,
        country: Optional[str] = None,
        business_category: Optional[str] = None,
        is_business_required: Optional[bool] = False,
        is_verified_required: Optional[bool] = False,
        is_email_required: Optional[bool] = False,
        is_phone_required: Optional[bool] = False,
        is_website_required: Optional[bool] = False,
    ) -> None:
        """
        Orchestrates the scraping job in a background asyncio task.
        """
        if campaign_id in _RUNNING_TASKS and not _RUNNING_TASKS[campaign_id].done():
            raise ValueError(f"Scraping job already running for campaign {campaign_id}")
            
        tracker = ProgressTracker(None, campaign_id, target_count=max_profiles)
        await tracker.mark_running()
        
        # Fire off the scraping loop in the background and store the task handle
        task = asyncio.create_task(
            self._scrape_loop(
                campaign_id=campaign_id,
                account_name=account_name,
                search_mode=search_mode.upper(),
                source_query=source_query or "",
                post_urls=post_urls or [],
                keyword_filter=keyword_filter,
                max_profiles=max_profiles,
                max_scrolls=max_scrolls,
                include_replies=include_replies,
                skip_duplicates=skip_duplicates,
                profile_enrichment=profile_enrichment,
                min_followers=min_followers,
                max_followers=max_followers,
                min_posts=min_posts,
                max_posts=max_posts,
                language=language,
                country=country,
                business_category=business_category,
                is_business_required=is_business_required,
                is_verified_required=is_verified_required,
                is_email_required=is_email_required,
                is_phone_required=is_phone_required,
                is_website_required=is_website_required,
                tracker=tracker
            )
        )
        _RUNNING_TASKS[campaign_id] = task
        
    async def stop_scraping(self, campaign_id: str) -> None:
        if campaign_id in _RUNNING_TASKS:
            task = _RUNNING_TASKS[campaign_id]
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
            del _RUNNING_TASKS[campaign_id]
            
            # Mark as stopped in progress tracker
            tracker = ProgressTracker(self.db, campaign_id)
            await tracker.mark_stopped()
        else:
            raise ValueError(f"No running job found for campaign {campaign_id}")

    async def _scrape_loop(
        self,
        campaign_id: str,
        account_name: str,
        search_mode: str,
        source_query: str,
        post_urls: List[str],
        keyword_filter: Optional[str],
        max_profiles: int,
        max_scrolls: int,
        include_replies: bool,
        skip_duplicates: bool,
        profile_enrichment: bool,
        min_followers: Optional[int],
        max_followers: Optional[int],
        min_posts: Optional[int],
        max_posts: Optional[int],
        language: Optional[str],
        country: Optional[str],
        business_category: Optional[str],
        is_business_required: Optional[bool],
        is_verified_required: Optional[bool],
        is_email_required: Optional[bool],
        is_phone_required: Optional[bool],
        is_website_required: Optional[bool],
        tracker: ProgressTracker
    ) -> None:
        
        await tracker.log_event("INFO", f"Starting scraper: Mode={search_mode}, MaxProfiles={max_profiles}")
        
        async with AsyncSessionLocal() as bg_db:
            automation_config = await get_automation_config(bg_db)
            session_manager = SessionManager(bg_db)
            session_path = session_manager.get_session_path(account_name)
            
        rate_controller = RateController(automation_config)
        browser_manager = BrowserManager()
        
        try:
            context = await browser_manager.create_context(storage_state_path=session_path)
            page = await browser_manager.get_page(context)
            
            # Select search generator
            if search_mode == "COMMENT":
                target_urls = post_urls if post_urls else ([source_query] if source_query else [])
                await tracker.set_stage("Loading Comments", url=target_urls[0] if target_urls else None)
                search_gen = execute_comment_search(
                    page=page,
                    post_urls=target_urls,
                    keyword_filter=keyword_filter,
                    max_profiles=max_profiles,
                    include_replies=include_replies,
                    max_scrolls_per_post=max_scrolls,
                    live_logger=tracker.log_event
                )
            elif search_mode == "KEYWORD":
                await tracker.set_stage("Searching", url=f"Keyword:{source_query}")
                search_gen = execute_keyword_search(page, source_query, max_scrolls)
            elif search_mode == "HASHTAG":
                await tracker.set_stage("Searching", url=f"#{source_query}")
                search_gen = execute_hashtag_search(page, source_query, max_scrolls)
            elif search_mode == "LOCATION":
                await tracker.set_stage("Searching", url=f"Location:{source_query}")
                search_gen = execute_location_search(page, source_query, max_scrolls)
            elif search_mode == "USERNAME":
                await tracker.set_stage("Searching", url=f"@{source_query}")
                search_gen = execute_username_search(page, source_query, max_scrolls)
            else:
                await tracker.mark_failed(f"Unknown search mode: {search_mode}")
                return

            async for username in search_gen:
                if tracker.stats.profiles_inserted >= max_profiles:
                    await tracker.log_event("INFO", f"Reached target profile limit: {max_profiles}")
                    break
                    
                await tracker.add_discovered()
                rate_controller.record_action()
                
                # Rate Limiter
                try:
                    await rate_controller.check_limits()
                    await rate_controller.pause_if_needed()
                except StopAsyncIteration:
                    await tracker.log_event("INFO", "Maximum profiles per run reached from rate controller.")
                    break
                except TimeoutError as e:
                    await tracker.log_event("WARNING", f"Rate controller timeout: {str(e)}")
                    break

                profile_data: Dict[str, Any] = {
                    "username": username,
                    "profile_url": f"https://www.instagram.com/{username}/"
                }

                # Profile Enrichment
                if profile_enrichment:
                    await tracker.set_stage("Parsing Profiles", username=username, url=f"https://www.instagram.com/{username}/")
                    profile_url = f"https://www.instagram.com/{username}/"
                    try:
                        await page.goto(profile_url, wait_until="domcontentloaded", timeout=automation_config.nav_timeout_ms)
                        await asyncio.sleep(0.5)
                        parsed = await parse_profile(page, username)
                        if parsed and isinstance(parsed, dict):
                            profile_data.update(parsed)
                    except Exception as e:
                        logger.warning(f"Error enriching @{username}: {e}")
                        await tracker.log_event("WARNING", f"Could not enrich @{username}: {str(e)}")

                    # Apply Advanced Filters
                    followers = profile_data.get("followers", 0) or 0
                    posts_count = profile_data.get("posts", 0) or 0
                    
                    if min_followers is not None and followers < min_followers:
                        await tracker.log_event("INFO", f"Rejected @{username}: Followers ({followers}) < min ({min_followers})")
                        await tracker.add_processed()
                        continue
                    if max_followers is not None and followers > max_followers:
                        await tracker.log_event("INFO", f"Rejected @{username}: Followers ({followers}) > max ({max_followers})")
                        await tracker.add_processed()
                        continue
                    if min_posts is not None and posts_count < min_posts:
                        await tracker.log_event("INFO", f"Rejected @{username}: Posts ({posts_count}) < min ({min_posts})")
                        await tracker.add_processed()
                        continue
                    if max_posts is not None and posts_count > max_posts:
                        await tracker.log_event("INFO", f"Rejected @{username}: Posts ({posts_count}) > max ({max_posts})")
                        await tracker.add_processed()
                        continue
                    if is_business_required and not profile_data.get("business_account"):
                        await tracker.log_event("INFO", f"Rejected @{username}: Not a business account")
                        await tracker.add_processed()
                        continue
                    if is_verified_required and not profile_data.get("verified"):
                        await tracker.log_event("INFO", f"Rejected @{username}: Not verified")
                        await tracker.add_processed()
                        continue
                    if is_email_required and not profile_data.get("external_email"):
                        await tracker.log_event("INFO", f"Rejected @{username}: No email found")
                        await tracker.add_processed()
                        continue
                    if is_phone_required and not profile_data.get("external_phone"):
                        await tracker.log_event("INFO", f"Rejected @{username}: No phone found")
                        await tracker.add_processed()
                        continue
                    if is_website_required and not profile_data.get("website"):
                        await tracker.log_event("INFO", f"Rejected @{username}: No website found")
                        await tracker.add_processed()
                        continue
                    if business_category and profile_data.get("category"):
                        if business_category.lower() not in profile_data["category"].lower():
                            await tracker.log_event("INFO", f"Rejected @{username}: Category '{profile_data.get('category')}' does not match '{business_category}'")
                            await tracker.add_processed()
                            continue

                # Save Lead to DB
                await tracker.set_stage("Saving Leads", username=username)
                try:
                    async with AsyncSessionLocal() as save_db:
                        is_inserted = await store_lead(
                            session=save_db, 
                            campaign_id=campaign_id, 
                            source_query=source_query or (post_urls[0] if post_urls else "comment"), 
                            search_mode=search_mode, 
                            profile_data=profile_data,
                            qualification_status="QUALIFIED" if profile_enrichment else "PENDING"
                        )
                    
                    if is_inserted:
                        await tracker.add_inserted()
                        await tracker.log_event("INFO", f"Saved lead @{username} to database")
                    else:
                        await tracker.add_duplicate()
                        await tracker.log_event("INFO", f"Skipped duplicate lead @{username}")
                        
                except Exception as e:
                    await tracker.add_error(f"Error saving {username}: {str(e)}")
                    
                await tracker.add_processed()
                    
            await tracker.mark_completed()

        except asyncio.CancelledError:
            await tracker.log_event("WARNING", "Scraping task was cancelled.")
            raise
        except Exception as e:
            logger.error(f"Scraper error: {e}")
            await tracker.mark_failed(str(e))
        finally:
            await browser_manager.close()
            if campaign_id in _RUNNING_TASKS:
                del _RUNNING_TASKS[campaign_id]
