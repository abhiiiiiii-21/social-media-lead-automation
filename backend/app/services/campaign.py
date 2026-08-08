import csv
import io
import json
from typing import Optional, Sequence, Tuple, List, Dict, Any

from sqlalchemy import desc, asc, func, select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BaseAppException
from app.models.campaign import Campaign
from app.models.lead import Lead
from app.schemas.campaign import CampaignCreate, CampaignUpdate


class CampaignService:
    @staticmethod
    async def get_campaigns(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        status: Optional[str] = None,
    ) -> Tuple[List[Dict[str, Any]], int]:
        # Count total campaigns
        count_query = select(func.count(Campaign.id))
        if status:
            count_query = count_query.where(Campaign.status == status)
        total = await db.scalar(count_query) or 0

        # Subquery for lead counts per campaign
        lead_count_subq = (
            select(Lead.campaign_id, func.count(Lead.id).label("lead_count"))
            .group_by(Lead.campaign_id)
            .subquery()
        )

        query = (
            select(
                Campaign,
                func.coalesce(lead_count_subq.c.lead_count, 0).label("lead_count")
            )
            .outerjoin(lead_count_subq, Campaign.id == lead_count_subq.c.campaign_id)
        )
        if status:
            query = query.where(Campaign.status == status)

        query = query.order_by(desc(Campaign.created_at)).offset(skip).limit(limit)
        result = await db.execute(query)
        rows = result.all()

        campaign_list = []
        for campaign, lead_count in rows:
            c_dict = {
                "id": campaign.id,
                "name": campaign.name,
                "platform": campaign.platform,
                "status": campaign.status,
                "description": campaign.description,
                "config": campaign.config or {},
                "created_at": campaign.created_at,
                "updated_at": campaign.updated_at,
                "lead_count": lead_count,
            }
            # Parse config from description if empty
            if (not c_dict["config"] or len(c_dict["config"]) == 0) and campaign.description:
                try:
                    c_dict["config"] = json.loads(campaign.description)
                except Exception:
                    pass
            c_dict["scraper_type"] = (
                c_dict["config"].get("scraperType") or 
                c_dict["config"].get("search_mode") or 
                "Comment Scraper"
            )
            campaign_list.append(c_dict)

        return campaign_list, total

    @staticmethod
    async def get_campaign(db: AsyncSession, campaign_id: str) -> Dict[str, Any]:
        result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
        campaign = result.scalar_one_or_none()
        if not campaign:
            raise BaseAppException(message="Campaign not found", status_code=404)
            
        # Get lead count
        lead_count = await db.scalar(
            select(func.count(Lead.id)).where(Lead.campaign_id == campaign_id)
        ) or 0

        c_dict = {
            "id": campaign.id,
            "name": campaign.name,
            "platform": campaign.platform,
            "status": campaign.status,
            "description": campaign.description,
            "config": campaign.config or {},
            "created_at": campaign.created_at,
            "updated_at": campaign.updated_at,
            "lead_count": lead_count,
        }
        if (not c_dict["config"] or len(c_dict["config"]) == 0) and campaign.description:
            try:
                c_dict["config"] = json.loads(campaign.description)
            except Exception:
                pass
        c_dict["scraper_type"] = (
            c_dict["config"].get("scraperType") or 
            c_dict["config"].get("search_mode") or 
            "Comment Scraper"
        )
        return c_dict

    @staticmethod
    async def create_campaign(
        db: AsyncSession, campaign_in: CampaignCreate
    ) -> Campaign:
        dump = campaign_in.model_dump()
        config = dump.get("config") or {}
        if config and not dump.get("description"):
            dump["description"] = json.dumps(config)
        campaign = Campaign(**dump)
        db.add(campaign)
        await db.commit()
        await db.refresh(campaign)
        return campaign

    @staticmethod
    async def update_campaign(
        db: AsyncSession, campaign_id: str, campaign_in: CampaignUpdate
    ) -> Campaign:
        result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
        campaign = result.scalar_one_or_none()
        if not campaign:
            raise BaseAppException(message="Campaign not found", status_code=404)

        update_data = campaign_in.model_dump(exclude_unset=True)
        config = update_data.get("config")
        if config is not None and "description" not in update_data:
            update_data["description"] = json.dumps(config)

        for field, value in update_data.items():
            setattr(campaign, field, value)

        await db.commit()
        await db.refresh(campaign)
        return campaign

    @staticmethod
    async def delete_campaign(db: AsyncSession, campaign_id: str) -> None:
        result = await db.execute(select(Campaign).where(Campaign.id == campaign_id))
        campaign = result.scalar_one_or_none()
        if not campaign:
            raise BaseAppException(message="Campaign not found", status_code=404)
        await db.delete(campaign)
        await db.commit()

    @staticmethod
    async def get_campaign_leads(
        db: AsyncSession,
        campaign_id: str,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        qualification_status: Optional[str] = None,
        sort_by: Optional[str] = "created_at",
        sort_order: Optional[str] = "desc"
    ) -> Tuple[Sequence[Lead], int]:
        """
        Retrieves real leads stored in the database for a campaign with search, filter, and sort.
        """
        query = select(Lead).where(Lead.campaign_id == campaign_id)

        if qualification_status and qualification_status.lower() != "all":
            query = query.where(Lead.qualification_status.ilike(f"%{qualification_status}%"))

        if search and search.strip():
            term = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Lead.username.ilike(term),
                    Lead.full_name.ilike(term),
                    Lead.business_name.ilike(term),
                    Lead.bio.ilike(term),
                    Lead.category.ilike(term),
                    Lead.email.ilike(term),
                    Lead.phone.ilike(term),
                    Lead.city.ilike(term),
                    Lead.country.ilike(term),
                )
            )

        # Count filtered total
        count_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(count_query) or 0

        # Sorting
        sort_column = getattr(Lead, sort_by or "created_at", Lead.created_at)
        if (sort_order or "desc").lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        leads = result.scalars().all()

        return leads, total

    @staticmethod
    async def export_campaign_leads(
        db: AsyncSession,
        campaign_id: str,
        export_format: str = "csv"
    ) -> Tuple[str, str]:
        """
        Exports all real leads for a campaign into CSV or JSON string format.
        Returns (content, media_type).
        """
        query = select(Lead).where(Lead.campaign_id == campaign_id).order_by(desc(Lead.created_at))
        result = await db.execute(query)
        leads = result.scalars().all()

        if export_format.lower() == "json":
            lead_dicts = [
                {
                    "id": l.id,
                    "campaign_id": l.campaign_id,
                    "platform": l.platform,
                    "username": l.username,
                    "full_name": l.full_name,
                    "business_name": l.business_name,
                    "bio": l.bio,
                    "followers": l.followers,
                    "following": l.following,
                    "website": l.website,
                    "email": l.email,
                    "phone": l.phone,
                    "city": l.city,
                    "state": l.state,
                    "country": l.country,
                    "category": l.category,
                    "profile_url": l.profile_url,
                    "profile_image": l.profile_image,
                    "source": l.source,
                    "qualification_status": l.qualification_status,
                    "created_at": l.created_at.isoformat() if l.created_at else None,
                }
                for l in leads
            ]
            return json.dumps(lead_dicts, indent=2), "application/json"

        # CSV format
        output = io.StringIO()
        fieldnames = [
            "username", "full_name", "business_name", "followers", "following",
            "email", "phone", "website", "category", "city", "country",
            "qualification_status", "profile_url", "bio", "source", "created_at"
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for l in leads:
            writer.writerow({
                "username": l.username,
                "full_name": l.full_name or "",
                "business_name": l.business_name or "",
                "followers": l.followers,
                "following": l.following,
                "email": l.email or "",
                "phone": l.phone or "",
                "website": l.website or "",
                "category": l.category or "",
                "city": l.city or "",
                "country": l.country or "",
                "qualification_status": l.qualification_status,
                "profile_url": l.profile_url or "",
                "bio": (l.bio or "").replace("\n", " "),
                "source": l.source,
                "created_at": l.created_at.isoformat() if l.created_at else "",
            })

        return output.getvalue(), "text/csv"
