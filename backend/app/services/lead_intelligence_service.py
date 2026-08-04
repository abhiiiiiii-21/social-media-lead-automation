import re
from typing import Dict, Any, List, Optional


class LeadIntelligenceService:
    """
    Computes deterministic, rule-based Engagement Metrics and Lead Intelligence
    from publicly extracted Instagram profile data without hallucination.
    """

    LUXURY_KEYWORDS = {
        "luxury", "bespoke", "exclusive", "estate", "penthouse", "architect",
        "couture", "fine art", "curated", "premium", "yacht", "villa", "mansion",
        "haute", "private client", "high-end", "residence", "heritage", "prestige",
        "summit", "artisan", "collector", "signature", "atelier"
    }

    TRAVEL_KEYWORDS = {
        "travel", "wanderlust", "destination", "hotel", "resort", "explore",
        "worldwide", "nomad", "flight", "voyage", "hospitality", "retreat",
        "safari", "island", "adventure", "journey", "global"
    }

    KNOWN_CITIES = {
        "dubai": ("Dubai", "United Arab Emirates"),
        "london": ("London", "United Kingdom"),
        "new york": ("New York", "United States"),
        "nyc": ("New York", "United States"),
        "los angeles": ("Los Angeles", "United States"),
        "la": ("Los Angeles", "United States"),
        "miami": ("Miami", "United States"),
        "paris": ("Paris", "France"),
        "milan": ("Milan", "Italy"),
        "rome": ("Rome", "Italy"),
        "mumbai": ("Mumbai", "India"),
        "delhi": ("Delhi", "India"),
        "bangalore": ("Bangalore", "India"),
        "toronto": ("Toronto", "Canada"),
        "vancouver": ("Vancouver", "Canada"),
        "sydney": ("Sydney", "Australia"),
        "melbourne": ("Melbourne", "Australia"),
        "singapore": ("Singapore", "Singapore"),
        "tokyo": ("Tokyo", "Japan"),
        "berlin": ("Berlin", "Germany"),
        "amsterdam": ("Amsterdam", "Netherlands"),
        "barcelona": ("Barcelona", "Spain"),
        "madrid": ("Madrid", "Spain"),
        "chicago": ("Chicago", "United States"),
        "austin": ("Austin", "United States"),
        "san francisco": ("San Francisco", "United States"),
        "monaco": ("Monaco", "Monaco"),
    }

    def compute_engagement_metrics(
        self, followers: int, posts: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculates likes, comments, post types, and engagement rate."""
        if not posts:
            return {
                "averageLikes": 0.0,
                "averageComments": 0.0,
                "totalReels": 0,
                "totalImagePosts": 0,
                "totalCarouselPosts": 0,
                "engagementRate": 0.0,
                "postingFrequency": "Unknown",
            }

        likes_list = [p.get("likes") for p in posts if p.get("likes") is not None]
        comments_list = [p.get("comments") for p in posts if p.get("comments") is not None]

        avg_likes = round(sum(likes_list) / len(likes_list), 1) if likes_list else 0.0
        avg_comments = round(sum(comments_list) / len(comments_list), 1) if comments_list else 0.0

        total_reels = sum(1 for p in posts if p.get("isReel") or p.get("is_reel") or "/reel/" in str(p.get("postUrl", "")))
        total_carousels = sum(1 for p in posts if p.get("isCarousel") or p.get("is_carousel"))
        total_images = sum(1 for p in posts if (p.get("isImage") or p.get("is_image", True)) and not (p.get("isReel") or p.get("isCarousel")))

        # Engagement Rate calculation
        engagement_rate = 0.0
        if followers > 0 and (avg_likes > 0 or avg_comments > 0):
            engagement_rate = round(((avg_likes + avg_comments) / followers) * 100, 2)

        # Estimate posting frequency based on post count or density
        posting_frequency = "Active Creator (2-4 posts/week)"
        if len(posts) >= 12:
            posting_frequency = "Consistent (3-5 posts/week)"
        elif len(posts) < 3:
            posting_frequency = "Occasional / Selective"

        return {
            "averageLikes": avg_likes,
            "averageComments": avg_comments,
            "totalReels": total_reels,
            "totalImagePosts": total_images,
            "totalCarouselPosts": total_carousels,
            "engagementRate": engagement_rate,
            "postingFrequency": posting_frequency,
        }

    def infer_lead_intelligence(
        self,
        username: str,
        full_name: Optional[str],
        bio: Optional[str],
        category: Optional[str],
        website: Optional[str],
        email: Optional[str],
        phone: Optional[str],
        whatsapp: Optional[str],
        external_links: List[Dict[str, Any]],
        posts: List[Dict[str, Any]],
        avatar_url: Optional[str],
    ) -> Dict[str, Any]:
        """
        Infers profession, industry, tone, scores, and media showcases deterministically.
        """
        combined_text = f"{full_name or ''} {bio or ''} {category or ''}".lower()
        for p in posts[:6]:
            combined_text += f" {p.get('caption', '') or ''}"

        # 1. Profession & Industry
        profession = category or "Creator / Professional"
        industry = "Lifestyle & Digital Media"

        if any(k in combined_text for k in ["real estate", "realtor", "broker", "properties", "realty", "homes"]):
            industry = "Real Estate & Property Development"
            profession = "Real Estate Specialist" if not category else category
        elif any(k in combined_text for k in ["architect", "interior design", "decor", "renovation", "architecture"]):
            industry = "Architecture & Interior Design"
            profession = "Architect & Interior Designer" if not category else category
        elif any(k in combined_text for k in ["fitness", "coach", "trainer", "workout", "nutrition", "athlete"]):
            industry = "Health, Fitness & Wellness"
            profession = "Fitness Coach & Trainer" if not category else category
        elif any(k in combined_text for k in ["photographer", "photography", "cinematographer", "filmmaker"]):
            industry = "Photography & Visual Production"
            profession = "Photographer & Visual Artist" if not category else category
        elif any(k in combined_text for k in ["founder", "ceo", "agency", "marketing", "consulting", "software", "tech"]):
            industry = "Technology & Professional Services"
            profession = "Founder & Consultant" if not category else category
        elif any(k in combined_text for k in ["fashion", "model", "stylist", "beauty", "cosmetics"]):
            industry = "Fashion, Beauty & Modeling"
            profession = "Fashion & Beauty Creator" if not category else category

        # 2. Location (City & Country)
        city = None
        country = None

        # Look for location pin or city names in bio
        for city_key, (c_name, c_country) in self.KNOWN_CITIES.items():
            pattern = rf"(?:\b|📍|✈️|based in\s*){re.escape(city_key)}\b"
            if re.search(pattern, combined_text, re.IGNORECASE):
                city = c_name
                country = c_country
                break

        # Check post locations if city not in bio
        if not city:
            for p in posts:
                loc = p.get("location")
                if loc:
                    city = loc.split(",")[0].strip()
                    if "," in loc:
                        country = loc.split(",")[-1].strip()
                    break

        # 3. Luxury & Travel Scores
        luxury_hits = sum(1 for kw in self.LUXURY_KEYWORDS if kw in combined_text)
        luxury_score = min(100, max(20, luxury_hits * 18))

        travel_hits = sum(1 for kw in self.TRAVEL_KEYWORDS if kw in combined_text)
        travel_score = min(100, max(15, travel_hits * 20))

        # 4. Brand Tone
        if luxury_score >= 60:
            brand_tone = "Professional, High-End & Editorial"
        elif "fitness" in combined_text or "coach" in combined_text:
            brand_tone = "High-Energy, Motivational & Direct"
        elif "creative" in combined_text or "design" in combined_text or "art" in combined_text:
            brand_tone = "Modern, Aesthetic & Creative"
        else:
            brand_tone = "Authentic, Modern & Engaging"

        # 5. Content Style
        reel_count = sum(1 for p in posts if p.get("isReel") or "/reel/" in str(p.get("postUrl", "")))
        if reel_count >= len(posts) // 2 and len(posts) > 0:
            content_style = "High-Impact Video Reels & Short-Form Narratives"
        else:
            content_style = "Visual Portfolios, Editorial Showcases & Carousels"

        # 6. Business Focus & Audience
        if "Real Estate" in industry:
            business_focus = "Property Acquisitions, Listings & Client Consultations"
            primary_audience = "Homebuyers, Property Investors & Luxury Tenants"
        elif "Architecture" in industry:
            business_focus = "Custom Architectural Projects & Interior Design Commissions"
            primary_audience = "High-End Residential Clients & Commercial Developers"
        elif "Fitness" in industry:
            business_focus = "Online Coaching, Training Programs & Lifestyle Memberships"
            primary_audience = "Health-Conscious Individuals & Athletes"
        else:
            business_focus = "Brand Collaborations, Digital Services & Direct Inquiries"
            primary_audience = "Target Consumers, Clients & Industry Peers"

        # 7. Contact Methods
        contact_methods = []
        if email:
            contact_methods.append("Email")
        if phone:
            contact_methods.append("Phone")
        if whatsapp:
            contact_methods.append("WhatsApp")
        if website or external_links:
            contact_methods.append("Website / Linktree")
        contact_methods.append("Direct Message (Instagram)")

        # 8. Best Images Selection
        best_profile_image = avatar_url
        best_property_images = []
        for p in posts:
            img_url = p.get("imageUrl") or p.get("image_url") or p.get("thumbnailUrl")
            if img_url and img_url not in best_property_images:
                best_property_images.append(img_url)
                if len(best_property_images) >= 5:
                    break

        # 9. Brand Colors (Derived from industry and tone)
        if luxury_score >= 60:
            brand_colors = ["#171717", "#C5A880", "#F5F3EF"]  # Noir & Champagne Gold
        elif "Real Estate" in industry:
            brand_colors = ["#0F172A", "#38BDF8", "#F8FAFC"]  # Deep Navy & Architectural Cyan
        elif "Fitness" in industry:
            brand_colors = ["#18181B", "#EF4444", "#FAFAFA"]  # Bold Carbon & Crimson
        elif "Architecture" in industry:
            brand_colors = ["#262626", "#A8A29E", "#FAFAF9"]  # Concrete & Warm Slate
        else:
            brand_colors = ["#18181B", "#6366F1", "#F8FAFC"]  # Modern Indigo & Obsidian

        return {
            "profession": profession,
            "industry": industry,
            "city": city,
            "country": country,
            "brandTone": brand_tone,
            "contentStyle": content_style,
            "luxuryScore": luxury_score,
            "travelScore": travel_score,
            "businessFocus": business_focus,
            "primaryAudience": primary_audience,
            "contactMethods": contact_methods,
            "bestProfileImage": best_profile_image,
            "bestPropertyImages": best_property_images,
            "brandColors": brand_colors,
        }
