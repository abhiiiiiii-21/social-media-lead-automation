import React from "react";
import { ScraperType, ScrapingConfig } from "@/lib/types/instagram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Play, Users, Clock, Filter, AlertCircle, Database, Network } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveSummaryCardProps {
  type: ScraperType;
  config: ScrapingConfig;
  isPending: boolean;
  onSubmit: () => void;
  isValid: boolean;
}

export function LiveSummaryCard({ type, config, isPending, onSubmit, isValid }: LiveSummaryCardProps) {
  
  const getEstimatedLeads = () => {
    // Return a default based on the type if they haven't set a hard target yet but are filling out the form
    let base = 0;
    if (config.targetLeads) base = config.targetLeads;
    else if (config.maximumProfiles) base = config.maximumProfiles;
    else if (config.targetProfiles) base = config.targetProfiles;
    else if (config.campaignName || config.targetCustomer || config.hashtags?.length > 0 || config.instagramUsernames?.length > 0) {
      // Form is somewhat populated, show default estimate to feel "alive"
      base = type === "AI Discovery" ? 250 : type === "Hashtag Scraper" ? 500 : 100;
    }
    return base;
  };

  const estimatedLeads = getEstimatedLeads();
  const estimatedSearchSize = estimatedLeads > 0 ? Math.ceil(estimatedLeads * 2.5) : 0;
  const estimatedRequests = estimatedLeads > 0 ? Math.ceil(estimatedLeads * 0.75) : 0;
  const estimatedDuration = estimatedLeads > 0 ? Math.ceil(estimatedLeads / 100) : 0;
  
  const hasAdvancedFilters = Boolean(
    config.minFollowers || config.maxFollowers || config.language || config.country ||
    config.businessOnly || config.verifiedOnly || config.hasWebsite || config.hasEmail ||
    config.hasPhone || config.minPosts || config.maxPosts || config.businessCategory ||
    config.recentlyActive || config.excludeContacted || config.skipDuplicates
  );

  return (
    <Card className="rounded-xl border-border/50 bg-background/50 shadow-sm sticky top-6">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
        <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          Live Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="p-4 border-b border-border/50">
            <h3 className={cn(
              "font-semibold text-lg tracking-tight line-clamp-1", 
              config.campaignName ? "text-foreground" : "text-muted-foreground italic"
            )}>
              {config.campaignName || "Untitled Campaign"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500/80"></span>
              {type}
            </p>
          </div>

          <div className="p-4 flex flex-col gap-4 text-sm border-b border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Estimated Leads
              </span>
              <span className={cn("font-semibold", estimatedLeads > 0 ? "text-foreground" : "text-muted-foreground")}>
                {estimatedLeads > 0 ? `≈ ${estimatedLeads.toLocaleString()}` : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" /> Estimated Search Size
              </span>
              <span className={cn("font-semibold", estimatedSearchSize > 0 ? "text-foreground" : "text-muted-foreground")}>
                {estimatedSearchSize > 0 ? `≈ ${estimatedSearchSize.toLocaleString()} Profiles` : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Network className="h-4 w-4" /> Estimated Requests
              </span>
              <span className={cn("font-semibold", estimatedRequests > 0 ? "text-foreground" : "text-muted-foreground")}>
                {estimatedRequests > 0 ? `≈ ${estimatedRequests.toLocaleString()} Requests` : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" /> Estimated Runtime
              </span>
              <span className={cn("font-semibold", estimatedDuration > 0 ? "text-foreground" : "text-muted-foreground")}>
                {estimatedDuration > 0 ? `≈ ${estimatedDuration} min` : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Filter className="h-4 w-4" /> Profile Enrichment
              </span>
              <span className={cn("font-semibold", config.profileEnrichment ? "text-foreground" : "text-muted-foreground")}>
                {config.profileEnrichment ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Filter className="h-4 w-4" /> Advanced Filters
              </span>
              <span className={cn("font-semibold", hasAdvancedFilters ? "text-foreground" : "text-muted-foreground")}>
                {hasAdvancedFilters ? "Enabled" : "None"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-muted/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Status</span>
              <span className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
                isValid ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
              )}>
                {isValid ? (
                  <><CheckCircle2 className="h-3 w-3" /> Ready to Scrape</>
                ) : (
                  <><AlertCircle className="h-3 w-3" /> Missing Fields</>
                )}
              </span>
            </div>
            
            <div className="space-y-2">
              <Button 
                size="lg" 
                className="w-full font-medium" 
                onClick={onSubmit} 
                disabled={isPending || !isValid}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4 fill-current" />
                )}
                Start Scraping
              </Button>
              {isValid && (
                <p className="text-[11px] text-center text-muted-foreground">
                  This campaign will begin immediately after submission.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
