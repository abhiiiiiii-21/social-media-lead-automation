from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.schemas.profile_inspector import (
    StructuredProfileData,
    ProfileInfo,
    ContactInfo,
    ExternalLinkItem,
    HighlightItem,
    PostItem,
    EngagementMetrics,
    LeadIntelligence,
    MediaAssets,
    DownloadedMediaItem,
    DownloadedHighlightCover,
    QualityScore,
    QualityBreakdown,
)


def assemble_structured_profile(
    profile_data: Dict[str, Any],
    contact_data: Dict[str, Any],
    links_data: List[Dict[str, Any]],
    highlights_data: List[Dict[str, Any]],
    posts_data: List[Dict[str, Any]],
    engagement_data: Dict[str, Any],
    business_data: Dict[str, Any],
    media_data: Dict[str, Any],
    quality_data: Optional[Dict[str, Any]] = None,
) -> StructuredProfileData:
    """
    Assembles the validated 8-section structured profile ensuring every single key
    strictly exists with null/default fallbacks and zero missing fields.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    username = profile_data.get("username", "")
    profile_url = profile_data.get("profileUrl") or f"https://www.instagram.com/{username}/"

    # 1. Profile Info
    profile_info = ProfileInfo(
        username=username,
        fullName=profile_data.get("fullName"),
        bio=profile_data.get("bio"),
        emojis=profile_data.get("emojis", []),
        bioMentions=profile_data.get("bioMentions", []),
        bioHashtags=profile_data.get("bioHashtags", []),
        bioLocation=profile_data.get("bioLocation"),
        category=profile_data.get("category"),
        businessType=profile_data.get("businessType"),
        accountType=profile_data.get("accountType", "Personal"),
        profilePictureUrl=profile_data.get("profilePictureUrl"),
        profilePicturePath=media_data.get("profilePicturePath"),
        followers=profile_data.get("followers", 0),
        following=profile_data.get("following", 0),
        postsCount=profile_data.get("postsCount", 0),
        isVerified=bool(profile_data.get("isVerified", False)),
        isPrivate=bool(profile_data.get("isPrivate", False)),
        isBusiness=bool(profile_data.get("isBusiness", False)),
        isCreator=bool(profile_data.get("isCreator", False)),
        isProfessional=bool(profile_data.get("isProfessional", False)),
        profileUrl=profile_url,
        inspectedAt=profile_data.get("inspectedAt", now_iso),
    )

    # 2. Contact Info
    contact_info = ContactInfo(
        email=contact_data.get("email"),
        phone=contact_data.get("phone"),
        whatsApp=contact_data.get("whatsApp"),
        website=contact_data.get("website") or (links_data[0]["url"] if links_data else None),
        address=contact_data.get("address"),
        bookingLink=contact_data.get("bookingLink"),
        businessCategory=contact_data.get("businessCategory") or profile_data.get("category"),
        contactButtons=contact_data.get("contactButtons", []),
    )

    # 3. External Links
    external_links = [
        ExternalLinkItem(
            title=item.get("title"),
            url=item.get("url", ""),
            type=item.get("type", "website"),
        )
        for item in links_data
    ]

    # 4. Highlights
    hl_path_map = {item.get("highlightId"): item for item in media_data.get("highlightCovers", [])}
    highlights_list = []
    for hl in highlights_data:
        hl_id = hl.get("id", "")
        media_item = hl_path_map.get(hl_id, {})
        highlights_list.append(
            HighlightItem(
                id=hl_id,
                title=hl.get("title", ""),
                coverImage=hl.get("coverImage") or hl.get("coverImageUrl") or hl.get("thumbnail"),
                coverImageUrl=hl.get("coverImageUrl") or hl.get("coverImage") or hl.get("thumbnail"),
                thumbnail=hl.get("thumbnail") or hl.get("coverImageUrl") or hl.get("coverImage"),
                storyCount=hl.get("storyCount"),
                highlightUrl=hl.get("highlightUrl") or f"https://www.instagram.com/stories/highlights/{hl_id}/",
                downloadedCover=hl.get("downloadedCover") or media_item.get("filePath"),
                localCoverPath=hl.get("localCoverPath") or media_item.get("filePath"),
                mediaUrl=hl.get("mediaUrl") or media_item.get("mediaUrl"),
                downloadStatus=hl.get("downloadStatus") or media_item.get("downloadStatus", "SUCCESS"),
            )
        )

    # 5. Posts (Strictly mapping all metadata, media validations, and preserving null likes/comments)
    post_path_map = {item.get("postId"): item for item in media_data.get("postImages", [])}
    posts_list = []
    for p in posts_data:
        p_id = p.get("id", "")
        media_item = post_path_map.get(p_id, {})
        file_path = p.get("imagePath") or p.get("localFilePath") or media_item.get("filePath")
        status = p.get("downloadStatus") or media_item.get("downloadStatus", "SUCCESS")
        web_url = p.get("mediaUrl") or media_item.get("mediaUrl")

        posts_list.append(
            PostItem(
                id=p_id,
                shortcode=p.get("shortcode") or p_id,
                caption=p.get("caption"),
                hashtags=p.get("hashtags", []),
                mentions=p.get("mentions", []),
                taggedAccounts=p.get("taggedAccounts", []),
                location=p.get("location"),
                uploadDate=p.get("uploadDate") or p.get("date"),
                date=p.get("date") or p.get("uploadDate"),
                postUrl=p.get("postUrl", ""),
                imageUrl=p.get("imageUrl"),
                originalUrl=p.get("originalUrl") or p.get("imageUrl"),
                originalImageUrl=p.get("originalImageUrl") or p.get("originalUrl") or p.get("imageUrl"),
                videoUrl=p.get("videoUrl"),
                thumbnail=p.get("thumbnail") or p.get("imageUrl"),
                thumbnailUrl=p.get("thumbnailUrl") or p.get("imageUrl"),
                mediaType=p.get("mediaType", "Image"),
                carouselCount=p.get("carouselCount"),
                isPinned=bool(p.get("isPinned", False)),
                isSponsored=bool(p.get("isSponsored", False)),
                isReel=bool(p.get("isReel", False)),
                isCarousel=bool(p.get("isCarousel", False)),
                isVideo=bool(p.get("isVideo", False)),
                isImage=bool(p.get("isImage", True)),
                accessibilityText=p.get("accessibilityText") or p.get("altText"),
                altText=p.get("altText") or p.get("accessibilityText"),
                imagePath=file_path,
                localFilePath=file_path,
                localPath=file_path,
                localImagePath=file_path,
                mediaUrl=web_url,
                downloadStatus=status,
                fileSize=p.get("fileSize") or media_item.get("fileSize"),
                mimeType=p.get("mimeType") or media_item.get("mimeType"),
                checksum=p.get("checksum") or media_item.get("checksum"),
                width=p.get("width") or media_item.get("width"),
                height=p.get("height") or media_item.get("height"),
                likes=p.get("likes"),
                comments=p.get("comments"),
            )
        )

    # 6. Engagement Metrics
    engagement_model = EngagementMetrics(
        averageLikes=engagement_data.get("averageLikes"),
        averageComments=engagement_data.get("averageComments"),
        totalReels=engagement_data.get("totalReels", 0),
        totalImagePosts=engagement_data.get("totalImagePosts", 0),
        totalCarouselPosts=engagement_data.get("totalCarouselPosts", 0),
        reelPercentage=engagement_data.get("reelPercentage", 0.0),
        carouselPercentage=engagement_data.get("carouselPercentage", 0.0),
        imagePercentage=engagement_data.get("imagePercentage", 0.0),
        estimatedEngagementRate=engagement_data.get("estimatedEngagementRate", 0.0),
        postingFrequency=engagement_data.get("postingFrequency", "Unknown"),
    )

    # 7. Lead Intelligence (Deterministic for AI Website Generator)
    lead_intel_model = LeadIntelligence(
        profession=business_data.get("profession"),
        industry=business_data.get("industry"),
        creatorType=business_data.get("creatorType"),
        businessType=business_data.get("businessType"),
        brandStyle=business_data.get("brandStyle"),
        brandTone=business_data.get("brandTone"),
        visualStyle=business_data.get("visualStyle"),
        contentStyle=business_data.get("contentStyle"),
        targetAudience=business_data.get("targetAudience"),
        primaryAudience=business_data.get("primaryAudience"),
        likelyServices=business_data.get("likelyServices", []),
        luxuryScore=business_data.get("luxuryScore", 0),
        personalBrandScore=business_data.get("personalBrandScore", 0),
        businessScore=business_data.get("businessScore", 0),
        travelFrequency=business_data.get("travelFrequency", "None"),
        primaryCta=business_data.get("primaryCta"),
        contentCategories=business_data.get("contentCategories", []),
        estimatedWebsiteStyle=business_data.get("estimatedWebsiteStyle", "Modern Portfolio"),
        city=business_data.get("city"),
        country=business_data.get("country"),
        contactPreference=business_data.get("contactPreference"),
        bestProfileImage=business_data.get("bestProfileImage"),
        bestShowcaseImages=business_data.get("bestShowcaseImages", []),
        brandColors=business_data.get("brandColors", []),
    )

    # 8. Media Assets
    media_model = MediaAssets(
        profilePicturePath=media_data.get("profilePicturePath"),
        profilePictureUrl=media_data.get("profilePictureUrl"),
        downloadedPostsCount=media_data.get("downloadedPostsCount", 0),
        downloadedHighlightsCount=media_data.get("downloadedHighlightsCount", 0),
        postImages=[
            DownloadedMediaItem(
                postId=item.get("postId"),
                filePath=item.get("filePath", ""),
                type=item.get("type", "image"),
                url=item.get("url"),
                mediaUrl=item.get("mediaUrl"),
                downloadStatus=item.get("downloadStatus", "SUCCESS"),
                fileSize=item.get("fileSize"),
                mimeType=item.get("mimeType"),
                checksum=item.get("checksum"),
                width=item.get("width"),
                height=item.get("height"),
            )
            for item in media_data.get("postImages", [])
        ],
        highlightCovers=[
            DownloadedHighlightCover(
                highlightId=item.get("highlightId"),
                filePath=item.get("filePath", ""),
                url=item.get("url"),
                mediaUrl=item.get("mediaUrl"),
                downloadStatus=item.get("downloadStatus", "SUCCESS"),
                fileSize=item.get("fileSize"),
                mimeType=item.get("mimeType"),
                checksum=item.get("checksum"),
                width=item.get("width"),
                height=item.get("height"),
            )
            for item in media_data.get("highlightCovers", [])
        ],
    )

    # 9. Scraper Quality Score
    quality_model = None
    if quality_data:
        b_data = quality_data.get("breakdown", {})
        quality_model = QualityScore(
            extractionScore=quality_data.get("extractionScore") or quality_data.get("overall", 0),
            overall=quality_data.get("overall", 0),
            breakdown=QualityBreakdown(
                profile=b_data.get("profile", 0),
                contact=b_data.get("contact", 0),
                links=b_data.get("links", 0),
                highlights=b_data.get("highlights", 0),
                posts=b_data.get("posts", 0),
                captions=b_data.get("captions", 0),
                media=b_data.get("media", 0),
                leadIntelligence=b_data.get("leadIntelligence", 0),
                jsonValidation=b_data.get("jsonValidation", "PASS"),
            ),
        )

    return StructuredProfileData(
        profile=profile_info,
        contact=contact_info,
        externalLinks=external_links,
        highlights=highlights_list,
        posts=posts_list,
        engagement=engagement_model,
        leadIntelligence=lead_intel_model,
        media=media_model,
        qualityScore=quality_model,
    )
