from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class ProfileInspectOptions(BaseModel):
    basic_profile: bool = Field(True, description="Extract username, full name, avatar, bio")
    contact_info: bool = Field(True, description="Extract website, email, phone, whatsapp, address, booking links")
    business_info: bool = Field(True, description="Extract business category, verification status, business account flag")
    followers: bool = Field(True, description="Extract follower count")
    following: bool = Field(True, description="Extract following count")
    posts: bool = Field(True, description="Extract post count")
    external_links: bool = Field(True, description="Extract multi-links, linktree, portfolio URLs")
    highlights: bool = Field(True, description="Extract story highlights metadata and covers")
    recent_posts: bool = Field(True, description="Extract latest 12 posts with deep metadata, timestamps, locations, and media")


class ProfileInspectRequest(BaseModel):
    url_or_username: str = Field(..., description="Instagram profile URL or username")
    options: Optional[ProfileInspectOptions] = Field(default_factory=ProfileInspectOptions)


# --- 1. Profile Information ---
class ProfileInfo(BaseModel):
    username: str
    fullName: Optional[str] = None
    bio: Optional[str] = None
    emojis: List[str] = Field(default_factory=list)
    bioMentions: List[str] = Field(default_factory=list)
    bioHashtags: List[str] = Field(default_factory=list)
    bioLocation: Optional[str] = None
    category: Optional[str] = None
    businessType: Optional[str] = None
    accountType: Optional[str] = "Personal"  # "Personal" | "Creator" | "Business" | "Professional"
    profilePictureUrl: Optional[str] = None
    profilePicturePath: Optional[str] = None
    followers: int = 0
    following: int = 0
    postsCount: int = 0
    isVerified: bool = False
    isPrivate: bool = False
    isBusiness: bool = False
    isCreator: bool = False
    isProfessional: bool = False
    profileUrl: str
    inspectedAt: str


# --- 2. Contact Information ---
class ContactInfo(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsApp: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    bookingLink: Optional[str] = None
    businessCategory: Optional[str] = None
    contactButtons: List[str] = Field(default_factory=list)


# --- 3. External Links ---
class ExternalLinkItem(BaseModel):
    title: Optional[str] = None
    url: str
    type: Optional[str] = "website"


# --- 4. Highlights ---
class HighlightItem(BaseModel):
    id: str
    title: str
    coverImage: Optional[str] = None
    coverImageUrl: Optional[str] = None
    thumbnail: Optional[str] = None
    storyCount: Optional[int] = None
    highlightUrl: Optional[str] = None
    downloadedCover: Optional[str] = None
    localCoverPath: Optional[str] = None
    mediaUrl: Optional[str] = None
    downloadStatus: str = "SUCCESS"


# --- 5. Posts ---
class PostItem(BaseModel):
    id: str
    shortcode: str
    caption: Optional[str] = None
    hashtags: List[str] = Field(default_factory=list)
    mentions: List[str] = Field(default_factory=list)
    taggedAccounts: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    uploadDate: Optional[str] = None
    date: Optional[str] = None
    postUrl: str
    imageUrl: Optional[str] = None
    originalUrl: Optional[str] = None
    originalImageUrl: Optional[str] = None
    videoUrl: Optional[str] = None
    thumbnailUrl: Optional[str] = None
    thumbnail: Optional[str] = None
    mediaType: Optional[str] = "Image"  # "Image" | "Carousel" | "Reel" | "Video"
    carouselCount: Optional[int] = None
    isPinned: bool = False
    isSponsored: bool = False
    isReel: bool = False
    isCarousel: bool = False
    isVideo: bool = False
    isImage: bool = True
    accessibilityText: Optional[str] = None
    altText: Optional[str] = None
    imagePath: Optional[str] = None
    localFilePath: Optional[str] = None
    localPath: Optional[str] = None
    localImagePath: Optional[str] = None
    mediaUrl: Optional[str] = None
    downloadStatus: str = "SUCCESS"  # "SUCCESS" | "FAILED"
    fileSize: Optional[int] = None
    mimeType: Optional[str] = None
    checksum: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    likes: Optional[int] = None
    comments: Optional[int] = None


# --- 6. Engagement Metrics ---
class EngagementMetrics(BaseModel):
    averageLikes: Optional[float] = None
    averageComments: Optional[float] = None
    totalReels: int = 0
    totalImagePosts: int = 0
    totalCarouselPosts: int = 0
    reelPercentage: float = 0.0
    carouselPercentage: float = 0.0
    imagePercentage: float = 0.0
    estimatedEngagementRate: float = 0.0
    postingFrequency: str = "Unknown"


# --- 7. Lead Intelligence (Deterministic for AI Website Generator) ---
class LeadIntelligence(BaseModel):
    profession: Optional[str] = None
    industry: Optional[str] = None
    creatorType: Optional[str] = None
    businessType: Optional[str] = None
    brandStyle: Optional[str] = None
    brandTone: Optional[str] = None
    visualStyle: Optional[str] = None
    contentStyle: Optional[str] = None
    targetAudience: Optional[str] = None
    primaryAudience: Optional[str] = None
    likelyServices: List[str] = Field(default_factory=list)
    luxuryScore: int = 0
    personalBrandScore: int = 0
    businessScore: int = 0
    travelFrequency: Optional[str] = "None"
    primaryCta: Optional[str] = None
    contentCategories: List[str] = Field(default_factory=list)
    estimatedWebsiteStyle: Optional[str] = "Modern Portfolio"
    city: Optional[str] = None
    country: Optional[str] = None
    contactPreference: Optional[str] = None
    bestProfileImage: Optional[str] = None
    bestShowcaseImages: List[str] = Field(default_factory=list)
    brandColors: List[str] = Field(default_factory=list)


# --- 8. Media Assets ---
class DownloadedMediaItem(BaseModel):
    postId: Optional[str] = None
    filePath: str
    type: str = "image"
    url: Optional[str] = None
    mediaUrl: Optional[str] = None
    downloadStatus: str = "SUCCESS"
    fileSize: Optional[int] = None
    mimeType: Optional[str] = None
    checksum: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None


class DownloadedHighlightCover(BaseModel):
    highlightId: Optional[str] = None
    filePath: str
    url: Optional[str] = None
    mediaUrl: Optional[str] = None
    downloadStatus: str = "SUCCESS"
    fileSize: Optional[int] = None
    mimeType: Optional[str] = None
    checksum: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None


class MediaAssets(BaseModel):
    profilePicturePath: Optional[str] = None
    profilePictureUrl: Optional[str] = None
    downloadedPostsCount: int = 0
    downloadedHighlightsCount: int = 0
    postImages: List[DownloadedMediaItem] = Field(default_factory=list)
    highlightCovers: List[DownloadedHighlightCover] = Field(default_factory=list)


# --- 9. Quality Report (Internal Debugging) ---
class QualityBreakdown(BaseModel):
    profile: int = 0
    contact: int = 0
    links: int = 0
    highlights: int = 0
    posts: int = 0
    captions: int = 0
    media: int = 0
    leadIntelligence: int = 0
    jsonValidation: str = "PASS"


class QualityScore(BaseModel):
    extractionScore: int = 0
    overall: int = 0
    breakdown: QualityBreakdown = Field(default_factory=QualityBreakdown)


# --- Root Structured Object ---
class StructuredProfileData(BaseModel):
    profile: ProfileInfo
    contact: ContactInfo
    externalLinks: List[ExternalLinkItem] = Field(default_factory=list)
    highlights: List[HighlightItem] = Field(default_factory=list)
    posts: List[PostItem] = Field(default_factory=list)
    engagement: EngagementMetrics
    leadIntelligence: LeadIntelligence
    media: MediaAssets
    qualityScore: Optional[QualityScore] = None


class ProfileInspectResponse(BaseModel):
    success: bool
    error: Optional[str] = None
    error_type: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None
    data: Optional[StructuredProfileData] = None
    live_logs: List[str] = Field(default_factory=list)
    raw_logs: List[str] = Field(default_factory=list)
