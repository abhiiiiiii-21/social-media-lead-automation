"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Link2, ExternalLink, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { ExternalLink as ExternalLinkType } from "@/lib/types/instagram";

interface ProfileSummaryLinksProps {
  links?: (string | ExternalLinkType | any)[];
}

export function ProfileSummaryLinks({ links }: ProfileSummaryLinksProps) {
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null);

  if (!links || links.length === 0) {
    return (
      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-muted/10 border border-border/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Link2 className="h-3.5 w-3.5" />
          <span>External Links</span>
        </div>
        <p className="text-xs text-muted-foreground italic">No external links found on this profile.</p>
      </div>
    );
  }

  const normalizedLinks = links
    .filter(Boolean)
    .map((link) => {
      if (typeof link === "string") {
        return { url: link, title: link.replace(/^https?:\/\/(www\.)?/, ""), type: "website" };
      }
      const rawUrl = link.url || link.link || "";
      const rawTitle = link.title || rawUrl.replace(/^https?:\/\/(www\.)?/, "");
      return {
        url: rawUrl,
        title: rawTitle,
        type: link.type || "website",
      };
    })
    .filter((l) => Boolean(l.url));

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  if (normalizedLinks.length === 0) {
    return (
      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-muted/10 border border-border/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Link2 className="h-3.5 w-3.5" />
          <span>External Links</span>
        </div>
        <p className="text-xs text-muted-foreground italic">No external links found on this profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-background border border-border/50 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Link2 className="h-3.5 w-3.5" />
          <span>External Links</span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          {normalizedLinks.length} {normalizedLinks.length === 1 ? "link" : "links"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {normalizedLinks.map((item, idx) => {
          const isCopied = copiedUrl === item.url;
          const formattedUrl = item.url.startsWith("http") ? item.url : `https://${item.url}`;

          return (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/40 hover:border-border/70 transition-colors gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <a
                  href={formattedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-foreground hover:underline truncate"
                >
                  {item.title}
                </a>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => handleCopy(formattedUrl)}
                  title="Copy link"
                >
                  {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </Button>
                <a
                  href={formattedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open link"
                  className="h-6 w-6 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
