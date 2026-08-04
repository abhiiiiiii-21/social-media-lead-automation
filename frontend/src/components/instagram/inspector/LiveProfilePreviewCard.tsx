import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NormalizedProfile } from "@/lib/utils/normalize-profile-url";
import { Clock, CheckCircle2, AlertCircle, UserSearch, ShieldCheck, Link2 } from "lucide-react";

interface LiveProfilePreviewCardProps {
  normalized: NormalizedProfile;
  urlInput: string;
}

export function LiveProfilePreviewCard({ normalized, urlInput }: LiveProfilePreviewCardProps) {
  const isReady = normalized.isValid && Boolean(normalized.username);

  return (
    <Card className="rounded-xl border-border/50 bg-background/50 shadow-none">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <UserSearch className="h-3.5 w-3.5" />
            Live Profile Preview
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-[11px] font-medium ${
              isReady
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
            }`}
          >
            {isReady ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Ready to Inspect
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Awaiting Input
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {isReady ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/30">
              <div className="h-10 w-10 rounded-full bg-foreground/5 border border-border flex items-center justify-center font-mono font-semibold text-foreground text-sm uppercase">
                {normalized.username.substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold text-sm text-foreground truncate">
                    @{normalized.username}
                  </span>
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                </div>
                <p className="text-xs text-muted-foreground truncate font-mono">
                  {normalized.profileUrl}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg border border-border/30 bg-muted/10 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Estimated Time
                </span>
                <span className="font-semibold text-foreground">15–30 seconds</span>
              </div>
              <div className="p-2.5 rounded-lg border border-border/30 bg-muted/10 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Link2 className="h-3 w-3" /> Target Type
                </span>
                <span className="font-semibold text-foreground">Single Profile</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground space-y-2">
            <UserSearch className="h-8 w-8 mx-auto stroke-[1.2] opacity-40" />
            <p className="text-xs font-medium text-foreground">
              No Profile Specified
            </p>
            <p className="text-[11px] max-w-xs mx-auto text-muted-foreground">
              Enter an Instagram URL or handle in the profile input to inspect publicly available metrics.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
