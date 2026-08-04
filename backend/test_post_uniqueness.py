import asyncio
from app.automation.playwright.browser_manager import BrowserManager

async def test_grid_and_post_pages():
    bm = BrowserManager()
    ctx = await bm.create_context()
    page = await ctx.new_page()
    await page.goto("https://www.instagram.com/mizoislive/", wait_until="domcontentloaded", timeout=25000)
    await page.wait_for_timeout(2000)
    
    # 1. Extract all grid posts
    grid_posts = await page.evaluate(r"""() => {
        const anchors = Array.from(document.querySelectorAll("a[href*=\"/p/\"], a[href*=\"/reel/\"]"));
        const seen = new Set();
        const items = [];
        for (const a of anchors) {
            const href = a.getAttribute("href") || "";
            const match = href.match(/\/(?:p|reel)\/([^\/\?]+)/);
            if (!match) continue;
            const shortcode = match[1];
            if (seen.has(shortcode)) continue;
            seen.add(shortcode);
            
            const img = a.querySelector("img");
            let imgUrl = null;
            let altText = null;
            if (img) {
                altText = img.getAttribute("alt") || null;
                const srcset = img.getAttribute("srcset");
                if (srcset) {
                    const entries = srcset.split(",").map(s => s.trim().split(" "));
                    if (entries.length > 0) imgUrl = entries[entries.length - 1][0];
                }
                if (!imgUrl) imgUrl = img.src;
            }
            
            const isReel = href.includes("/reel/");
            const isCarousel = Boolean(a.querySelector("svg[aria-label*=\"Carousel\" i], svg[aria-label*=\"Sidecar\" i]"));
            const isVideo = isReel || Boolean(a.querySelector("svg[aria-label*=\"Video\" i]"));
            const isImage = !isReel && !isVideo && !isCarousel;
            
            let mediaType = "Image";
            if (isReel) mediaType = "Reel";
            else if (isCarousel) mediaType = "Carousel";
            else if (isVideo) mediaType = "Video";
            
            const isPinned = Boolean(a.querySelector("svg[aria-label*=\"Pin\" i], span[title*=\"Pin\" i], path[d*=\"M12 2\"]"));
            
            items.push({
                id: shortcode,
                shortcode: shortcode,
                postUrl: href.startsWith("http") ? href : `https://www.instagram.com${href}`,
                imageUrl: imgUrl,
                originalUrl: imgUrl,
                originalImageUrl: imgUrl,
                thumbnailUrl: imgUrl,
                thumbnail: imgUrl,
                mediaType: mediaType,
                isReel: isReel,
                isCarousel: isCarousel,
                isVideo: isVideo,
                isImage: isImage,
                isPinned: isPinned,
                caption: null,
                altText: altText,
                date: null
            });
        }
        return items;
    }""")
    
    print(f"Extracted {len(grid_posts)} grid posts from profile page.")
    
    # 2. Inspect posts
    async def inspect_post_page(post):
        p_page = await ctx.new_page()
        try:
            await p_page.goto(post["postUrl"], wait_until="domcontentloaded", timeout=12000)
            await p_page.wait_for_timeout(800)
            
            details = await p_page.evaluate(r"""() => {
                let caption = null;
                const captionEl = document.querySelector("div[data-testid=\"post-comment-root\"], article h1, article span[dir=\"auto\"]");
                if (captionEl) {
                    let raw = (captionEl.innerText || "").trim();
                    if (raw && !/^photo by|^video by|^may be an image/i.test(raw)) {
                        caption = raw;
                    }
                }
                
                const timeEl = document.querySelector("time[datetime]");
                const date = timeEl ? timeEl.getAttribute("datetime") : null;
                
                let hdImg = null;
                const imgEl = document.querySelector("article img[src*=\"cdninstagram.com\"], article img");
                if (imgEl) {
                    const srcset = imgEl.getAttribute("srcset");
                    if (srcset) {
                        const entries = srcset.split(",").map(s => s.trim().split(" "));
                        if (entries.length > 0) hdImg = entries[entries.length - 1][0];
                    }
                    if (!hdImg) hdImg = imgEl.src;
                }
                
                return { caption, date, hdImg };
            }""")
            
            if details:
                if details.get("caption"):
                    post["caption"] = details["caption"]
                if details.get("date"):
                    post["date"] = details["date"]
                if details.get("hdImg") and not details["hdImg"].startswith("data:"):
                    post["imageUrl"] = details["hdImg"]
                    post["originalUrl"] = details["hdImg"]
                    post["originalImageUrl"] = details["hdImg"]
        except Exception:
            pass
        finally:
            await p_page.close()
            
    for i in range(0, min(6, len(grid_posts)), 2):
        batch = grid_posts[i:i+2]
        await asyncio.gather(*[inspect_post_page(p) for p in batch])
        
    print("\n--- RESULTS ---")
    for i, p in enumerate(grid_posts[:6]):
        p_id = p.get('id')
        p_url = p.get('postUrl')
        p_img = p.get('imageUrl')
        p_cap = p.get('caption')
        p_date = p.get('date')
        print(f"Post {i+1}:")
        print(f"  ID: {p_id}")
        print(f"  PostURL: {p_url}")
        print(f"  ImageURL: {p_img[:70] if p_img else None}")
        print(f"  Caption: {repr(p_cap[:60]) if p_cap else None}")
        print(f"  Date: {p_date}")
        
    img_urls = [p.get("imageUrl") for p in grid_posts[:6] if p.get("imageUrl")]
    print(f"\nUnique images: {len(set(img_urls))}/{len(img_urls)} (All unique: {len(set(img_urls)) == len(img_urls)})")
    
    await bm.close()

if __name__ == "__main__":
    asyncio.run(test_grid_and_post_pages())
