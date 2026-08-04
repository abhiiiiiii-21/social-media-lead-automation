"use client";

import React from "react";
import { AlignLeft } from "lucide-react";

interface ProfileSummaryBioProps {
  bio?: string | null;
}

export function ProfileSummaryBio({ bio }: ProfileSummaryBioProps) {
  if (!bio || bio.trim() === "") {
    return (
      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-muted/10 border border-border/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <AlignLeft className="h-3.5 w-3.5" />
          <span>Bio</span>
        </div>
        <p className="text-xs text-muted-foreground italic">No bio available for this profile.</p>
      </div>
    );
  }

  // Parse mentions (@handle) and hashtags (#tag)
  const renderFormattedBio = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      const parts = line.split(/(@[a-zA-Z0-9._]+|#[a-zA-Z0-9._]+)/g);
      return (
        <div key={lineIdx} className="min-h-[1.25rem]">
          {parts.map((part, partIdx) => {
            if (part.startsWith("@")) {
              const username = part.substring(1);
              return (
                <a
                  key={partIdx}
                  href={`https://instagram.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:underline decoration-muted-foreground"
                >
                  {part}
                </a>
              );
            }
            if (part.startsWith("#")) {
              return (
                <span key={partIdx} className="font-medium text-muted-foreground">
                  {part}
                </span>
              );
            }
            return <span key={partIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-background border border-border/50 shadow-xs">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <AlignLeft className="h-3.5 w-3.5" />
        <span>Bio</span>
      </div>
      <div className="text-xs text-foreground/90 leading-relaxed font-normal">
        {renderFormattedBio(bio)}
      </div>
    </div>
  );
}
