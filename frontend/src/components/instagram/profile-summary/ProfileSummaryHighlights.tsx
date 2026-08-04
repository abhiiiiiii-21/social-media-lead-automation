"use client";

import React from "react";
import { Sparkles, ExternalLink } from "lucide-react";

interface HighlightItem {
  id: string;
  title: string;
  coverImageUrl?: string | null;
  cover_image_url?: string | null;
  highlightUrl?: string | null;
  highlight_url?: string | null;
  thumbnail?: string | null;
  storyCount?: number | null;
}

interface ProfileSummaryHighlightsProps {
  highlights?: HighlightItem[];
}

export function ProfileSummaryHighlights({ highlights }: ProfileSummaryHighlightsProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-background border border-border/50 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Story Highlights</span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          {highlights.length} {highlights.length === 1 ? "highlight" : "highlights"}
        </span>
      </div>

      <div className="flex items-start gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/20">
        {highlights.map((hl, idx) => {
          const cover = hl.coverImageUrl || hl.cover_image_url || hl.thumbnail;
          const title = hl.title || `Highlight ${idx + 1}`;
          const url = hl.highlightUrl || hl.highlight_url || `https://instagram.com/stories/highlights/${hl.id}/`;

          return (
            <a
              key={hl.id || idx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer w-18 text-center"
              title={`View highlight: ${title}`}
            >
              <div className="p-0.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 group-hover:scale-105 transition-transform duration-200">
                <div className="p-0.5 bg-background rounded-full">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {cover ? (
                      <img
                        src={cover}
                        alt={title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-400 text-xs font-semibold">
                        {title.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-foreground/90 truncate max-w-16">
                {title}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
