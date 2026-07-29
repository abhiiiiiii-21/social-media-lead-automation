import React from "react";
import { ArrowDown } from "lucide-react";

export function CampaignFunnel() {
  const steps = [
    { label: "Profiles Found", count: "2,500" },
    { label: "Passed Filters", count: "620" },
    { label: "Enriched", count: "415" },
    { label: "AI Qualified", count: "302" },
    { label: "Saved", count: "121" },
    { label: "Sent to CRM", count: "54" },
    { label: "Outreach Started", count: "18" }
  ];

  return (
    <div className="flex items-center justify-between w-full p-4 border border-border/50 rounded-xl bg-background/30 overflow-x-auto hide-scrollbar">
      {steps.map((step, idx) => (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center shrink-0 min-w-[120px]">
            <span className="text-xl font-bold font-mono tracking-tighter text-foreground mb-1">{step.count}</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{step.label}</span>
          </div>
          {idx !== steps.length - 1 && (
            <div className="flex items-center justify-center text-muted-foreground/30 px-2 shrink-0">
              <ArrowDown className="h-4 w-4 -rotate-90" />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
