import React from "react";
import { ResultLead } from "../../types/results";
import { ProfileSummaryHeader } from "@/components/instagram/profile-summary/ProfileSummaryHeader";
import { ProfileSummaryStats } from "@/components/instagram/profile-summary/ProfileSummaryStats";
import { ProfileSummaryBio } from "@/components/instagram/profile-summary/ProfileSummaryBio";
import { ProfileSummaryLinks } from "@/components/instagram/profile-summary/ProfileSummaryLinks";
import { ProfileSummaryPosts } from "@/components/instagram/profile-summary/ProfileSummaryPosts";
import { ProfileSummaryActions } from "@/components/instagram/profile-summary/ProfileSummaryActions";
import { ProfileSummaryData } from "@/lib/types/instagram";

export function ProfilePreview({ lead }: { lead: ResultLead }) {
  const profileData: ProfileSummaryData = {
    id: lead.id,
    username: lead.username,
    fullName: lead.fullName || lead.businessName,
    avatarUrl: lead.avatarUrl,
    followers: lead.followers,
    following: lead.following,
    posts: lead.posts,
    isBusiness: Boolean(lead.isBusinessAccount),
    isVerified: Boolean(lead.isVerified),
    category: lead.category,
    bio: lead.bio,
    website: lead.website,
    email: lead.email,
    phone: lead.phone,
    externalLinks: lead.externalLinks,
    latestPosts: lead.latestPosts,
  };

  return (
    <div className="flex flex-col gap-3">
      <ProfileSummaryHeader profile={profileData} />
      <ProfileSummaryStats
        followers={lead.followers}
        following={lead.following}
        posts={lead.posts}
      />
      <ProfileSummaryBio bio={lead.bio} />
      <ProfileSummaryLinks links={lead.externalLinks} />
      <ProfileSummaryPosts posts={lead.latestPosts} username={lead.username} />
      <ProfileSummaryActions profile={profileData} />
    </div>
  );
}

