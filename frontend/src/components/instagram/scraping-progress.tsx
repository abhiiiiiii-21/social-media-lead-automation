"use client";

import React, { useEffect, useState } from "react";
import { ScrapingCampaign } from "@/lib/types/instagram";
import { Loader2, CheckCircle2, Search, Filter, Database, AlertCircle, RefreshCw, BarChart2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrapingProgressProps {
  campaign: ScrapingCampaign;
}

const STEPS = [
  { id: "pending", label: "Preparing campaign", icon: Loader2 },
  { id: "connecting", label: "Connecting to Instagram", icon: RefreshCw },
  { id: "collecting", label: "Collecting profiles", icon: Search },
  { id: "filtering", label: "Removing duplicates", icon: Filter },
  { id: "enriching", label: "Enriching profiles", icon: Database },
  { id: "scoring", label: "Scoring leads", icon: BarChart2 },
  { id: "saving", label: "Saving results", icon: Save },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
];

export function ScrapingProgress({ campaign }: ScrapingProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Fake simulation logic based on initial campaign status
  useEffect(() => {
    if (campaign.status === "Completed") {
      setCurrentStepIndex(7);
      return;
    }
    
    if (campaign.status === "Failed") {
      return;
    }

    // Simulate progress every few seconds if it's new
    let step = 0;
    const interval = setInterval(() => {
      if (step < 7) {
        step += 1;
        setCurrentStepIndex(step);
      } else {
        clearInterval(interval);
      }
    }, 1500); // Progress every 1.5 seconds for a cool animated effect

    return () => clearInterval(interval);
  }, [campaign.status]);

  if (campaign.status === "Failed") {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-destructive/20 bg-destructive/5 rounded-lg text-destructive">
        <AlertCircle className="h-8 w-8 mb-3" />
        <p className="font-semibold">Scraping Failed</p>
        <p className="text-sm mt-1 opacity-80">The Instagram API rate limit was exceeded.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 border border-border/50 bg-background/50 rounded-lg">
      <h3 className="text-sm font-semibold tracking-tight">Mock Activity Timeline</h3>
      <div className="flex flex-col gap-4 relative before:absolute before:inset-y-2 before:left-[11px] before:w-px before:bg-border/50">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isUpcoming = index > currentStepIndex;
          
          const Icon = step.icon;

          return (
            <div key={step.id} className={cn(
              "flex items-center gap-4 relative z-10 transition-opacity duration-300",
              isUpcoming ? "opacity-40" : "opacity-100"
            )}>
              <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center border bg-background",
                isCompleted ? "border-emerald-500/50 text-emerald-500" : 
                isCurrent ? "border-foreground text-foreground" : 
                "border-border/50 text-muted-foreground"
              )}>
                {isCurrent && index !== 7 ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Icon className="h-3 w-3" />
                )}
              </div>
              <p className={cn(
                "text-sm font-medium transition-colors duration-300",
                isCompleted ? "text-emerald-500" :
                isCurrent ? "text-foreground" :
                "text-muted-foreground"
              )}>
                {step.label} {isCurrent && index !== 7 && "..."}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
