import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AtSign, Check, Globe } from "lucide-react";
import { NormalizedProfile } from "@/lib/utils/normalize-profile-url";

interface ProfileInputCardProps {
  urlInput: string;
  setUrlInput: (val: string) => void;
  normalized: NormalizedProfile;
  disabled?: boolean;
}

export function ProfileInputCard({
  urlInput,
  setUrlInput,
  normalized,
  disabled = false,
}: ProfileInputCardProps) {
  return (
    <Card className="rounded-xl border-border/50 bg-background/50 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold tracking-tight">Profile</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter any public Instagram handle or complete profile link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="instagram-url" className="text-sm font-medium text-foreground flex items-center justify-between">
            <span>Instagram Profile URL</span>
            {normalized.isValid && (
              <span className="text-xs font-mono font-normal text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> Valid format
              </span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
              {urlInput.includes("instagram.com") ? (
                <Globe className="h-4 w-4" />
              ) : (
                <AtSign className="h-4 w-4" />
              )}
            </div>
            <Input
              id="instagram-url"
              type="text"
              placeholder="https://www.instagram.com/dyslove.design/"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={disabled}
              className="pl-9 font-mono text-sm h-11 bg-background border-border/70 focus-visible:ring-1 focus-visible:ring-foreground"
            />
          </div>
          <p className="text-[12px] text-muted-foreground">
            Paste a public Instagram profile URL or username. Supports <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">instagram.com/username</code>, <code className="font-mono text-[11px] bg-muted px-1 py-0.5 rounded">@username</code>, or direct links.
          </p>
        </div>

        {normalized.isValid && normalized.username && (
          <div className="p-3 rounded-lg border border-border/40 bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Target Profile Handle:</span>
            <span className="font-mono font-medium text-foreground bg-background px-2 py-0.5 rounded border border-border/60">
              @{normalized.username}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
