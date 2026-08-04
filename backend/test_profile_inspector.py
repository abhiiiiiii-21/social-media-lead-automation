import asyncio
import json
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.schemas.profile_inspector import (
    ProfileInspectRequest,
    ProfileInspectOptions,
    StructuredProfileData,
)
from app.services.profile_inspector_service import ProfileInspectorService
from app.automation.instagram.engagement import calculate_engagement
from app.automation.instagram.business import infer_business_intelligence
from app.automation.instagram.export import assemble_structured_profile
from app.automation.instagram.quality import calculate_quality_score, format_quality_report


async def test_modules_unit():
    print("--- 1. Testing Modular Calculation, Quality Score & Schema Assembly ---")
    sample_posts = [
        {
            "id": "post_1",
            "shortcode": "C12345",
            "postUrl": "https://instagram.com/p/C12345/",
            "imageUrl": "https://example.com/img1.jpg",
            "originalUrl": "https://example.com/img1_hd.jpg",
            "likes": 500,
            "comments": 25,
            "isReel": False,
            "isCarousel": True,
            "isImage": False,
            "isVideo": False,
            "isPinned": True,
            "isSponsored": False,
            "caption": "Luxury penthouse architecture project in Dubai 📍 Dubai, UAE #luxury #architecture #dubai",
            "date": "2026-08-01T14:30:00.000Z",
            "uploadDate": "2026-08-01T14:30:00.000Z",
            "location": "Dubai, United Arab Emirates",
            "mediaType": "Carousel",
            "carouselCount": 4,
            "hashtags": ["#luxury", "#architecture", "#dubai"],
            "mentions": [],
            "taggedAccounts": ["@client1"],
            "altText": "Photo by Dyslove Design in Dubai with luxury penthouse interior.",
            "accessibilityText": "Photo by Dyslove Design in Dubai with luxury penthouse interior.",
            "width": 1080,
            "height": 1350,
        },
        {
            "id": "post_2",
            "shortcode": "C54321",
            "postUrl": "https://instagram.com/reel/C54321/",
            "imageUrl": "https://example.com/img2.jpg",
            "originalUrl": "https://example.com/img2_hd.jpg",
            "likes": 1200,
            "comments": 80,
            "isReel": True,
            "isCarousel": False,
            "isImage": False,
            "isVideo": True,
            "isPinned": False,
            "isSponsored": False,
            "caption": "Touring our latest bespoke villa project in Palm Jumeirah 📍 Dubai",
            "date": "2026-07-28T10:15:00.000Z",
            "uploadDate": "2026-07-28T10:15:00.000Z",
            "location": "Palm Jumeirah, Dubai",
            "mediaType": "Reel",
            "carouselCount": 1,
            "hashtags": ["#villa", "#dubai"],
            "mentions": ["@palmjumeirah"],
            "taggedAccounts": [],
            "altText": "Video reel of Palm Jumeirah villa",
            "accessibilityText": "Video reel of Palm Jumeirah villa",
            "width": 1080,
            "height": 1920,
        },
    ]

    engagement = calculate_engagement(followers=25000, posts=sample_posts)
    print("Computed Engagement:", json.dumps(engagement, indent=2))
    assert engagement["averageLikes"] == 850.0
    assert engagement["totalReels"] == 1
    assert engagement["totalCarouselPosts"] == 1
    assert engagement["reelPercentage"] == 50.0
    assert engagement["carouselPercentage"] == 50.0
    assert engagement["estimatedEngagementRate"] > 0

    business = infer_business_intelligence(
        username="dyslove.design",
        full_name="Dyslove Design Studio",
        bio="Bespoke Architecture & Luxury Interior Studio 📍 Dubai. Inquiries: hello@dyslove.design",
        category="Interior Design Studio",
        website="https://dyslove.design",
        email="hello@dyslove.design",
        phone="+971501234567",
        whatsapp="971501234567",
        external_links=[{"title": "Website", "url": "https://dyslove.design", "type": "website"}],
        posts=sample_posts,
        avatar_url="https://example.com/avatar.jpg",
    )
    print("Computed Business/Lead Intelligence:", json.dumps(business, indent=2))
    assert business["industry"] == "Architecture & Interior Design"
    assert business["city"] == "Dubai"
    assert business["luxuryScore"] >= 60
    assert business["travelFrequency"] is not None
    assert len(business["brandColors"]) == 3
    assert len(business["likelyServices"]) > 0
    assert business["estimatedWebsiteStyle"] is not None

    # Quality Score test
    quality = calculate_quality_score(
        profile_data={
            "username": "dyslove.design",
            "fullName": "Dyslove Design Studio",
            "bio": "Bespoke Architecture & Luxury Interior Studio 📍 Dubai. Inquiries: hello@dyslove.design",
            "category": "Interior Design Studio",
            "followers": 25000,
            "following": 350,
            "postsCount": 85,
            "profilePictureUrl": "https://example.com/avatar.jpg",
        },
        contact_data={"email": "hello@dyslove.design", "website": "https://dyslove.design"},
        links_data=[{"title": "Website", "url": "https://dyslove.design"}],
        highlights_data=[{"id": "hl_1", "title": "Projects"}],
        posts_data=sample_posts,
        media_data={"profilePicturePath": "storage/media/avatar.jpg", "downloadedPostsCount": 2},
        business_data=business,
    )
    print("Computed Quality Score:", json.dumps(quality, indent=2))
    print(format_quality_report(quality))
    assert quality["overall"] >= 80

    # Test full 8-section assembly
    structured = assemble_structured_profile(
        profile_data={
            "username": "dyslove.design",
            "fullName": "Dyslove Design Studio",
            "bio": "Bespoke Architecture & Luxury Interior Studio 📍 Dubai. Inquiries: hello@dyslove.design",
            "category": "Interior Design Studio",
            "followers": 25000,
            "following": 350,
            "postsCount": 85,
            "isVerified": True,
            "isBusiness": True,
            "isCreator": False,
            "isProfessional": True,
        },
        contact_data={
            "email": "hello@dyslove.design",
            "phone": "+971501234567",
            "whatsApp": "971501234567",
            "website": "https://dyslove.design",
            "contactButtons": ["Email", "Message"],
        },
        links_data=[{"title": "Website", "url": "https://dyslove.design", "type": "website"}],
        highlights_data=[{"id": "hl_1", "title": "Projects", "coverImageUrl": "https://example.com/cover1.jpg", "coverImage": "https://example.com/cover1.jpg"}],
        posts_data=sample_posts,
        engagement_data=engagement,
        business_data=business,
        media_data={
            "profilePicturePath": "storage/media/dyslove.design/profile_pic.jpg",
            "downloadedPostsCount": 2,
            "downloadedHighlightsCount": 1,
            "postImages": [
                {"postId": "post_1", "filePath": "storage/media/dyslove.design/post_1_post_1.jpg", "type": "image", "url": "https://example.com/img1.jpg", "width": 1080, "height": 1350}
            ],
            "highlightCovers": [
                {"highlightId": "hl_1", "filePath": "storage/media/dyslove.design/highlight_1_hl_1.jpg", "url": "https://example.com/cover1.jpg"}
            ],
        },
        quality_data=quality,
    )

    s_dict = structured.model_dump()
    assert "profile" in s_dict
    assert "contact" in s_dict
    assert "externalLinks" in s_dict
    assert "highlights" in s_dict
    assert "posts" in s_dict
    assert "engagement" in s_dict
    assert "leadIntelligence" in s_dict
    assert "media" in s_dict
    assert "qualityScore" in s_dict

    # Check post keys exist
    p0 = s_dict["posts"][0]
    for required_key in ["id", "shortcode", "caption", "date", "uploadDate", "mediaType", "imageUrl", "originalUrl", "videoUrl", "thumbnail", "hashtags", "mentions", "taggedAccounts", "location", "isPinned", "localPath", "width", "height"]:
        assert required_key in p0, f"Missing post key: {required_key}"

    print("✓ Modular calculation, quality score & schema assembly passed successfully!")


async def test_live_modular_inspection():
    print("\n--- 2. Testing Live Modular Profile Inspection ---")
    service = ProfileInspectorService()
    req = ProfileInspectRequest(
        url_or_username="instagram",
        options=ProfileInspectOptions(
            basic_profile=True,
            contact_info=True,
            business_info=True,
            followers=True,
            following=True,
            posts=True,
            external_links=True,
            highlights=True,
            recent_posts=True,
        ),
    )

    print("Starting inspection for @instagram...")
    res = await service.inspect(req)
    print(f"Inspection Success: {res.success}")
    if res.error:
        print(f"Error: {res.error} (Type: {res.error_type})")

    print("\nStep Logs:")
    for l in res.live_logs:
        print(f"  {l}")

    if res.data:
        data_dict = res.data.model_dump()
        print(f"\nProfile: @{data_dict['profile']['username']} (Followers: {data_dict['profile']['followers']:,})")
        print(f"Full Name: {data_dict['profile']['fullName']}")
        print(f"Verified: {data_dict['profile']['isVerified']}")
        print(f"Category: {data_dict['profile']['category']}")
        print(f"External Links ({len(data_dict['externalLinks'])}): {data_dict['externalLinks']}")
        print(f"Highlights ({len(data_dict['highlights'])}): {[h['title'] for h in data_dict['highlights']]}")
        print(f"Posts ({len(data_dict['posts'])}): {[p['id'] for p in data_dict['posts'][:4]]}")
        print(f"Engagement: {data_dict['engagement']}")
        print(f"Quality Score: {data_dict.get('qualityScore')}")
        print(f"Lead Intelligence: {data_dict['leadIntelligence']['industry']}, Tone: {data_dict['leadIntelligence']['brandTone']}, Style: {data_dict['leadIntelligence']['estimatedWebsiteStyle']}")
        print(f"Media Downloads: {data_dict['media']['downloadedPostsCount']} posts, {data_dict['media']['downloadedHighlightsCount']} highlight covers")

    print("\n✓ Live Inspection Test Complete!")


if __name__ == "__main__":
    asyncio.run(test_modules_unit())
    asyncio.run(test_live_modular_inspection())
