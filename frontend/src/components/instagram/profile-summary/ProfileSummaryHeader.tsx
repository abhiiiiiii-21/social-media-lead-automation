"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Briefcase, ExternalLink, Tag } from "lucide-react";
import { ProfileSummaryData } from "@/lib/types/instagram";

interface ProfileSummaryHeaderProps {
  profile: ProfileSummaryData | any;
}

export function ProfileSummaryHeader({ profile }: ProfileSummaryHeaderProps) {
  const instagramUrl = profile.profileUrl || profile.profile_url || `https://instagram.com/${profile.username}`;
  const initials = (profile.username || "IG").substring(0, 2).toUpperCase();
  
  const rawUsername = (profile.username || "").toLowerCase().replace("@", "").trim();
  const rawFullName = profile.fullName || profile.full_name || profile.structured_data?.profile?.fullName || null;
  const cleanFullName = rawFullName && rawFullName.toLowerCase().replace("@", "").trim() !== rawUsername ? rawFullName : null;

  const rawAvatarUrl = profile.avatarUrl || profile.avatar_url || profile.profilePictureUrl || profile.structured_data?.profile?.profilePictureUrl;
  const avatarUrl = rawAvatarUrl && rawAvatarUrl.startsWith("/media")
    ? `http://localhost:8000${rawAvatarUrl}`
    : rawAvatarUrl;

  const isVerified = Boolean(profile.isVerified ?? profile.is_verified ?? profile.structured_data?.profile?.isVerified);
  const isBusiness = Boolean(profile.isBusiness ?? profile.is_business ?? profile.structured_data?.profile?.isBusiness);
  const category = profile.category || profile.structured_data?.profile?.category;

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 rounded-2xl bg-muted/20 border border-border/50">
      <div className="flex items-start gap-4 min-w-0">
        <Avatar className="h-16 w-16 rounded-xl border border-border/60 shrink-0 shadow-sm">
          <AvatarImage src={avatarUrl} alt={profile.username} referrerPolicy="no-referrer" className="object-cover" />
          <AvatarFallback className="rounded-xl bg-muted text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold tracking-tight text-foreground truncate">
              @{profile.username}
            </h2>
            {isVerified && (
              <Badge variant="secondary" className="gap-1 h-5 px-1.5 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border-border/40 text-[10px] font-semibold tracking-wider uppercase shrink-0">
                <CheckCircle2 className="h-3 w-3 text-sky-400" />
                Verified
              </Badge>
            )}
            {isBusiness && (
              <Badge variant="outline" className="gap-1 h-5 px-1.5 bg-background text-foreground/80 border-border/60 text-[10px] font-medium tracking-wider uppercase shrink-0">
                <Briefcase className="h-3 w-3 text-muted-foreground" />
                Business
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {cleanFullName && (
              <span className="font-semibold text-foreground">{cleanFullName}</span>
            )}
            {cleanFullName && category && <span>•</span>}
            {category && (
              <span className="inline-flex items-center gap-1 text-muted-foreground font-medium">
                <Tag className="h-3 w-3" />
                {category}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md border border-border/60 bg-background hover:bg-muted/50 px-2.5 h-8 text-xs font-medium text-foreground gap-1.5 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Profile
        </a>
      </div>
    </div>
  );
}
