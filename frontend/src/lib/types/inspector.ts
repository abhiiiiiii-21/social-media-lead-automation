import { ProfileSummaryData, StructuredProfileData } from "./instagram";

export interface ExtractionOptions {
  basicProfile: boolean;
  contactInfo: boolean;
  businessInfo: boolean;
  followers: boolean;
  following: boolean;
  posts: boolean;
  externalLinks: boolean;
  highlights: boolean;
  recentPosts: boolean;
}

export const DEFAULT_EXTRACTION_OPTIONS: ExtractionOptions = {
  basicProfile: true,
  contactInfo: true,
  businessInfo: true,
  followers: true,
  following: true,
  posts: true,
  externalLinks: true,
  highlights: true,
  recentPosts: true,
};

export type InspectionStep =
  | "idle"
  | "opening"
  | "loading"
  | "extracting"
  | "contact"
  | "saving"
  | "completed"
  | "error";

export type InspectionErrorType =
  | "PROFILE_NOT_FOUND"
  | "PRIVATE_ACCOUNT"
  | "CHALLENGE_REQUIRED"
  | "RATE_LIMITED"
  | "LOGIN_EXPIRED"
  | "INVALID_INPUT"
  | "SCRAPE_ERROR"
  | "UNKNOWN";

export interface InspectionLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "playwright";
}

export interface ProfileInspectRequestPayload {
  url_or_username: string;
  options: {
    basic_profile: boolean;
    contact_info: boolean;
    business_info: boolean;
    followers: boolean;
    following: boolean;
    posts: boolean;
    external_links: boolean;
    highlights: boolean;
    recent_posts: boolean;
  };
}

export interface ProfileInspectResponsePayload {
  success: boolean;
  error?: string | null;
  error_type?: InspectionErrorType | null;
  profile?: ProfileSummaryData | null;
  data?: StructuredProfileData | null;
  live_logs: string[];
  raw_logs: string[];
}
