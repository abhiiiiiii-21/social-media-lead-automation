export type LeadSource = "AI Discovery" | "Profile Scraper" | "Hashtag Scraper" | "Comment Scraper" | "Similar Accounts" | "Followers" | "Following";

export type EnrichmentStatus = "Fully Enriched" | "Partial" | "Not Enriched";

export type HealthStatus = "Excellent" | "Good" | "Average" | "Poor";

export type QualificationStatus = 
  | 'Qualified' 
  | 'Needs Review' 
  | 'Rejected' 
  | 'Saved' 
  | 'In CRM' 
  | 'Contacted' 
  | 'Meeting Booked' 
  | 'Closed';

export interface TimelineEvent {
  id: string;
  time: Date;
  event: string;
}

export interface AiReasoning {
  positive: string[];
  negative: string[];
  strengths?: string[];
  weaknesses?: string[];
  recommendedAction?: string;
  priority?: "High" | "Medium" | "Low";
  suggestedStrategy?: string;
}

export interface DuplicateInfo {
  isDuplicate: boolean;
  reason?: "Duplicate with Campaign #4" | "Already Contacted" | "Already in CRM";
}

export interface WebsiteAnalysis {
  seo: number;
  performance: number;
  mobile: number;
  accessibility: number;
  design: number;
  conversionScore: number;
  screenshotUrl: string;
}

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface InstagramPost {
  id: string;
  imageUrl: string;
  caption?: string;
  likes?: number;
  comments?: number;
  timestamp?: string;
  postUrl?: string;
}

export interface ExternalLink {
  title?: string;
  url: string;
  type?: string;
}

export interface ResultLead {
  id: string;
  avatarUrl: string;
  username: string;
  fullName?: string | null;
  businessName: string | null;
  isBusinessAccount?: boolean;
  isVerified?: boolean;
  category: string;
  followers: number;
  following: number;
  posts: number;
  bio: string;
  
  // Contact
  website: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  address: string | null;
  facebook: string | null;
  linkedin: string | null;
  externalLinks?: (string | ExternalLink)[];
  latestPosts?: InstagramPost[];
  
  // AI & Scoring
  aiScore: number;
  aiConfidence: number;
  health: HealthStatus;
  status: QualificationStatus;
  aiReasoning: AiReasoning;
  
  // Meta
  source: LeadSource;
  enrichmentStatus: EnrichmentStatus;
  dateFound: Date;
  duplicateInfo?: DuplicateInfo;
  websiteAnalysis?: WebsiteAnalysis;
  
  // CRM
  tags: Tag[];
  internalNotes: string | null;
  lastEdited?: Date;
  addedBy?: string;
  timeline: TimelineEvent[];
}

