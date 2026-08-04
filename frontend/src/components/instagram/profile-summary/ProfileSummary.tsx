"use client";

import React from "react";
import { ProfileSummaryData } from "@/lib/types/instagram";
import { ProfileSummaryHeader } from "./ProfileSummaryHeader";
import { ProfileSummaryStats } from "./ProfileSummaryStats";
import { ProfileSummaryBio } from "./ProfileSummaryBio";
import { ProfileSummaryHighlights } from "./ProfileSummaryHighlights";
import { ProfileSummaryContact } from "./ProfileSummaryContact";
import { ProfileSummaryLinks } from "./ProfileSummaryLinks";
import { ProfileSummaryPosts } from "./ProfileSummaryPosts";
import { ProfileSummaryActions } from "./ProfileSummaryActions";

interface ProfileSummaryProps {
  profile: ProfileSummaryData | any;
  showActions?: boolean;
  className?: string;
}

export function ProfileSummary({
  profile,
  showActions = true,
  className,
}: ProfileSummaryProps) {
  const extLinks = profile.externalLinks || profile.external_links || profile.structured_data?.externalLinks || [];
  const highlightsList = profile.highlights || profile.structured_data?.highlights || [];
  
  // Resolve post array safely (ensure we do not confuse with post count integer)
  const postsList = 
    (Array.isArray(profile.latestPosts) && profile.latestPosts) ||
    (Array.isArray(profile.latest_posts) && profile.latest_posts) ||
    (Array.isArray(profile.recentPosts) && profile.recentPosts) ||
    (Array.isArray(profile.posts) ? profile.posts : []) ||
    profile.structured_data?.posts ||
    [];

  // Resolve post count integer safely
  const postsCount = 
    profile.postsCount ?? 
    profile.posts_count ?? 
    profile.structured_data?.profile?.postsCount ?? 
    (typeof profile.posts === "number" ? profile.posts : postsList.length);

  return (
    <div className={`flex flex-col gap-4 ${className || ""}`}>
      {/* 1. Header (Avatar, Username, Badges, Category) */}
      <ProfileSummaryHeader profile={profile} />

      {/* 2. Stats (Followers, Following, Posts) */}
      <ProfileSummaryStats
        followers={profile.followers ?? profile.structured_data?.profile?.followers ?? 0}
        following={profile.following ?? profile.structured_data?.profile?.following ?? 0}
        posts={postsCount}
      />

      {/* 3. Bio */}
      <ProfileSummaryBio bio={profile.bio ?? profile.structured_data?.profile?.bio} />

      {/* 4. Story Highlights (Instagram Tray) */}
      <ProfileSummaryHighlights highlights={highlightsList} />

      {/* 5. Contact Information (Website, Email, Phone) */}
      <ProfileSummaryContact
        website={profile.website ?? profile.structured_data?.contact?.website}
        email={profile.email ?? profile.structured_data?.contact?.email}
        phone={profile.phone ?? profile.whatsApp ?? profile.whats_app ?? profile.structured_data?.contact?.phone}
      />

      {/* 6. External Links */}
      <ProfileSummaryLinks links={extLinks} />

      {/* 7. Latest Posts */}
      <ProfileSummaryPosts
        posts={postsList}
        username={profile.username}
      />

      {/* 8. Export Actions (Export JSON, Export CSV) */}
      {showActions && (
        <ProfileSummaryActions
          profile={profile}
          className="pt-2 border-t border-border/50"
        />
      )}
    </div>
  );
}
