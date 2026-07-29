export type ScraperType = 
  | "AI Discovery"
  | "Comment Scraper"
  | "Hashtag Scraper"
  | "Profile Scraper";

export type CampaignStatus = "Pending" | "Connecting" | "Collecting" | "Removing Duplicates" | "Enriching" | "Scoring" | "Saving" | "Completed" | "Failed";

export interface ScrapingConfig {
  [key: string]: any;
}

export interface ScrapingMetrics {
  qualified: number;
  rejected: number;
  websitesFound: number;
  emailsFound: number;
  phonesFound: number;
  averageQualityScore: number;
}

export interface ScrapingCampaign {
  id: string;
  name: string;
  scraperType: ScraperType;
  status: CampaignStatus;
  targetCount: number;
  collectedCount: number;
  config: ScrapingConfig;
  startedAt: string;
  completedAt?: string;
  metrics?: ScrapingMetrics;
}

export interface ScrapedLead {
  id: string;
  campaignId: string;
  username: string;
  fullName: string;
  followers: number;
  following: number;
  bio: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  category: string | null;
  location: string | null;
  isBusiness: boolean;
  isVerified: boolean;
  avatarUrl: string;
  scrapedAt: string;
  status: "New" | "Contacted" | "Bounced";
  qualityScore: number; // 0 to 100
}
