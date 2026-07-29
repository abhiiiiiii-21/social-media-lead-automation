import { QualificationStatus, LeadSource, HealthStatus } from "../types/results";

export const QUALIFICATION_STATUS_OPTIONS: { label: string; value: QualificationStatus }[] = [
  { label: "Qualified", value: "Qualified" },
  { label: "Rejected", value: "Rejected" },
  { label: "Needs Review", value: "Needs Review" },
  { label: "Contacted", value: "Contacted" }
];

export const LEAD_SOURCE_OPTIONS: { label: string; value: LeadSource }[] = [
  { label: "AI Discovery", value: "AI Discovery" },
  { label: "Profile Scraper", value: "Profile Scraper" },
  { label: "Hashtag Scraper", value: "Hashtag Scraper" },
  { label: "Comment Scraper", value: "Comment Scraper" },
  { label: "Similar Accounts", value: "Similar Accounts" },
  { label: "Followers", value: "Followers" },
  { label: "Following", value: "Following" },
];

export const HEALTH_STATUS_OPTIONS: { label: string; value: HealthStatus }[] = [
  { label: "Excellent", value: "Excellent" },
  { label: "Good", value: "Good" },
  { label: "Average", value: "Average" },
  { label: "Poor", value: "Poor" }
];

export const BUSINESS_CATEGORIES = [
  "Real Estate",
  "Brokerage",
  "Software",
  "Marketing",
  "Restaurant",
  "Retail",
  "Consulting",
  "Other"
];

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Other"
];
