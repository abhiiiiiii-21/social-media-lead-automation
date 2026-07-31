import asyncio
import httpx
import sys
import uuid

async def test_csv_import():
    # 1. First, create a mock campaign to attach leads to
    campaign_id = "test-campaign-" + str(uuid.uuid4())[:8]
    
    async with httpx.AsyncClient(base_url="http://localhost:8000/api") as client:
        # Create campaign
        camp_resp = await client.post("/campaigns/", json={
            "name": "Test CSV Import Campaign",
            "platform": "Instagram",
            "description": "Created by test script"
        })
        if camp_resp.status_code != 200 and camp_resp.status_code != 201:
            print("Failed to create campaign:", camp_resp.text)
            return
            
        campaign = camp_resp.json()
        real_campaign_id = campaign["id"]
        print(f"Created Campaign: {real_campaign_id}")
        
        # 2. Upload CSV
        csv_content = """Instagram Username,Email,Website,Followers,Company
johndoe,john@example.com,https://example.com,1500,John Doe LLC
janedoe,jane@example.com,https://jane.com,3000,Jane Doe Inc
missing_email,,https://missing.com,100,
invalid_email,notanemail,https://invalid.com,200,
missing_username,test@test.com,,500,
johndoe,dup@example.com,,1000,Dup Co
"""
        files = {'file': ('test.csv', csv_content.encode('utf-8'), 'text/csv')}
        upload_resp = await client.post("/import/upload", files=files)
        if upload_resp.status_code != 200:
            print("Failed to upload CSV:", upload_resp.text)
            return
            
        upload_data = upload_resp.json()
        upload_id = upload_data["upload_id"]
        print("Uploaded CSV, Upload ID:", upload_id)
        print("Detected Columns:", upload_data["detected_columns"])
        print("Total Rows:", upload_data["total_rows"])
        
        # 3. Preview CSV
        preview_resp = await client.get(f"/import/{upload_id}/preview")
        if preview_resp.status_code != 200:
            print("Failed to preview CSV:", preview_resp.text)
            return
        
        preview_data = preview_resp.json()
        print("Preview Columns:", preview_data["columns"])
        
        # 4. Map & Validate
        mapping = {
            "Instagram Username": "username",
            "Email": "email",
            "Website": "website",
            "Followers": "followers",
            "Company": "business_name"
        }
        
        validate_resp = await client.post(f"/import/{upload_id}/validate", json={"mapping": mapping})
        if validate_resp.status_code != 200:
            print("Failed to validate CSV:", validate_resp.text)
            return
            
        validate_data = validate_resp.json()
        print("\nValidation Results:")
        print(f"Valid Rows: {validate_data['valid_rows']}")
        print(f"Invalid Rows: {validate_data['invalid_rows']}")
        print(f"Duplicates in CSV: {validate_data['duplicates_in_csv']}")
        print(f"Duplicates in DB: {validate_data['duplicates_in_db']}")
        print(f"Errors: {validate_data['errors']}")
        print(f"Warnings: {validate_data['warnings']}")
        
        # 5. Execute Import
        execute_payload = {
            "campaign_id": real_campaign_id,
            "mapping": mapping,
            "skip_duplicates": True
        }
        execute_resp = await client.post(f"/import/{upload_id}/execute", json=execute_payload)
        if execute_resp.status_code != 200:
            print("Failed to execute import:", execute_resp.text)
            return
            
        execute_data = execute_resp.json()
        print("\nExecution Results:")
        print(f"Rows Imported: {execute_data['rows_imported']}")
        print(f"Rows Skipped: {execute_data['rows_skipped']}")
        print(f"Rows Failed: {execute_data['rows_failed']}")
        
        # 6. Check History
        history_resp = await client.get("/import/history")
        print("\nImport History Count:", len(history_resp.json()["items"]))
        
if __name__ == "__main__":
    asyncio.run(test_csv_import())
