import asyncio
import httpx

async def test_session_manager():
    print("Testing Session Management Endpoints")
    
    async with httpx.AsyncClient(base_url="http://localhost:8000/api") as client:
        
        print("\n1. Create fake session in DB (simulate login)")
        # We can't really login since we don't have an instagram account for the bot
        # So we'll skip actual login, but let's test fetching accounts
        
        resp = await client.get("/accounts")
        print("GET /accounts:", resp.status_code, resp.json())
        
        
if __name__ == "__main__":
    asyncio.run(test_session_manager())
