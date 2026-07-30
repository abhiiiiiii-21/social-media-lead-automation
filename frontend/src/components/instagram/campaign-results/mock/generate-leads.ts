/**
 * @BACKEND_REPLACEMENT_TARGET
 * This file contains MOCK DATA used for frontend development.
 * It should be removed and replaced with real API calls during backend integration.
 */
import { ResultLead, HealthStatus, QualificationStatus, LeadSource, EnrichmentStatus, Tag } from "../types/results";
import { BUSINESS_CATEGORIES, COUNTRIES } from "../constants/filters";

const FIRST_NAMES = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const DOMAINS = ["com", "net", "org", "co", "io", "ai", "realestate"];
const TAGS: Tag[] = [
  { id: "1", label: "Luxury", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { id: "2", label: "Florida", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { id: "3", label: "Realtor", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { id: "4", label: "High Value", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { id: "5", label: "Commercial", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  { id: "6", label: "Cold Lead", color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
  { id: "7", label: "Hot Lead", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" }
];

const REASONS = [
  "Business Account",
  "Website Found",
  "Email Found",
  "Active Last 30 Days",
  "High Engagement",
  "Matches Target Prompt"
];
const REJECTS = [
  "Too Few Followers",
  "Personal profile",
  "No website",
  "Low activity",
  "Spam indicators",
  "Wrong industry"
];

const SOURCES: LeadSource[] = ["AI Discovery", "Profile Scraper", "Hashtag Scraper", "Comment Scraper", "Similar Accounts", "Followers", "Following"];
const STATUSES: QualificationStatus[] = ["Qualified", "Rejected", "Needs Review", "Contacted"]; // eslint-disable-line @typescript-eslint/no-unused-vars
const HEALTHS: HealthStatus[] = ["Excellent", "Good", "Average", "Poor"]; // eslint-disable-line @typescript-eslint/no-unused-vars

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomChance(percentage: number): boolean {
  return Math.random() < percentage / 100;
}

export function generateMockLeads(count: number = 250): ResultLead[] {
  const leads: ResultLead[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 999)}`;
    const businessName = randomChance(60) ? `${lastName} Real Estate Group` : null;
    
    const isQualified = randomChance(60);
    const status = isQualified ? "Qualified" : (randomChance(30) ? "Contacted" : (randomChance(50) ? "Rejected" : "Needs Review"));
    
    const hasWebsite = isQualified ? randomChance(90) : randomChance(40);
    const hasEmail = isQualified ? randomChance(85) : randomChance(30);
    const hasPhone = isQualified ? randomChance(60) : randomChance(10);
    const website = hasWebsite ? `https://www.${username}.${randomElement(DOMAINS)}` : null;
    
    let enrichmentStatus: EnrichmentStatus = "Not Enriched";
    if (hasWebsite && hasEmail && hasPhone) enrichmentStatus = "Fully Enriched";
    else if (hasWebsite || hasEmail || hasPhone) enrichmentStatus = "Partial";

    const aiScore = isQualified ? Math.floor(Math.random() * 20 + 80) : Math.floor(Math.random() * 50 + 20);
    
    let health: HealthStatus = "Average";
    if (aiScore > 90) health = "Excellent";
    else if (aiScore > 75) health = "Good";
    else if (aiScore < 50) health = "Poor";

    const tagsCount = Math.floor(Math.random() * 3);
    const shuffledTags = [...TAGS].sort(() => 0.5 - Math.random());
    
    const timeline = [];
    let eventTime = new Date(now.getTime() - (Math.random() * 10000000));
    
    timeline.push({ id: Math.random().toString(), time: eventTime, event: "Profile Found" });
    if (hasWebsite) {
      eventTime = new Date(eventTime.getTime() + 60000);
      timeline.push({ id: Math.random().toString(), time: eventTime, event: "Website Extracted" });
    }
    if (hasEmail) {
      eventTime = new Date(eventTime.getTime() + 60000);
      timeline.push({ id: Math.random().toString(), time: eventTime, event: "Email Found" });
    }
    eventTime = new Date(eventTime.getTime() + 60000);
    timeline.push({ id: Math.random().toString(), time: eventTime, event: `AI ${status}` });
    eventTime = new Date(eventTime.getTime() + 60000);
    timeline.push({ id: Math.random().toString(), time: eventTime, event: "Added to Campaign" });

    leads.push({
      id: `lead_${i}_${Math.random().toString(36).substr(2, 9)}`,
      avatarUrl: `https://i.pravatar.cc/150?u=${username}`,
      username,
      businessName,
      category: randomElement(BUSINESS_CATEGORIES),
      followers: Math.floor(Math.random() * 50000 + 500),
      following: Math.floor(Math.random() * 2000 + 100),
      posts: Math.floor(Math.random() * 2000 + 50),
      isBusinessAccount: true,
      isVerified: randomChance(10),
      bio: `Helping you find your dream home in ${randomChance(50) ? 'Florida' : 'Texas'}. 🏡 Top 1% Producer. DM for inquiries!`,
      website,
      email: hasEmail ? `${firstName.toLowerCase()}@${username}.${randomElement(DOMAINS)}` : null,
      phone: hasPhone ? `+1 (${Math.floor(Math.random() * 800 + 200)}) ${Math.floor(Math.random() * 800 + 200)}-${Math.floor(Math.random() * 8000 + 1000)}` : null,
      whatsapp: hasPhone ? `+1 (${Math.floor(Math.random() * 800 + 200)}) ${Math.floor(Math.random() * 800 + 200)}-${Math.floor(Math.random() * 8000 + 1000)}` : null,
      country: randomElement(COUNTRIES),
      address: randomChance(30) ? "123 Ocean Drive, Miami, FL 33139" : null,
      facebook: randomChance(40) ? `https://facebook.com/${username}` : null,
      linkedin: randomChance(60) ? `https://linkedin.com/in/${username}` : null,
      
      aiScore,
      aiConfidence: Math.floor(Math.random() * 10 + 90),
      health,
      status,
      aiReasoning: {
        positive: isQualified ? REASONS.sort(() => 0.5 - Math.random()).slice(0, 4) : REASONS.slice(0, 1),
        negative: !isQualified ? REJECTS.sort(() => 0.5 - Math.random()).slice(0, 2) : [],
        strengths: isQualified ? ["Clear value proposition", "Strong brand presence"] : ["High following"],
        weaknesses: !isQualified ? ["No direct contact info", "Low posting frequency"] : ["Small follower base"],
        recommendedAction: isQualified ? "Send personalized DMs linking to your offer." : "Skip or add to low priority list.",
        priority: isQualified ? "High" : "Low",
        suggestedStrategy: "Lead with a free website audit offer."
      },
      
      source: randomElement(SOURCES),
      enrichmentStatus,
      dateFound: new Date(now.getTime() - (Math.random() * 10000000)),
      
      duplicateInfo: randomChance(5) ? {
        isDuplicate: true,
        reason: randomElement(["Duplicate with Campaign #4", "Already Contacted", "Already in CRM"])
      } : { isDuplicate: false },
      
      websiteAnalysis: hasWebsite ? {
        seo: Math.floor(Math.random() * 40 + 60),
        performance: Math.floor(Math.random() * 50 + 50),
        mobile: Math.floor(Math.random() * 20 + 80),
        accessibility: Math.floor(Math.random() * 30 + 70),
        design: Math.floor(Math.random() * 30 + 70),
        conversionScore: Math.floor(Math.random() * 40 + 60),
        screenshotUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
      } : undefined,
      
      tags: shuffledTags.slice(0, tagsCount),
      internalNotes: randomChance(20) ? "Follow up next week about commercial properties in downtown area." : null,
      lastEdited: randomChance(30) ? new Date(now.getTime() - (Math.random() * 100000)) : undefined,
      addedBy: randomChance(80) ? "System" : "Alex Manager",
      timeline: timeline.reverse()
    });
  }

  return leads.sort((a, b) => b.aiScore - a.aiScore);
}
