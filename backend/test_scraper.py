import asyncio
import httpx

async def test_scraper_apis():
    print("Testing Scraper APIs")
    
    async with httpx.AsyncClient(base_url="http://localhost:8000/api") as client:
        
        print("\n1. GET /scraper/status/fake_campaign_id")
        resp = await client.get("/scraper/status/fake_campaign_id")
        print("GET status:", resp.status_code, resp.json())
        
        print("\n2. POST /scraper/start (Expecting failure due to no DB record/fake campaign id)")
        resp = await client.post("/scraper/start", json={
            "campaign_id": "fake_campaign_id",
            "account_name": "test_account",
            "search_mode": "USERNAME",
            "source_query": "apple, google",
            "max_profiles": 2,
            "max_scrolls": 1
        })
        print("POST start:", resp.status_code, resp.json())
        
        
if __name__ == "__main__":
    asyncio.run(test_scraper_apis())
