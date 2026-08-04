import { ProfileSummaryData, StructuredProfileData } from "@/lib/types/instagram";
import { toast } from "sonner";

/**
 * Utility to download raw text/data as a file in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Exports a single Instagram Profile summary as the full 8-section structured JSON
 */
export function exportProfileToJson(profile: ProfileSummaryData | any): void {
  try {
    const filename = `${profile.username || "profile"}_complete_profile.json`;

    let dataToExport: StructuredProfileData | any;

    if (profile.structured_data) {
      dataToExport = profile.structured_data;
    } else {
      // Assemble structured fallback if not directly attached
      dataToExport = {
        profile: {
          username: profile.username,
          fullName: profile.fullName || profile.full_name || null,
          bio: profile.bio || null,
          emojis: profile.emojis || [],
          bioMentions: profile.bioMentions || [],
          bioHashtags: profile.bioHashtags || [],
          bioLocation: profile.bioLocation || null,
          category: profile.category || null,
          businessType: profile.businessType || null,
          accountType: profile.accountType || "Personal",
          profilePictureUrl: profile.avatarUrl || profile.avatar_url || null,
          followers: profile.followers ?? 0,
          following: profile.following ?? 0,
          postsCount: profile.posts ?? profile.postsCount ?? 0,
          isVerified: Boolean(profile.isVerified ?? profile.is_verified),
          isPrivate: Boolean(profile.isPrivate ?? profile.is_private),
          isBusiness: Boolean(profile.isBusiness ?? profile.is_business),
          isCreator: Boolean(profile.isCreator),
          isProfessional: Boolean(profile.isProfessional),
          profileUrl: profile.profileUrl || profile.profile_url || `https://instagram.com/${profile.username}`,
          inspectedAt: profile.inspectedAt || profile.inspected_at || new Date().toISOString(),
        },
        contact: {
          email: profile.email || null,
          phone: profile.phone || null,
          whatsApp: profile.whatsApp || profile.whats_app || null,
          website: profile.website || null,
          address: profile.address || null,
          bookingLink: profile.bookingLink || null,
          businessCategory: profile.category || null,
          contactButtons: profile.contactButtons || [],
        },
        externalLinks: profile.externalLinks || profile.external_links || [],
        highlights: profile.highlights || [],
        posts: profile.latestPosts || profile.latest_posts || [],
        engagement: profile.engagement || {
          averageLikes: 0,
          averageComments: 0,
          totalReels: 0,
          totalImagePosts: 0,
          totalCarouselPosts: 0,
          reelPercentage: 0,
          carouselPercentage: 0,
          imagePercentage: 0,
          estimatedEngagementRate: 0,
          postingFrequency: "Unknown",
        },
        leadIntelligence: profile.leadIntelligence || {
          profession: profile.category || null,
          industry: null,
          creatorType: null,
          brandTone: null,
          contentStyle: null,
          city: null,
          country: null,
          travelFrequency: null,
          luxuryScore: 0,
          businessFocus: null,
          primaryAudience: null,
          contactPreference: null,
          bestProfileImage: profile.avatarUrl || null,
          bestShowcaseImages: [],
          brandColors: [],
        },
        media: profile.media || {
          profilePicturePath: null,
          downloadedPostsCount: 0,
          downloadedHighlightsCount: 0,
          postImages: [],
          highlightCovers: [],
        },
      };
    }

    const jsonString = JSON.stringify(dataToExport, null, 2);
    downloadFile(jsonString, filename, "application/json");
    toast.success(`Exported complete profile for @${profile.username} as JSON`);
  } catch (error) {
    toast.error("Failed to export profile JSON");
    console.error("JSON export error:", error);
  }
}

/**
 * Escapes a single CSV field
 */
function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports a single Instagram Profile summary as enriched CSV
 */
export function exportProfileToCsv(profile: ProfileSummaryData | any): void {
  try {
    const filename = `${profile.username || "profile"}_enriched_lead.csv`;

    const struct = profile.structured_data || {};
    const intel = struct.leadIntelligence || profile.leadIntelligence || {};
    const engage = struct.engagement || profile.engagement || {};
    const contact = struct.contact || {};

    const headers = [
      "Username",
      "Full Name",
      "Followers",
      "Following",
      "Posts Count",
      "Engagement Rate (%)",
      "Average Likes",
      "Average Comments",
      "Reel %",
      "Carousel %",
      "Image %",
      "Posting Frequency",
      "Website",
      "Email",
      "Phone",
      "WhatsApp",
      "Booking Link",
      "Business Category",
      "Profession",
      "Industry",
      "Creator Type",
      "City",
      "Country",
      "Brand Tone",
      "Travel Frequency",
      "Luxury Score (0-100)",
      "Contact Preference",
      "Verified",
      "Business Account",
      "Private Account",
      "Bio",
      "External Links",
      "Highlights Count",
      "Latest Posts Count",
      "Profile URL",
      "Inspected At",
    ];

    const rawLinks = profile.externalLinks || profile.external_links || struct.externalLinks || [];
    const extLinks = Array.isArray(rawLinks)
      ? rawLinks.map((l: any) => (typeof l === "string" ? l : l.url)).join(" | ")
      : "";

    const highlightsList = profile.highlights || struct.highlights || [];
    const postsList = profile.latestPosts || profile.latest_posts || struct.posts || [];

    const values = [
      profile.username || "",
      profile.fullName || profile.full_name || struct.profile?.fullName || "",
      profile.followers ?? struct.profile?.followers ?? 0,
      profile.following ?? struct.profile?.following ?? 0,
      profile.posts ?? struct.profile?.postsCount ?? 0,
      engage.estimatedEngagementRate ?? engage.engagementRate ?? 0,
      engage.averageLikes ?? 0,
      engage.averageComments ?? 0,
      engage.reelPercentage ?? 0,
      engage.carouselPercentage ?? 0,
      engage.imagePercentage ?? 0,
      engage.postingFrequency || "",
      contact.website || profile.website || "",
      contact.email || profile.email || "",
      contact.phone || profile.phone || "",
      contact.whatsApp || profile.whatsApp || profile.whats_app || "",
      contact.bookingLink || "",
      profile.category || struct.profile?.category || "",
      intel.profession || profile.category || "",
      intel.industry || "",
      intel.creatorType || "",
      intel.city || "",
      intel.country || "",
      intel.brandTone || "",
      intel.travelFrequency || "",
      intel.luxuryScore ?? 0,
      intel.contactPreference || "",
      (profile.isVerified ?? struct.profile?.isVerified) ? "Yes" : "No",
      (profile.isBusiness ?? struct.profile?.isBusiness) ? "Yes" : "No",
      (profile.isPrivate ?? struct.profile?.isPrivate) ? "Yes" : "No",
      profile.bio || struct.profile?.bio || "",
      extLinks,
      highlightsList.length,
      postsList.length,
      profile.profileUrl || profile.profile_url || `https://instagram.com/${profile.username}`,
      profile.inspectedAt || profile.inspected_at || new Date().toISOString(),
    ];

    const csvContent = [
      headers.map(escapeCsvCell).join(","),
      values.map(escapeCsvCell).join(","),
    ].join("\n");

    downloadFile(csvContent, filename, "text/csv;charset=utf-8;");
    toast.success(`Exported @${profile.username} as Enriched CSV`);
  } catch (error) {
    toast.error("Failed to export profile CSV");
    console.error("CSV export error:", error);
  }
}
