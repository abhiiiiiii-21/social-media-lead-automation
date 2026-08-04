export interface QualityBreakdown {
  profile: number;
  contact: number;
  links: number;
  highlights: number;
  posts: number;
  captions: number;
  media: number;
  leadIntelligence: number;
  jsonValidation: string;
}

export interface QualityScore {
  extractionScore?: number;
  overall: number;
  breakdown: QualityBreakdown;
}

export interface InstagramLead {
  id: string;
  name: string;
  handle: string;
  followers: number;
  following: number;
  posts: number;
  category: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
  location: string;
  engagementRate: number;
  isVerified: boolean;
  avatarUrl: string;
  scrapedAt: string;
  status: "New" | "Contacted" | "Bounced";
  qualityScore: number;
}

export interface InstagramPost {
  id: string;
  shortcode?: string | null;
  imageUrl?: string | null;
  originalUrl?: string | null;
  caption?: string | null;
  likes?: number | null;
  comments?: number | null;
  timestamp?: string | null;
  date?: string | null;
  uploadDate?: string | null;
  postUrl?: string;
  videoUrl?: string | null;
  thumbnail?: string | null;
  thumbnailUrl?: string | null;
  isReel?: boolean;
  isCarousel?: boolean;
  isImage?: boolean;
  isVideo?: boolean;
  isPinned?: boolean;
  isSponsored?: boolean;
  hashtags?: string[];
  mentions?: string[];
  taggedAccounts?: string[];
  location?: string | null;
  altText?: string | null;
  accessibilityText?: string | null;
  mediaType?: string | null;
  carouselCount?: number | null;
  localPath?: string | null;
  localImagePath?: string | null;
  localFilePath?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface ExternalLink {
  title?: string | null;
  url: string;
  type?: string | null;
}

export interface HighlightItem {
  id: string;
  title: string;
  coverImage?: string | null;
  coverImageUrl?: string | null;
  thumbnail?: string | null;
  storyCount?: number | null;
  highlightUrl?: string | null;
  downloadedCover?: string | null;
  localCoverPath?: string | null;
}

export interface EngagementMetrics {
  averageLikes?: number | null;
  averageComments?: number | null;
  totalReels: number;
  totalImagePosts: number;
  totalCarouselPosts: number;
  reelPercentage: number;
  carouselPercentage: number;
  imagePercentage: number;
  estimatedEngagementRate: number;
  postingFrequency: string;
}

export interface LeadIntelligence {
  profession?: string | null;
  industry?: string | null;
  creatorType?: string | null;
  businessType?: string | null;
  brandStyle?: string | null;
  brandTone?: string | null;
  visualStyle?: string | null;
  contentStyle?: string | null;
  targetAudience?: string | null;
  primaryAudience?: string | null;
  likelyServices: string[];
  luxuryScore: number;
  personalBrandScore?: number;
  businessScore?: number;
  travelFrequency?: string | null;
  primaryCta?: string | null;
  contentCategories?: string[];
  estimatedWebsiteStyle?: string | null;
  city?: string | null;
  country?: string | null;
  contactPreference?: string | null;
  bestProfileImage?: string | null;
  bestShowcaseImages: string[];
  brandColors: string[];
}

export interface DownloadedMediaItem {
  postId?: string | null;
  filePath: string;
  type: string;
  url?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface DownloadedHighlightCover {
  highlightId?: string | null;
  filePath: string;
  url?: string | null;
}

export interface MediaAssets {
  profilePicturePath?: string | null;
  downloadedPostsCount: number;
  downloadedHighlightsCount: number;
  postImages: DownloadedMediaItem[];
  highlightCovers: DownloadedHighlightCover[];
}

export interface StructuredProfileData {
  profile: {
    username: string;
    fullName?: string | null;
    bio?: string | null;
    emojis?: string[];
    bioMentions?: string[];
    bioHashtags?: string[];
    bioLocation?: string | null;
    category?: string | null;
    businessType?: string | null;
    accountType?: string | null;
    profilePictureUrl?: string | null;
    followers: number;
    following: number;
    postsCount: number;
    isVerified: boolean;
    isPrivate: boolean;
    isBusiness: boolean;
    isCreator: boolean;
    isProfessional: boolean;
    profileUrl: string;
    inspectedAt: string;
  };
  contact: {
    email?: string | null;
    phone?: string | null;
    whatsApp?: string | null;
    website?: string | null;
    address?: string | null;
    bookingLink?: string | null;
    businessCategory?: string | null;
    contactButtons: string[];
  };
  externalLinks: ExternalLink[];
  highlights: HighlightItem[];
  posts: InstagramPost[];
  engagement: EngagementMetrics;
  leadIntelligence: LeadIntelligence;
  media: MediaAssets;
  qualityScore?: QualityScore | null;
}

export interface ProfileSummaryData {
  id?: string;
  username: string;
  fullName?: string | null;
  avatarUrl?: string;
  profilePictureUrl?: string;
  followers: number;
  following: number;
  posts: number;
  postsCount?: number;
  isBusiness: boolean;
  isVerified: boolean;
  isPrivate?: boolean;
  category?: string | null;
  bio?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsApp?: string | null;
  address?: string | null;
  externalLinks?: (string | ExternalLink)[];
  highlights?: HighlightItem[];
  latestPosts?: InstagramPost[];
  profileUrl?: string;
  inspectedAt?: string;
  structured_data?: StructuredProfileData | any;
}

export interface InstagramProfile {
  id: string;
  username: string;
  avatarUrl: string;
  fullName?: string;
  followers?: number;
  following?: number;
  posts?: number;
  isBusiness?: boolean;
  isVerified?: boolean;
  category?: string;
  bio?: string;
  website?: string;
  email?: string;
  phone?: string;
  externalLinks?: (string | ExternalLink)[];
  latestPosts?: InstagramPost[];
}

export interface OutreachCampaign {
  id: string;
  name: string;
  status: string;
}

export interface ScrapedLead {
  id: string;
  username: string;
  fullName?: string;
  name?: string;
  handle?: string;
  followers: number;
  following: number;
  posts?: number;
  postsCount?: number;
  category?: string;
  email?: string;
  phone?: string;
  website?: string;
  bio?: string;
  location?: string;
  engagementRate?: number;
  isVerified?: boolean;
  isBusiness?: boolean;
  avatarUrl?: string;
  scrapedAt?: string;
  status?: string;
  qualityScore: number;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type CampaignStatus = "Draft" | "Running" | "Paused" | "Completed" | "Failed" | "Connecting" | string;

export interface ScrapingCampaign {
  id: string;
  name?: string;
  status: string;
  target?: string;
  leadsScraped?: number;
  totalLeads?: number;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export type ScraperType = "AI Discovery" | "Comment Scraper" | "Hashtag Scraper" | "Profile Scraper";

export interface ScrapingConfig {
  campaignName?: string;
  targetCustomer?: string;
  postUrl?: string;
  hashtag?: string;
  profileUrl?: string;
  limit?: number;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
