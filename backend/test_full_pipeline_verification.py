import asyncio
import json
import os
from app.services.profile_inspector_service import ProfileInspectorService
from app.schemas.profile_inspector import ProfileInspectRequest, ProfileInspectOptions

async def run_verification():
    service = ProfileInspectorService()
    req = ProfileInspectRequest(
        url_or_username="mizoislive",
        options=ProfileInspectOptions(
            external_links=True,
            contact_info=True,
            highlights=True,
            recent_posts=True,
            engagement=True,
            business_intelligence=True,
        )
    )
    
    print("Starting full pipeline inspection test on 'mizoislive'...")
    res = await service.inspect(req)
    
    print(f"\nInspection Success: {res.success}")
    if not res.success:
        print(f"Error: {res.error}")
        return
        
    posts = res.profile.get("latest_posts", [])
    print(f"\nTotal Posts Extracted: {len(posts)}")
    
    seen_ids = set()
    seen_urls = set()
    seen_paths = set()
    
    has_duplicates = False
    alt_text_captions = False
    
    print("\n" + "="*80)
    print(f"{'#':<3} | {'Type':<8} | {'Likes':<8} | {'Pinned':<7} | {'Image File':<25} | {'Caption (Real)'}")
    print("="*80)
    
    for idx, p in enumerate(posts):
        p_id = p.get("id")
        media_type = p.get("mediaType")
        likes = p.get("likes")
        is_pinned = p.get("isPinned")
        local_path = p.get("imagePath")
        img_url = p.get("imageUrl")
        caption = p.get("caption") or ""
        
        # Check duplicates
        if p_id in seen_ids:
            print(f"DUPLICATE ID: {p_id}")
            has_duplicates = True
        seen_ids.add(p_id)
        
        if img_url in seen_urls:
            print(f"DUPLICATE IMAGE URL: {img_url}")
            has_duplicates = True
        seen_urls.add(img_url)
        
        if local_path in seen_paths:
            print(f"DUPLICATE LOCAL PATH: {local_path}")
            has_duplicates = True
        seen_paths.add(local_path)
        
        if caption.lower().startswith("photo by") or caption.lower().startswith("video by"):
            alt_text_captions = True
            
        file_name = os.path.basename(local_path) if local_path else "None"
        cap_preview = (caption[:45] + "...") if len(caption) > 45 else (caption if caption else "[null]")
        
        print(f"{idx+1:<3} | {media_type:<8} | {str(likes):<8} | {str(is_pinned):<7} | {file_name:<25} | {cap_preview}")
        
    print("="*80)
    
    print(f"\nUniqueness Verification:")
    print(f"- Total Unique Post IDs: {len(seen_ids)}/{len(posts)}")
    print(f"- Total Unique Image URLs: {len(seen_urls)}/{len(posts)}")
    print(f"- Total Unique Local Paths: {len(seen_paths)}/{len(posts)}")
    print(f"- Any Duplicate Media Detected: {'YES (FAIL)' if has_duplicates else 'NO (PASS)'}")
    print(f"- Any Accessibility Text In Captions: {'YES (FAIL)' if alt_text_captions else 'NO (PASS)'}")
    
    # Verify image files on disk
    print("\nMedia File Validation:")
    all_files_valid = True
    for p in posts:
        lp = p.get("imagePath")
        if lp and os.path.exists(lp):
            sz = os.path.getsize(lp)
            w = p.get("width")
            h = p.get("height")
            if sz > 0:
                print(f"  ✓ {os.path.basename(lp)}: {sz} bytes ({w}x{h})")
            else:
                print(f"  ✗ {os.path.basename(lp)}: EMPTY FILE")
                all_files_valid = False
        else:
            print(f"  ✗ Missing file: {lp}")
            all_files_valid = False
            
    print(f"\nAll Downloaded Media Valid: {'YES (PASS)' if all_files_valid else 'NO (FAIL)'}")

if __name__ == "__main__":
    asyncio.run(run_verification())
