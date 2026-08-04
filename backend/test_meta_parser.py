import asyncio
import re
from app.automation.playwright.browser_manager import BrowserManager

async def test_raw_desc():
    bm = BrowserManager()
    ctx = await bm.create_context()
    
    test_urls = [
        "https://www.instagram.com/p/DbiVdC5CqJH/",
        "https://www.instagram.com/p/DbHgTXTgeRO/",
        "https://www.instagram.com/reel/DbIKkeCKD5P/",
        "https://www.instagram.com/p/DSxG4uvARBw/",
        "https://www.instagram.com/p/DaklC7SgS_f/",
        "https://www.instagram.com/reel/DbA_bc-qsgh/"
    ]
    
    async def inspect(url):
        page = await ctx.new_page()
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=15000)
            await page.wait_for_timeout(1000)
            data = await page.evaluate(r"""() => {
                const metaDesc = document.querySelector("meta[property=\"og:description\"], meta[name=\"description\"]");
                const desc = metaDesc ? metaDesc.getAttribute("content") : "";
                return desc;
            }""")
            return {"url": url, "desc": data}
        except Exception as e:
            return {"url": url, "error": str(e)}
        finally:
            await page.close()
            
    results = await asyncio.gather(*[inspect(u) for u in test_urls])
    for r in results:
        print(f"\nURL: {r['url']}")
        print(f"RAW DESC: {repr(r.get('desc'))}")
        
    await bm.close()

if __name__ == "__main__":
    asyncio.run(test_raw_desc())
