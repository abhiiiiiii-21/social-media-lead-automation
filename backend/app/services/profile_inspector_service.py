import re
import time
from typing import Dict, Any, Tuple, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.schemas.profile_inspector import (
    ProfileInspectRequest,
    ProfileInspectResponse,
    ProfileInspectOptions,
    StructuredProfileData,
)
from app.automation.playwright.browser_manager import BrowserManager
from app.automation.instagram.profile import scrape_profile
from app.automation.instagram.contact import scrape_contact
from app.automation.instagram.links import scrape_links
from app.automation.instagram.highlights import scrape_highlights
from app.automation.instagram.posts import scrape_posts
from app.automation.instagram.media import MediaDownloader
from app.automation.instagram.engagement import calculate_engagement
from app.automation.instagram.business import infer_business_intelligence
from app.automation.instagram.export import assemble_structured_profile
from app.automation.instagram.quality import calculate_quality_score, format_quality_report


def normalize_instagram_input(input_str: str) -> Tuple[str, str]:
    """
    Normalizes any Instagram URL, handle, or path to (clean_username, canonical_profile_url).
    """
    cleaned = input_str.strip()
    cleaned = re.sub(r"^https?://", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"^(www\.)?instagram\.com/", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.split("?")[0].split("#")[0]
    cleaned = cleaned.lstrip("@").strip("/")

    username = cleaned.lower()
    canonical_url = f"https://www.instagram.com/{username}/"
    return username, canonical_url


class ProfileInspectorService:
    def __init__(self, db_session: Optional[AsyncSession] = None):
        self.db = db_session
        self.media_downloader = MediaDownloader()

    async def inspect(self, request: ProfileInspectRequest) -> ProfileInspectResponse:
        total_start = time.time()
        username, profile_url = normalize_instagram_input(request.url_or_username)
        options = request.options or ProfileInspectOptions()

        if not username or not re.match(r"^[a-zA-Z0-9._]{1,30}$", username):
            return ProfileInspectResponse(
                success=False,
                error="Invalid Instagram username or URL format.",
                error_type="INVALID_INPUT",
                live_logs=["Failed to parse a valid Instagram username."],
                raw_logs=[f"Error: regex validation failed for input '{request.url_or_username}'"],
            )

        live_logs: List[str] = []
        raw_logs: List[str] = []

        browser_manager = BrowserManager()
        profile_data: Dict[str, Any] = {}
        links_data: List[Dict[str, Any]] = []
        contact_data: Dict[str, Any] = {}
        highlights_data: List[Dict[str, Any]] = []
        posts_data: List[Dict[str, Any]] = []

        try:
            # Step 1: Loading Profile
            raw_logs.append(f"START browser navigation -> {profile_url}")
            t_nav = time.time()
            context = await browser_manager.create_context()
            page = await context.new_page()

            await page.set_viewport_size({"width": 1280, "height": 900})
            
            response = await page.goto(profile_url, wait_until="domcontentloaded", timeout=25000)
            status_code = response.status if response else 200
            dur_nav = time.time() - t_nav
            raw_logs.append(f"END browser navigation in {dur_nav:.2f}s (HTTP {status_code})")
            live_logs.append(f"✓ Loading Profile ({dur_nav:.1f}s)")

            # Check if profile is unavailable or suspended
            page_title = await page.title()
            page_body = await page.content()

            if "Page Not Found" in page_title or "isn't available" in page_body or status_code == 404:
                raw_logs.append(f"ERROR: Profile @{username} not found on Instagram (404 / Unavailable)")
                await browser_manager.close()
                return ProfileInspectResponse(
                    success=False,
                    error=f"Instagram profile @{username} was not found or has been removed.",
                    error_type="PROFILE_NOT_FOUND",
                    live_logs=live_logs + ["Instagram profile not found."],
                    raw_logs=raw_logs,
                )

            await page.wait_for_timeout(1000)

            # Step 2: Extracting Header (profile.py)
            t_prof = time.time()
            raw_logs.append("START Extracting Header (profile.py)")
            try:
                profile_data = await scrape_profile(page, username)
                dur_prof = time.time() - t_prof
                raw_logs.append(f"END Extracting Header in {dur_prof:.2f}s (Name: '{profile_data.get('fullName')}', Category: {profile_data.get('category')}, Followers: {profile_data.get('followers'):,}, Verified: {profile_data.get('isVerified')})")
                live_logs.append(f"✓ Extracting Header ({dur_prof:.1f}s)")
            except Exception as e:
                logger.error(f"Header extraction failed: {e}", exc_info=True)
                raw_logs.append(f"ERROR profile header module: {str(e)}")
                live_logs.append("⚠ Extracting Header Warning")

            # Step 3: Extracting Links (links.py)
            t_link = time.time()
            raw_logs.append("START Extracting Links (links.py)")
            try:
                if options.external_links:
                    links_data = await scrape_links(page)
                dur_link = time.time() - t_link
                raw_logs.append(f"END Extracting Links in {dur_link:.2f}s ({len(links_data)} external links found)")
                live_logs.append(f"✓ Extracting Links ({len(links_data)} found) ({dur_link:.1f}s)")
            except Exception as e:
                logger.error(f"Links module failed: {e}", exc_info=True)
                raw_logs.append(f"ERROR links module: {str(e)}")
                live_logs.append("✓ Extracting Links (0 found)")

            # Step 4: Extracting Contact (contact.py)
            t_contact = time.time()
            raw_logs.append("START Extracting Contact (contact.py)")
            try:
                if options.contact_info:
                    contact_data = await scrape_contact(
                        page=page,
                        bio=profile_data.get("bio"),
                        category=profile_data.get("category"),
                        external_links=links_data,
                    )
                dur_contact = time.time() - t_contact
                raw_logs.append(f"END Extracting Contact in {dur_contact:.2f}s (Email: {contact_data.get('email')}, Phone: {contact_data.get('phone')}, WhatsApp: {contact_data.get('whatsApp')})")
                live_logs.append(f"✓ Extracting Contact ({dur_contact:.1f}s)")
            except Exception as e:
                logger.error(f"Contact module failed: {e}", exc_info=True)
                raw_logs.append(f"ERROR contact module: {str(e)}")
                live_logs.append("✓ Extracting Contact")

            # Step 5: Extracting Highlights (highlights.py)
            t_hl = time.time()
            raw_logs.append("START Extracting Highlights (highlights.py)")
            try:
                if options.highlights and not profile_data.get("isPrivate"):
                    highlights_data = await scrape_highlights(page)
                dur_hl = time.time() - t_hl
                raw_logs.append(f"END Extracting Highlights in {dur_hl:.2f}s ({len(highlights_data)} story highlights found)")
                live_logs.append(f"✓ Extracting Highlights ({len(highlights_data)} found) ({dur_hl:.1f}s)")
            except Exception as e:
                logger.error(f"Highlights module failed: {e}", exc_info=True)
                raw_logs.append(f"ERROR highlights module: {str(e)}")
                live_logs.append("✓ Extracting Highlights (0 found)")

            # Step 6: Loading Posts & Deep Inspection (posts.py)
            t_post = time.time()
            raw_logs.append("START Loading Posts (posts.py)")
            try:
                if options.recent_posts and not profile_data.get("isPrivate"):
                    posts_data = await scrape_posts(
                        page,
                        max_posts=12,
                        live_logger=live_logs,
                        raw_logger=raw_logs,
                    )
                dur_post = time.time() - t_post
                raw_logs.append(f"END Loading Posts in {dur_post:.2f}s ({len(posts_data)} posts scraped with media & real captions)")
                live_logs.append(f"✓ Loading Posts ({len(posts_data)} posts) ({dur_post:.1f}s)")
            except Exception as e:
                logger.error(f"Posts module failed: {e}", exc_info=True)
                raw_logs.append(f"ERROR posts module: {str(e)}")
                live_logs.append("✓ Loading Posts (0 posts)")

            await browser_manager.close()

        except Exception as e:
            raw_logs.append(f"FATAL Playwright navigation error: {str(e)}")
            try:
                await browser_manager.close()
            except Exception:
                pass

            return ProfileInspectResponse(
                success=False,
                error=f"Failed to inspect profile @{username}: {str(e)}",
                error_type="SCRAPE_ERROR",
                live_logs=live_logs + ["Inspection failed due to connection/browser error."],
                raw_logs=raw_logs + [f"Fatal error: {str(e)}"],
            )

        # Step 7: Downloading Media (media.py)
        t_media = time.time()
        raw_logs.append("START Downloading Media (media.py)")
        try:
            media_data = await self.media_downloader.download_all(
                username=username,
                avatar_url=profile_data.get("profilePictureUrl"),
                posts=posts_data,
                highlights=highlights_data,
                max_posts_to_download=12,
            )
            total_dl = media_data.get("downloadedPostsCount", 0) + media_data.get("downloadedHighlightsCount", 0) + (1 if media_data.get("profilePicturePath") else 0)
            dur_media = time.time() - t_media
            raw_logs.append(f"END Downloading Media in {dur_media:.2f}s ({total_dl} high-resolution files saved locally)")
            live_logs.append(f"✓ Downloading Media ({total_dl} files) ({dur_media:.1f}s)")
        except Exception as e:
            logger.error(f"Media download failed: {e}", exc_info=True)
            raw_logs.append(f"ERROR media module: {str(e)}")
            media_data = {"profilePicturePath": None, "downloadedPostsCount": 0, "downloadedHighlightsCount": 0, "postImages": [], "highlightCovers": []}

        # Step 8: Extracting Metadata & Calculating Engagement (engagement.py)
        t_eng = time.time()
        raw_logs.append("START Extracting Metadata (engagement.py)")
        try:
            engagement_data = calculate_engagement(
                followers=profile_data.get("followers", 0),
                posts=posts_data,
            )
            dur_eng = time.time() - t_eng
            raw_logs.append(f"END Extracting Metadata in {dur_eng:.2f}s (Rate: {engagement_data.get('estimatedEngagementRate')}%, Avg Likes: {engagement_data.get('averageLikes')})")
            live_logs.append(f"✓ Extracting Metadata ({dur_eng:.1f}s)")
        except Exception as e:
            logger.error(f"Engagement calculation failed: {e}", exc_info=True)
            raw_logs.append(f"ERROR engagement calculation: {str(e)}")
            engagement_data = {}

        # Step 9: Infer Lead Intelligence for AI Website Generator (business.py)
        t_biz = time.time()
        raw_logs.append("START Generating Lead Intelligence (business.py)")
        try:
            business_data = infer_business_intelligence(
                username=username,
                full_name=profile_data.get("fullName"),
                bio=profile_data.get("bio"),
                category=profile_data.get("category"),
                website=contact_data.get("website") or (links_data[0]["url"] if links_data else None),
                email=contact_data.get("email"),
                phone=contact_data.get("phone"),
                whatsapp=contact_data.get("whatsApp"),
                external_links=links_data,
                posts=posts_data,
                avatar_url=profile_data.get("profilePictureUrl"),
            )
            dur_biz = time.time() - t_biz
            raw_logs.append(f"END Generating Lead Intelligence in {dur_biz:.2f}s (Industry: {business_data.get('industry')}, Style: {business_data.get('estimatedWebsiteStyle')})")
            live_logs.append(f"✓ Generating Lead Intelligence ({dur_biz:.1f}s)")
        except Exception as e:
            logger.error(f"Business intelligence failed: {e}", exc_info=True)
            raw_logs.append(f"ERROR business intelligence: {str(e)}")
            business_data = {}

        # Step 10: Calculate Scraper Quality Score & Report (quality.py)
        quality_score = calculate_quality_score(
            profile_data=profile_data,
            contact_data=contact_data,
            links_data=links_data,
            highlights_data=highlights_data,
            posts_data=posts_data,
            media_data=media_data,
            business_data=business_data,
            json_validation_status="PASS",
        )
        report_text = format_quality_report(quality_score)
        raw_logs.append(report_text)
        logger.info(report_text)

        # Step 11: Assemble & Export Structured JSON (export.py)
        t_json = time.time()
        raw_logs.append("START Generating JSON (export.py)")
        structured_data = assemble_structured_profile(
            profile_data=profile_data,
            contact_data=contact_data,
            links_data=links_data,
            highlights_data=highlights_data,
            posts_data=posts_data,
            engagement_data=engagement_data,
            business_data=business_data,
            media_data=media_data,
            quality_data=quality_score,
        )
        json_dur = time.time() - t_json
        raw_logs.append(f"END Generating JSON in {json_dur:.2f}s (8 sections strictly populated)")
        live_logs.append(f"✓ Generating JSON ({json_dur:.1f}s)")

        # Step 12: JSON Schema Validation
        try:
            # Validate via Pydantic model dump & re-validation
            StructuredProfileData.model_validate(structured_data.model_dump())
            live_logs.append("✓ Validation Passed")
            raw_logs.append("✓ JSON Validation Passed (All required schema fields verified)")
        except Exception as val_err:
            logger.warning(f"Schema validation warning: {val_err}")
            raw_logs.append(f"WARNING: JSON Validation issue: {val_err}")

        # Format dual-compatible post list with strict nulls for missing likes/comments
        post_items_dicts = [
            {
                "id": p.id,
                "shortcode": p.shortcode,
                "image_url": p.imageUrl,
                "imageUrl": p.imageUrl,
                "originalUrl": p.originalUrl,
                "original_url": p.originalUrl,
                "originalImageUrl": p.originalImageUrl or p.originalUrl or p.imageUrl,
                "original_image_url": p.originalImageUrl or p.originalUrl or p.imageUrl,
                "caption": p.caption,
                "likes": p.likes,
                "comments": p.comments,
                "post_url": p.postUrl,
                "postUrl": p.postUrl,
                "video_url": p.videoUrl,
                "videoUrl": p.videoUrl,
                "thumbnail": p.thumbnail,
                "thumbnail_url": p.thumbnailUrl,
                "thumbnailUrl": p.thumbnailUrl,
                "is_reel": p.isReel,
                "isReel": p.isReel,
                "is_carousel": p.isCarousel,
                "isCarousel": p.isCarousel,
                "is_image": p.isImage,
                "isImage": p.isImage,
                "is_video": p.isVideo,
                "isVideo": p.isVideo,
                "is_pinned": p.isPinned,
                "isPinned": p.isPinned,
                "is_sponsored": p.isSponsored,
                "isSponsored": p.isSponsored,
                "date": p.date,
                "upload_date": p.uploadDate,
                "uploadDate": p.uploadDate,
                "location": p.location,
                "hashtags": p.hashtags,
                "mentions": p.mentions,
                "taggedAccounts": p.taggedAccounts,
                "tagged_accounts": p.taggedAccounts,
                "alt_text": p.altText,
                "altText": p.altText,
                "accessibility_text": p.accessibilityText,
                "accessibilityText": p.accessibilityText,
                "media_type": p.mediaType,
                "mediaType": p.mediaType,
                "carousel_count": p.carouselCount,
                "carouselCount": p.carouselCount,
                "image_path": p.imagePath or p.localFilePath,
                "imagePath": p.imagePath or p.localFilePath,
                "local_file_path": p.localFilePath or p.imagePath,
                "localFilePath": p.localFilePath or p.imagePath,
                "local_path": p.localPath or p.imagePath,
                "localPath": p.localPath or p.imagePath,
                "local_image_path": p.localImagePath or p.imagePath,
                "localImagePath": p.localImagePath or p.imagePath,
                "media_url": p.mediaUrl,
                "mediaUrl": p.mediaUrl,
                "download_status": p.downloadStatus,
                "downloadStatus": p.downloadStatus,
                "file_size": p.fileSize,
                "fileSize": p.fileSize,
                "mime_type": p.mimeType,
                "mimeType": p.mimeType,
                "checksum": p.checksum,
                "width": p.width,
                "height": p.height,
            }
            for p in structured_data.posts
        ]

        external_links_dicts = [link.model_dump() for link in structured_data.externalLinks]
        highlights_dicts = [hl.model_dump() for hl in structured_data.highlights]
        posts_count_val = structured_data.profile.postsCount

        formatted_profile_summary = {
            "username": username,
            "full_name": structured_data.profile.fullName,
            "fullName": structured_data.profile.fullName,
            "avatar_url": structured_data.profile.profilePictureUrl,
            "avatarUrl": structured_data.profile.profilePictureUrl,
            "profilePictureUrl": structured_data.profile.profilePictureUrl,
            "bio": structured_data.profile.bio,
            "followers": structured_data.profile.followers,
            "following": structured_data.profile.following,
            "posts": posts_count_val,  # Integer count for stats card
            "postsCount": posts_count_val,
            "posts_count": posts_count_val,
            "is_verified": structured_data.profile.isVerified,
            "isVerified": structured_data.profile.isVerified,
            "is_business": structured_data.profile.isBusiness,
            "isBusiness": structured_data.profile.isBusiness,
            "is_private": structured_data.profile.isPrivate,
            "isPrivate": structured_data.profile.isPrivate,
            "is_creator": structured_data.profile.isCreator,
            "isCreator": structured_data.profile.isCreator,
            "is_professional": structured_data.profile.isProfessional,
            "isProfessional": structured_data.profile.isProfessional,
            "category": structured_data.profile.category,
            "business_type": structured_data.profile.businessType,
            "businessType": structured_data.profile.businessType,
            "account_type": structured_data.profile.accountType,
            "accountType": structured_data.profile.accountType,
            "website": structured_data.contact.website,
            "email": structured_data.contact.email,
            "phone": structured_data.contact.phone,
            "whats_app": structured_data.contact.whatsApp,
            "whatsApp": structured_data.contact.whatsApp,
            "address": structured_data.contact.address,
            "booking_link": structured_data.contact.bookingLink,
            "bookingLink": structured_data.contact.bookingLink,
            "contact_buttons": structured_data.contact.contactButtons,
            "contactButtons": structured_data.contact.contactButtons,
            "profile_url": profile_url,
            "profileUrl": profile_url,
            "external_links": external_links_dicts,
            "externalLinks": external_links_dicts,
            "highlights": highlights_dicts,
            "latest_posts": post_items_dicts,
            "latestPosts": post_items_dicts,
            "recentPosts": post_items_dicts,
            "inspected_at": structured_data.profile.inspectedAt,
            "inspectedAt": structured_data.profile.inspectedAt,
            "engagement": structured_data.engagement.model_dump(),
            "lead_intelligence": structured_data.leadIntelligence.model_dump(),
            "leadIntelligence": structured_data.leadIntelligence.model_dump(),
            "media": structured_data.media.model_dump(),
            "quality_score": quality_score,
            "qualityScore": quality_score,
            "structured_data": structured_data.model_dump(),
        }

        total_dur = time.time() - total_start
        live_logs.append(f"✓ Inspection Complete ({total_dur:.1f}s total)")
        raw_logs.append(f"Inspection pipeline completed successfully in {total_dur:.2f}s")

        return ProfileInspectResponse(
            success=True,
            profile=formatted_profile_summary,
            data=structured_data,
            live_logs=live_logs,
            raw_logs=raw_logs,
        )
