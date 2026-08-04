import os
import asyncio
from typing import Optional, List, Dict, Any
import httpx
from loguru import logger

from app.automation.playwright.constants import DEFAULT_USER_AGENT


class MediaDownloader:
    """
    Asynchronously downloads Instagram profile pictures, post images, and thumbnails
    locally into backend/storage/media/{username}/.
    """

    def __init__(self, base_storage_dir: str = "storage/media"):
        self.base_storage_dir = base_storage_dir
        self.headers = {
            "User-Agent": DEFAULT_USER_AGENT,
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.instagram.com/",
        }

    def _ensure_dir(self, username: str) -> str:
        clean_user = "".join(c for c in username if c.isalnum() or c in "._-").lower()
        target_dir = os.path.join(self.base_storage_dir, clean_user)
        os.makedirs(target_dir, exist_ok=True)
        return target_dir

    async def _download_file(
        self, client: httpx.AsyncClient, url: str, target_path: str
    ) -> Optional[str]:
        if not url or url.startswith("data:") or not url.startswith("http"):
            return None
        try:
            response = await client.get(url, timeout=10.0, follow_redirects=True)
            if response.status_code == 200 and len(response.content) > 100:
                with open(target_path, "wb") as f:
                    f.write(response.content)
                return target_path
        except Exception as e:
            logger.debug(f"Media download failed for {url}: {e}")
        return None

    async def download_profile_media(
        self,
        username: str,
        avatar_url: Optional[str],
        posts: List[Dict[str, Any]],
        max_posts_to_download: int = 12,
    ) -> Dict[str, Any]:
        """
        Downloads avatar and up to max_posts_to_download post images.
        Returns a dictionary matching the MediaAssets schema.
        """
        target_dir = self._ensure_dir(username)
        profile_pic_path: Optional[str] = None
        downloaded_post_images: List[Dict[str, Any]] = []

        async with httpx.AsyncClient(headers=self.headers, verify=False) as client:
            tasks = []

            # 1. Profile Picture Task
            if avatar_url:
                avatar_dest = os.path.join(target_dir, "profile_pic.jpg")
                tasks.append(
                    ("avatar", None, avatar_url, avatar_dest)
                )

            # 2. Post Images Tasks
            for i, post in enumerate(posts[:max_posts_to_download]):
                post_img_url = post.get("image_url") or post.get("imageUrl") or post.get("thumbnail_url")
                post_id = post.get("id") or f"post_{i+1}"
                if post_img_url:
                    clean_id = "".join(c for c in post_id if c.isalnum() or c in "_-")
                    post_dest = os.path.join(target_dir, f"post_{i+1}_{clean_id}.jpg")
                    tasks.append(
                        ("post", post_id, post_img_url, post_dest)
                    )

            # Execute all downloads concurrently
            download_coroutines = [
                self._download_file(client, t[2], t[3]) for t in tasks
            ]
            results = await asyncio.gather(*download_coroutines, return_exceptions=True)

            for task_info, res in zip(tasks, results):
                tag, item_id, original_url, dest_path = task_info
                if isinstance(res, str) and res:
                    if tag == "avatar":
                        profile_pic_path = res
                    elif tag == "post":
                        downloaded_post_images.append({
                            "postId": item_id,
                            "filePath": res,
                            "type": "image",
                            "url": original_url,
                        })

        return {
            "profilePicturePath": profile_pic_path,
            "downloadedPostsCount": len(downloaded_post_images),
            "postImages": downloaded_post_images,
        }
