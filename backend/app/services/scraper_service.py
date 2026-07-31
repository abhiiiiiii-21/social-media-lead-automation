import asyncio
from typing import Dict

from sqlalchemy.ext.asyncio import AsyncSession

from app.automation.playwright.browser_manager import BrowserManager
from app.automation.playwright.session_manager import SessionManager
from app.automation.instagram.progress_tracker import ProgressTracker
from app.automation.instagram.search.keyword_search import execute_keyword_search
from app.automation.instagram.search.hashtag_search import execute_hashtag_search
from app.automation.instagram.search.location_search import execute_location_search
from app.automation.instagram.search.username_search import execute_username_search
from app.automation.instagram.profile_parser import parse_profile
from app.automation.instagram.lead_storage import store_lead

# In-memory dictionary to track tasks so we can cancel them
_RUNNING_TASKS: Dict[str, asyncio.Task] = {}


class ScraperService:
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
        
    async def start_scraping(
        self, 
        campaign_id: str,
        account_name: str,
        search_mode: str,
        source_query: str,
        max_profiles: int = 100,
        max_scrolls: int = 50
    ) -> None:
        """
        Orchestrates the scraping job. This should typically be run as a background task.
        """
        if campaign_id in _RUNNING_TASKS and not _RUNNING_TASKS[campaign_id].done():
            raise ValueError(f"Scraping job already running for campaign {campaign_id}")
            
        tracker = ProgressTracker(self.db, campaign_id)
        
        # Fire off the scraping loop in the background and store the task handle
        task = asyncio.create_task(
            self._scrape_loop(
                campaign_id,
                account_name,
                search_mode,
                source_query,
                max_profiles,
                max_scrolls,
                tracker
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
        max_profiles: int,
        max_scrolls: int,
        tracker: ProgressTracker
    ) -> None:
        
        await tracker.log_event("INFO", f"Starting scraper: {search_mode} -> {source_query}")
        
        browser_manager = BrowserManager()
        session_manager = SessionManager(self.db)
        
        try:
            # Check if session exists and is valid
            session_path = session_manager.get_session_path(account_name)
            
            context = await browser_manager.create_context(storage_state_path=session_path)
            page = await browser_manager.get_page(context)
            
            # Select search generator
            if search_mode == "KEYWORD":
                search_gen = execute_keyword_search(page, source_query, max_scrolls)
            elif search_mode == "HASHTAG":
                search_gen = execute_hashtag_search(page, source_query, max_scrolls)
            elif search_mode == "LOCATION":
                search_gen = execute_location_search(page, source_query, max_scrolls)
            elif search_mode == "USERNAME":
                search_gen = execute_username_search(page, source_query, max_scrolls)
            else:
                await tracker.mark_failed(f"Unknown search mode: {search_mode}")
                return

            async for username in search_gen:
                if tracker.stats.profiles_processed >= max_profiles:
                    await tracker.log_event("INFO", f"Reached max profiles limit: {max_profiles}")
                    break
                    
                await tracker.add_discovered()
                
                # Navigate to profile
                profile_url = f"https://www.instagram.com/{username}/"
                try:
                    await page.goto(profile_url, wait_until="networkidle")
                    await asyncio.sleep(1) # small delay to avoid rate limit
                    
                    profile_data = await parse_profile(page, username)
                    
                    is_inserted = await store_lead(
                        self.db, 
                        campaign_id, 
                        source_query, 
                        search_mode, 
                        profile_data
                    )
                    
                    if is_inserted:
                        await tracker.add_inserted()
                    else:
                        await tracker.add_duplicate()
                        
                except Exception as e:
                    await tracker.add_error(f"Error parsing {username}: {str(e)}")
                    
                await tracker.add_processed()
                
            await tracker.mark_completed()

        except asyncio.CancelledError:
            await tracker.log_event("WARNING", "Scraping task was cancelled.")
            raise
        except Exception as e:
            await tracker.mark_failed(str(e))
        finally:
            await browser_manager.close()
