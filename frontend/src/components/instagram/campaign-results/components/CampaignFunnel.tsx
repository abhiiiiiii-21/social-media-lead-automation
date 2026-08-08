import React from "react";
import { ArrowDown } from "lucide-react";
import { ResultLead } from "../types/results";

interface CampaignFunnelProps {
  leads?: ResultLead[];
}

export function CampaignFunnel({ leads = [] }: CampaignFunnelProps) {
  const total = leads.length;
  const withWebsite = leads.filter(l => Boolean(l.website)).length;
  const withEmail = leads.filter(l => Boolean(l.email)).length;
  const withPhone = leads.filter(l => Boolean(l.phone)).length;
  const qualified = leads.filter(l => l.status === "Qualified").length;
  const outreachReady = leads.filter(l => (l.email || l.phone) && l.aiScore >= 80).length;

  const steps = [
    { label: "Leads Saved", count: total.toLocaleString() },
    { label: "With Website", count: withWebsite.toLocaleString() },
    { label: "With Email", count: withEmail.toLocaleString() },
    { label: "With Phone", count: withPhone.toLocaleString() },
    { label: "AI Qualified", count: qualified.toLocaleString() },
    { label: "Outreach Ready", count: outreachReady.toLocaleString() }
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
