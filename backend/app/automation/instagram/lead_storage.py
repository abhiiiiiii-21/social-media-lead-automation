from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lead import Lead


async def store_lead(
    session: AsyncSession, 
    campaign_id: str, 
    source_query: str, 
    search_mode: str, 
    profile_data: Dict[str, Any]
) -> bool:
    """
    Stores a parsed profile as a Lead.
    Returns True if inserted/updated, False if it was skipped (e.g. strict duplicate).
    """
    username = profile_data.get("username")
    if not username:
        return False
        
    # Check for exact duplicate in this campaign
    stmt = select(Lead).where(Lead.campaign_id == campaign_id, Lead.username == username)
    result = await session.execute(stmt)
    existing_lead = result.scalars().first()
    
    if existing_lead:
        # Duplicate detection strategy: We currently skip strictly based on username.
        # Future enhancement: Update existing record based on duplicate policy
        return False
        
    # Prepare URL
    profile_url = f"https://www.instagram.com/{username}/"
    
    # Clean up values
    bio = profile_data.get("bio")
    if bio and len(bio) > 1000:
        bio = bio[:1000]
        
    lead = Lead(
        campaign_id=campaign_id,
        platform="Instagram",
        username=username,
        full_name=profile_data.get("full_name"),
        business_name=profile_data.get("business_name"),
        bio=bio,
        followers=profile_data.get("followers", 0),
        following=profile_data.get("following", 0),
        website=profile_data.get("website"),
        email=profile_data.get("external_email"),
        phone=profile_data.get("external_phone"),
        category=profile_data.get("category"),
        profile_url=profile_url,
        profile_image=profile_data.get("profile_image"),
        source=f"{search_mode}:{source_query}",
        qualification_status="PENDING"
    )
    
    session.add(lead)
    await session.commit()
    
    return True
