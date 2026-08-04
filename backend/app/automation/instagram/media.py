import os
import hashlib
import mimetypes
import asyncio
from typing import Optional, List, Dict, Any, Tuple
import httpx
from loguru import logger

try:
    from PIL import Image as PILImage
except ImportError:
    PILImage = None

from app.automation.playwright.constants import DEFAULT_USER_AGENT


class MediaDownloader:
    """
    Downloads and rigorously validates high-resolution Instagram media assets:
    - Original highest quality post images/videos
    - Avatar pictures
    - Highlight covers
    
    Validation Checks:
    ✓ File exists on disk
    ✓ File size > 0
    ✓ Image width > 0 and height > 0
    ✓ Image can be opened and verified via PIL
    ✓ Re-downloads on validation failure (up to 3 retries)
    
    Extracts and stores:
    - downloadStatus ("SUCCESS" | "FAILED")
    - fileSize (bytes)
    - width & height
    - mimeType
    - checksum (sha256)
    - mediaUrl (static served web path: /media/{user}/{filename})
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

    def _validate_and_inspect(self, file_path: str) -> Tuple[bool, int, Optional[int], Optional[int], Optional[str], Optional[str]]:
        """
        Validates file integrity and extracts fileSize, width, height, mimeType, and sha256 checksum.
        Returns: (is_valid, file_size, width, height, mime_type, checksum)
        """
        if not os.path.exists(file_path):
            return False, 0, None, None, None, None

        file_size = os.path.getsize(file_path)
        if file_size <= 0:
            return False, file_size, None, None, None, None

        # Compute sha256 checksum
        checksum = None
        try:
            sha256 = hashlib.sha256()
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(65536), b""):
                    sha256.update(chunk)
            checksum = sha256.hexdigest()
        except Exception:
            pass

        # Guess MIME type
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = "image/jpeg"

        # Validate image dimensions and openability using PIL
        width = None
        height = None
        if PILImage:
            try:
                with PILImage.open(file_path) as img:
                    img.verify()  # Verifies file integrity
                # Reopen to read dimensions since verify() closes image
                with PILImage.open(file_path) as img:
                    width, height = img.width, img.height
                    if img.format:
                        mime_type = f"image/{img.format.lower()}"

                if width is not None and width > 0 and height is not None and height > 0:
                    return True, file_size, width, height, mime_type, checksum
                else:
                    return False, file_size, width, height, mime_type, checksum
            except Exception as e:
                logger.debug(f"Image validation failed for {file_path}: {e}")
                return False, file_size, None, None, mime_type, checksum

        return True, file_size, width, height, mime_type, checksum

    async def _download_with_retry(
        self, client: httpx.AsyncClient, url: str, target_path: str, max_retries: int = 3
    ) -> Dict[str, Any]:
        """
        Downloads a media file with validation and retries.
        """
        if not url or url.startswith("data:") or not url.startswith("http"):
            return {
                "success": False,
                "status": "FAILED",
                "filePath": target_path,
                "fileSize": 0,
                "width": None,
                "height": None,
                "mimeType": None,
                "checksum": None,
            }

        for attempt in range(1, max_retries + 1):
            try:
                response = await client.get(url, timeout=15.0, follow_redirects=True)
                if response.status_code == 200 and len(response.content) > 100:
                    with open(target_path, "wb") as f:
                        f.write(response.content)

                    # Validate immediately
                    is_valid, file_size, w, h, mime, csum = self._validate_and_inspect(target_path)
                    if is_valid:
                        return {
                            "success": True,
                            "status": "SUCCESS",
                            "filePath": target_path,
                            "fileSize": file_size,
                            "width": w,
                            "height": h,
                            "mimeType": mime,
                            "checksum": csum,
                        }
                    else:
                        logger.warning(f"File validation failed on attempt {attempt}/{max_retries} for {target_path}. Retrying...")
                else:
                    logger.debug(f"HTTP {response.status_code} for {url} on attempt {attempt}/{max_retries}")
            except Exception as e:
                logger.debug(f"Download attempt {attempt}/{max_retries} failed for {url}: {e}")

            if attempt < max_retries:
                await asyncio.sleep(0.3 * attempt)

        # If all retries fail, check if any existing file is valid
        is_valid, file_size, w, h, mime, csum = self._validate_and_inspect(target_path)
        return {
            "success": is_valid,
            "status": "SUCCESS" if is_valid else "FAILED",
            "filePath": target_path,
            "fileSize": file_size,
            "width": w,
            "height": h,
            "mimeType": mime,
            "checksum": csum,
        }

    async def download_all(
        self,
        username: str,
        avatar_url: Optional[str] = None,
        posts: Optional[List[Dict[str, Any]]] = None,
        highlights: Optional[List[Dict[str, Any]]] = None,
        max_posts_to_download: int = 12,
    ) -> Dict[str, Any]:
        """
        Concurrently downloads and validates original high-resolution media assets.
        """
        clean_user = "".join(c for c in username if c.isalnum() or c in "._-").lower()
        target_dir = self._ensure_dir(username)
        profile_pic_path: Optional[str] = None
        profile_pic_url_served: Optional[str] = None
        downloaded_post_images: List[Dict[str, Any]] = []
        downloaded_highlight_covers: List[Dict[str, Any]] = []

        posts = posts or []
        highlights = highlights or []

        async with httpx.AsyncClient(headers=self.headers, verify=False) as client:
            tasks = []

            # 1. Profile Picture Task
            if avatar_url:
                avatar_dest = os.path.join(target_dir, "profile_pic.jpg")
                tasks.append(("avatar", None, avatar_url, avatar_dest, None, f"/media/{clean_user}/profile_pic.jpg"))

            # 2. High Resolution Post Media Tasks
            for i, post in enumerate(posts[:max_posts_to_download]):
                post_img_url = post.get("originalImageUrl") or post.get("originalUrl") or post.get("imageUrl") or post.get("thumbnailUrl")
                post_id = post.get("id") or f"post_{i+1}"
                if post_img_url:
                    clean_id = "".join(c for c in post_id if c.isalnum() or c in "_-")
                    filename = f"post_{i+1}_{clean_id}.jpg"
                    post_dest = os.path.join(target_dir, filename)
                    media_web_url = f"/media/{clean_user}/{filename}"
                    tasks.append(("post", post_id, post_img_url, post_dest, post, media_web_url))

            # 3. Highlights Cover Tasks
            for i, hl in enumerate(highlights[:10]):
                cover_url = hl.get("coverImage") or hl.get("coverImageUrl")
                hl_id = hl.get("id") or f"hl_{i+1}"
                if cover_url:
                    clean_hl_id = "".join(c for c in hl_id if c.isalnum() or c in "_-")
                    filename = f"highlight_{i+1}_{clean_hl_id}.jpg"
                    hl_dest = os.path.join(target_dir, filename)
                    media_web_url = f"/media/{clean_user}/{filename}"
                    tasks.append(("highlight", hl_id, cover_url, hl_dest, hl, media_web_url))

            # Execute downloads concurrently with retries and validation
            download_coroutines = [
                self._download_with_retry(client, t[2], t[3]) for t in tasks
            ]
            results = await asyncio.gather(*download_coroutines, return_exceptions=True)

            for task_info, res in zip(tasks, results):
                tag, item_id, original_url, dest_path, ref_obj, web_url = task_info
                
                if isinstance(res, dict):
                    status = res.get("status", "SUCCESS" if res.get("success") else "FAILED")
                    file_size = res.get("fileSize")
                    w = res.get("width")
                    h = res.get("height")
                    mime = res.get("mimeType")
                    checksum = res.get("checksum")
                    is_ok = res.get("success", False)

                    if tag == "avatar":
                        if is_ok:
                            profile_pic_path = dest_path
                            profile_pic_url_served = web_url

                    elif tag == "post":
                        downloaded_post_images.append({
                            "postId": item_id,
                            "filePath": dest_path,
                            "mediaUrl": web_url if is_ok else None,
                            "type": "image",
                            "url": original_url,
                            "downloadStatus": status,
                            "fileSize": file_size,
                            "mimeType": mime,
                            "checksum": checksum,
                            "width": w,
                            "height": h,
                        })
                        if ref_obj is not None:
                            ref_obj["imagePath"] = dest_path if is_ok else None
                            ref_obj["localFilePath"] = dest_path if is_ok else None
                            ref_obj["localPath"] = dest_path if is_ok else None
                            ref_obj["localImagePath"] = dest_path if is_ok else None
                            ref_obj["mediaUrl"] = web_url if is_ok else None
                            ref_obj["originalImageUrl"] = original_url
                            ref_obj["downloadStatus"] = status
                            ref_obj["fileSize"] = file_size
                            ref_obj["mimeType"] = mime
                            ref_obj["checksum"] = checksum
                            if w:
                                ref_obj["width"] = w
                            if h:
                                ref_obj["height"] = h

                    elif tag == "highlight":
                        downloaded_highlight_covers.append({
                            "highlightId": item_id,
                            "filePath": dest_path,
                            "mediaUrl": web_url if is_ok else None,
                            "url": original_url,
                            "downloadStatus": status,
                            "fileSize": file_size,
                            "mimeType": mime,
                            "checksum": checksum,
                            "width": w,
                            "height": h,
                        })
                        if ref_obj is not None:
                            ref_obj["downloadedCover"] = dest_path if is_ok else None
                            ref_obj["localCoverPath"] = dest_path if is_ok else None
                            ref_obj["mediaUrl"] = web_url if is_ok else None
                            ref_obj["downloadStatus"] = status

        return {
            "profilePicturePath": profile_pic_path,
            "profilePictureUrl": profile_pic_url_served,
            "downloadedPostsCount": len([p for p in downloaded_post_images if p["downloadStatus"] == "SUCCESS"]),
            "downloadedHighlightsCount": len([h for h in downloaded_highlight_covers if h["downloadStatus"] == "SUCCESS"]),
            "postImages": downloaded_post_images,
            "highlightCovers": downloaded_highlight_covers,
        }
