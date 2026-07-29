import React from "react";
import { ScraperType } from "@/lib/types/instagram";
import { Bot, MessageSquare, Hash, UserSearch } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScraperTypeCardProps {
  type: ScraperType;
  selected: boolean;
  onClick: () => void;
}

const SCRAPER_DETAILS: Record<ScraperType, { icon: React.ReactNode; description: string }> = {
  "AI Discovery": {
    icon: <Bot className="h-5 w-5" />,
    description: "Discover profiles matching your ideal customer description using AI."
  },
  "Comment Scraper": {
    icon: <MessageSquare className="h-5 w-5" />,
    description: "Extract active commenters from a specific Instagram post."
  },
  "Hashtag Scraper": {
    icon: <Hash className="h-5 w-5" />,
    description: "Find profiles that recently used specific targeted hashtags."
  },
  "Profile Scraper": {
    icon: <UserSearch className="h-5 w-5" />,
    description: "Deep scan a specific profile to extract detailed contact info."
  },
};

export function ScraperTypeCard({ type, selected, onClick }: ScraperTypeCardProps) {
  const details = SCRAPER_DETAILS[type];

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer group relative flex flex-col p-5 rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200",
        selected 
          ? "border-foreground ring-1 ring-foreground bg-muted/5" 
          : "border-border/50 hover:border-foreground/30 hover:bg-muted/5 hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-4 mb-3">
        <div className={cn(
          "flex items-center justify-center h-10 w-10 rounded-lg border",
          selected ? "bg-foreground text-background border-foreground" : "bg-muted/50 text-muted-foreground border-border/50 group-hover:text-foreground group-hover:border-foreground/30"
        )}>
          {details.icon}
        </div>
        <h3 className="font-semibold tracking-tight">{type}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {details.description}
      </p>
    </div>
  );
}
