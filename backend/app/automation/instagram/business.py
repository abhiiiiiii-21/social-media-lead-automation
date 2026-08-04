import re
from typing import Dict, Any, List, Optional


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


def infer_business_intelligence(
    username: str,
    full_name: Optional[str] = None,
    bio: Optional[str] = None,
    category: Optional[str] = None,
    website: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    whatsapp: Optional[str] = None,
    external_links: Optional[List[Dict[str, Any]]] = None,
    posts: Optional[List[Dict[str, Any]]] = None,
    avatar_url: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Infers deterministic Lead Intelligence to power the downstream AI Website Generator
    derived strictly from real public Instagram signals without hallucination.
    """
    posts = posts or []
    external_links = external_links or []

    combined_text = f"{full_name or ''} {bio or ''} {category or ''}".lower()
    for p in posts[:6]:
        combined_text += f" {p.get('caption', '') or ''}"

    # 1. Profession & Industry
    profession = category or "Creator / Professional"
    industry = "Lifestyle & Digital Media"
    creator_type = "Individual Creator"
    business_type = "Creator Brand"
    likely_services = ["Brand Collaborations", "Digital Content Creation", "Media Inquiries"]
    content_categories = ["Lifestyle", "Personal Brand"]

    if any(k in combined_text for k in ["real estate", "realtor", "broker", "properties", "realty", "homes"]):
        industry = "Real Estate & Property Development"
        profession = category or "Real Estate Specialist"
        creator_type = "Business"
        business_type = "Real Estate Agency / Advisory"
        likely_services = ["Property Acquisition", "Exclusive Listings", "Real Estate Advisory", "Private Showings"]
        content_categories = ["Luxury Properties", "Market Insights", "Architecture"]
    elif any(k in combined_text for k in ["architect", "interior design", "decor", "renovation", "architecture"]):
        industry = "Architecture & Interior Design"
        profession = category or "Architect & Interior Designer"
        creator_type = "Studio / Agency"
        business_type = "Design Studio"
        likely_services = ["Bespoke Interior Design", "Architectural Planning", "Space Renovation", "Project Management"]
        content_categories = ["Interior Design", "Architecture", "Project Showcases"]
    elif any(k in combined_text for k in ["fitness", "coach", "trainer", "workout", "nutrition", "athlete"]):
        industry = "Health, Fitness & Wellness"
        profession = category or "Fitness Coach & Trainer"
        creator_type = "Individual Creator"
        business_type = "Coaching / Wellness Practice"
        likely_services = ["1-on-1 Online Coaching", "Customized Workout Plans", "Nutrition Guidance", "Transformation Programs"]
        content_categories = ["Workouts", "Nutrition", "Motivation"]
    elif any(k in combined_text for k in ["photographer", "photography", "cinematographer", "filmmaker", "visuals"]):
        industry = "Photography & Visual Production"
        profession = category or "Photographer & Visual Artist"
        creator_type = "Individual Creator"
        business_type = "Creative Studio"
        likely_services = ["Editorial Shoots", "Commercial Video Production", "Brand Campaigns", "Private Commissions"]
        content_categories = ["Editorial Photography", "Commercial Shoots", "Behind the Scenes"]
    elif any(k in combined_text for k in ["founder", "ceo", "agency", "marketing", "consulting", "software", "tech"]):
        industry = "Technology & Professional Services"
        profession = category or "Founder & Consultant"
        creator_type = "Business"
        business_type = "Corporate / Agency"
        likely_services = ["Strategic Consulting", "Digital Marketing", "Enterprise Solutions", "Keynote Speaking"]
        content_categories = ["Business Insights", "Tech Innovation", "Leadership"]
    elif any(k in combined_text for k in ["fashion", "model", "stylist", "beauty", "cosmetics"]):
        industry = "Fashion, Beauty & Modeling"
        profession = category or "Fashion & Beauty Creator"
        creator_type = "Individual Creator"
        business_type = "Personal Brand"
        likely_services = ["Brand Ambassadorship", "Style Consulting", "Editorial Modeling", "Product Endorsements"]
        content_categories = ["Fashion Editorial", "Beauty Routines", "Lookbooks"]

    # 2. Location (City & Country)
    city = None
    country = None

    for city_key, (c_name, c_country) in KNOWN_CITIES.items():
        pattern = rf"(?:\b|📍|✈️|based in\s*){re.escape(city_key)}\b"
        if re.search(pattern, combined_text, re.IGNORECASE):
            city = c_name
            country = c_country
            break

    if not city:
        for p in posts:
            loc = p.get("location")
            if loc:
                city = loc.split(",")[0].strip()
                if "," in loc:
                    country = loc.split(",")[-1].strip()
                break

    # 3. Deterministic Scores (Luxury, Personal Brand, Business, Travel)
    luxury_hits = sum(1 for kw in LUXURY_KEYWORDS if kw in combined_text)
    luxury_score = min(100, max(15, luxury_hits * 20))

    travel_hits = sum(1 for kw in TRAVEL_KEYWORDS if kw in combined_text)
    travel_score = min(100, max(10, travel_hits * 22))
    travel_frequency = "High (Frequent International Travel)" if travel_score >= 60 else ("Moderate (Regional)" if travel_score >= 30 else "None")

    is_biz = bool(category or email or phone or whatsapp or "agency" in combined_text or "studio" in combined_text)
    business_score = min(100, 40 + (20 if email else 0) + (20 if website else 0) + (20 if is_biz else 0))
    personal_brand_score = min(100, 50 + (25 if full_name else 0) + (25 if len(posts) > 0 else 0))

    # 4. Brand Style & Visual Tone
    if luxury_score >= 60:
        brand_tone = "Luxury, Bespoke & Editorial"
        brand_style = "Minimal Luxury"
        estimated_website_style = "Minimal Luxury"
    elif "Corporate" in business_type or "Agency" in business_type:
        brand_tone = "Professional, Authoritative & Results-Driven"
        brand_style = "Corporate"
        estimated_website_style = "Corporate"
    elif "Creative" in industry or "Photography" in industry or "Architecture" in industry:
        brand_tone = "Modern, Aesthetic & Creative"
        brand_style = "Creative Agency"
        estimated_website_style = "Modern Portfolio"
    elif "Fitness" in industry:
        brand_tone = "High-Energy, Motivational & Direct"
        brand_style = "Dark Premium"
        estimated_website_style = "Dark Premium"
    elif "Fashion" in industry:
        brand_tone = "Editorial, Chic & Sophisticated"
        brand_style = "Editorial"
        estimated_website_style = "Editorial"
    else:
        brand_tone = "Authentic, Modern & Engaging"
        brand_style = "Modern Portfolio"
        estimated_website_style = "Modern Portfolio"

    # 5. Visual / Content Style
    reel_count = sum(1 for p in posts if p.get("isReel") or "/reel/" in str(p.get("postUrl", "")))
    if reel_count >= len(posts) // 2 and len(posts) > 0:
        content_style = "Short-Form Video Reels & Dynamic Showcases"
        visual_style = "Dynamic Video Showcase"
    else:
        content_style = "Visual Portfolios, Editorial Showcases & Carousels"
        visual_style = "Editorial Grid & High-Res Imagery"

    # 6. Target Audience
    if "Real Estate" in industry:
        primary_audience = "Homebuyers, Property Investors & Luxury Tenants"
    elif "Architecture" in industry:
        primary_audience = "High-End Residential Clients & Commercial Developers"
    elif "Fitness" in industry:
        primary_audience = "Health-Conscious Individuals & Athletes"
    elif "Technology" in industry:
        primary_audience = "Founders, Enterprise Leaders & Tech Innovators"
    elif "Fashion" in industry:
        primary_audience = "Fashion Enthusiasts, Brands & Editorial Publishers"
    else:
        primary_audience = "Target Consumers, Clients & Industry Peers"

    target_audience = primary_audience

    # 7. Primary Call to Action (CTA)
    if whatsapp:
        primary_cta = "Send WhatsApp Message"
        contact_pref = "WhatsApp / Direct Message"
    elif "Real Estate" in industry or "Architecture" in industry:
        primary_cta = "Book a Consultation"
        contact_pref = "Consultation Booking / Inquiry"
    elif website and ("book" in website or "cal" in website):
        primary_cta = "Book an Appointment"
        contact_pref = "Online Booking"
    elif email:
        primary_cta = "Inquire via Email"
        contact_pref = "Email / Contact Form"
    elif website:
        primary_cta = "Visit Portfolio"
        contact_pref = "Website Inquiry"
    else:
        primary_cta = "Send Direct Message"
        contact_pref = "Direct Message (Instagram)"

    # 8. Best Showcase Images for Website
    best_profile_image = avatar_url
    best_showcase_images = []
    for p in posts:
        img_url = p.get("imageUrl") or p.get("thumbnailUrl") or p.get("originalUrl")
        if img_url and img_url not in best_showcase_images:
            best_showcase_images.append(img_url)
            if len(best_showcase_images) >= 6:
                break

    # 9. Brand Color Palettes
    if luxury_score >= 60:
        brand_colors = ["#171717", "#C5A880", "#F5F3EF"]  # Noir & Champagne Gold
    elif "Real Estate" in industry:
        brand_colors = ["#0F172A", "#38BDF8", "#F8FAFC"]  # Deep Navy & Architectural Cyan
    elif "Fitness" in industry:
        brand_colors = ["#18181B", "#EF4444", "#FAFAFA"]  # Bold Carbon & Crimson
    elif "Architecture" in industry:
        brand_colors = ["#262626", "#A8A29E", "#FAFAF9"]  # Concrete & Warm Slate
    elif "Fashion" in industry:
        brand_colors = ["#1A1A1A", "#E2B897", "#FAFAF9"]  # Chic Sable & Silk Rose
    else:
        brand_colors = ["#18181B", "#6366F1", "#F8FAFC"]  # Modern Indigo & Obsidian

    return {
        "profession": profession,
        "industry": industry,
        "creatorType": creator_type,
        "businessType": business_type,
        "brandStyle": brand_style,
        "brandTone": brand_tone,
        "visualStyle": visual_style,
        "contentStyle": content_style,
        "targetAudience": target_audience,
        "primaryAudience": primary_audience,
        "likelyServices": likely_services,
        "luxuryScore": luxury_score,
        "personalBrandScore": personal_brand_score,
        "businessScore": business_score,
        "travelFrequency": travel_frequency,
        "primaryCta": primary_cta,
        "contentCategories": content_categories,
        "estimatedWebsiteStyle": estimated_website_style,
        "city": city,
        "country": country,
        "contactPreference": contact_pref,
        "bestProfileImage": best_profile_image,
        "bestShowcaseImages": best_showcase_images,
        "brandColors": brand_colors,
    }
