"use client";

import React from "react";
import { formatNumber } from "../campaign-results/utils/formatters";
import { Users, UserPlus, Image as ImageIcon } from "lucide-react";

interface ProfileSummaryStatsProps {
  followers: number | any;
  following: number | any;
  posts: number | any;
}

function parseStatNumber(val: any): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (Array.isArray(val)) return val.length;
  if (typeof val === "string") {
    const parsed = parseInt(val.replace(/,/g, ""), 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function ProfileSummaryStats({ followers, following, posts }: ProfileSummaryStatsProps) {
  const numFollowers = parseStatNumber(followers);
  const numFollowing = parseStatNumber(following);
  const numPosts = parseStatNumber(posts);

  const stats = [
    {
      label: "Followers",
      rawCount: numFollowers,
      formatted: formatNumber(numFollowers),
      icon: Users,
    },
    {
      label: "Following",
      rawCount: numFollowing,
      formatted: formatNumber(numFollowing),
      icon: UserPlus,
    },
    {
      label: "Posts",
      rawCount: numPosts,
      formatted: formatNumber(numPosts),
      icon: ImageIcon,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-background border border-border/50 shadow-xs text-center group hover:border-border/80 transition-colors"
          >
            <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <span
              className="text-lg font-bold tracking-tight font-mono text-foreground tabular-nums"
              title={`${stat.rawCount.toLocaleString()} ${stat.label.toLowerCase()}`}
            >
              {stat.formatted}
            </span>
          </div>
        );
      })}
    </div>
  );
}
