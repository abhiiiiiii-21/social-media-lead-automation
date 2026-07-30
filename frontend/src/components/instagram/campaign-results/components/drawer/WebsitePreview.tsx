import React from "react";
import { ResultLead } from "../../types/results";
import { Button } from "@/components/ui/button";
import { ExternalLink, SearchCode, Activity, MonitorSmartphone, Layout, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export function WebsitePreview({ lead }: { lead: ResultLead }) {
  if (!lead.website || !lead.websiteAnalysis) return null;

  const { analysis } = { analysis: lead.websiteAnalysis };





  return (
    <div className="flex flex-col gap-3 p-4 border border-border/50 rounded-xl bg-muted/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Website Analysis</span>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
          Generate Audit <SearchCode className="ml-1.5 h-3 w-3" />
        </Button>
      </div>

      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border/50 group cursor-pointer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={analysis.screenshotUrl} alt="Website Preview" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Button variant="secondary" size="sm">
            <ExternalLink className="mr-2 h-3.5 w-3.5" /> Visit Site
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        <ScoreCard label="SEO" score={analysis.seo} icon={SearchCode} />
        <ScoreCard label="Performance" score={analysis.performance} icon={Zap} />
        <ScoreCard label="Mobile" score={analysis.mobile} icon={MonitorSmartphone} />
        <ScoreCard label="Accessibility" score={analysis.accessibility} icon={Activity} />
        <ScoreCard label="Design" score={analysis.design} icon={Layout} />
        <ScoreCard label="Conversion" score={analysis.conversionScore} icon={Target} />
      </div>
    </div>
  );
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-500 bg-emerald-500/10";
  if (score >= 60) return "text-amber-500 bg-amber-500/10";
  return "text-destructive bg-destructive/10";
};

const ScoreCard = ({ label, score, icon: Icon }: { label: string, score: number, icon: any /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) => (
  <div className="flex flex-col items-center p-2 rounded-lg border border-border/50 bg-background">
    <Icon className="h-3.5 w-3.5 text-muted-foreground mb-1" />
    <span className={cn("text-sm font-bold font-mono px-1.5 rounded", getScoreColor(score))}>{score}</span>
    <span className="text-[9px] text-muted-foreground uppercase mt-1 text-center">{label}</span>
  </div>
);
