from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger

from app.models.lead import Lead


async def store_lead(
    session: AsyncSession, 
    campaign_id: str, 
    source_query: str, 
    search_mode: str, 
    profile_data: Dict[str, Any],
    qualification_status: str = "QUALIFIED"
) -> bool:
    """
    Stores a parsed profile as a Lead in the database.
    Returns True if newly inserted, False if it was skipped as a duplicate.
    """
    username = (profile_data.get("username") or "").strip().lower()
    if not username:
        return False
        
    # Check for exact duplicate in this campaign
    stmt = select(Lead).where(Lead.campaign_id == campaign_id, Lead.username == username)
    result = await session.execute(stmt)
    existing_lead = result.scalars().first()
    
    if existing_lead:
        # Exact duplicate in this campaign
        logger.debug(f"Lead @{username} already exists in campaign {campaign_id}, skipping.")
        return False
        
    # Clean and sanitize fields
    profile_url = profile_data.get("profile_url") or f"https://www.instagram.com/{username}/"
    
    bio = profile_data.get("bio")
    if bio and len(bio) > 1500:
        bio = bio[:1500]

    email = profile_data.get("external_email") or profile_data.get("email")
    phone = profile_data.get("external_phone") or profile_data.get("phone")
    full_name = profile_data.get("full_name") or profile_data.get("name")
    category = profile_data.get("category")
    business_name = profile_data.get("business_name") or full_name
    website = profile_data.get("website")
    profile_image = profile_data.get("profile_image")
    city = profile_data.get("city")
    state = profile_data.get("state")
    country = profile_data.get("country")
    
    lead = Lead(
        campaign_id=campaign_id,
        platform="Instagram",
        username=username,
        full_name=full_name,
        business_name=business_name,
        bio=bio,
        followers=int(profile_data.get("followers") or 0),
        following=int(profile_data.get("following") or 0),
        website=website,
        email=email,
        phone=phone,
        city=city,
        state=state,
        country=country,
        category=category,
        profile_url=profile_url,
        profile_image=profile_image,
        source=f"{search_mode}:{source_query}" if source_query else search_mode,
        qualification_status=qualification_status
    )
    
    session.add(lead)
    await session.commit()
    logger.info(f"Successfully stored lead @{username} in database for campaign {campaign_id}")
    return True
