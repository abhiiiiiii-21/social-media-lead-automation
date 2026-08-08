import React from "react";
import { CampaignSimulation } from "@/hooks/use-campaign-simulation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Play, Square, ExternalLink, Download, Copy, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { campaignsApi } from "@/lib/api/campaigns";

export function ExecutionStickySidebar({ simulation }: { simulation: CampaignSimulation }) {
  const router = useRouter();
  const { campaign, status, pause, resume, stop, metrics } = simulation;

  if (!campaign) return null;

  const isRunning = !["Completed", "Failed", "Paused", "Pending"].includes(status as any);
  const isCompleted = status === "Completed";
  const isFailed = status === "Failed";

  const handleExportCsv = () => {
    window.open(campaignsApi.getExportUrl(campaign.id, "csv"), "_blank");
  };

  return (
    <Card className="rounded-xl border-border/50 bg-background/50 shadow-sm sticky top-6">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
        <CardTitle className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          Controls & Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 flex flex-col gap-3 border-b border-border/50">
          {!isCompleted && !isFailed && (
            <>
              {isRunning ? (
                <Button variant="outline" className="w-full justify-start font-medium border-amber-500/20 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10 hover:text-amber-700 transition-colors" onClick={pause}>
                  <Pause className="mr-2 h-4 w-4" /> Pause Campaign
                </Button>
              ) : (
                <Button variant="outline" className="w-full justify-start font-medium border-blue-500/20 text-blue-600 bg-blue-500/5 hover:bg-blue-500/10 hover:text-blue-700 transition-colors" onClick={resume}>
                  <Play className="mr-2 h-4 w-4" /> Resume Campaign
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start font-medium border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={stop}>
                <Square className="mr-2 h-4 w-4" /> Stop & Save
              </Button>
            </>
          )}

          {isCompleted && (
            <div className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-md p-3 text-sm flex items-start gap-2 mb-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Campaign Finished</p>
                <p className="opacity-80 mt-0.5 leading-snug">Successfully secured {metrics.qualified.toLocaleString()} leads.</p>
              </div>
            </div>
          )}

          {isFailed && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3 text-sm flex items-start gap-2 mb-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Campaign Failed</p>
                <p className="opacity-80 mt-0.5 leading-snug">Rate limit exceeded or connection lost.</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-3">
          <Button variant="default" className="w-full justify-start font-medium animate-in fade-in zoom-in-95" onClick={() => router.push(`/instagram/campaigns/${campaign.id}/results`)}>
            <ExternalLink className="mr-2 h-4 w-4" /> View Results Table
          </Button>
          <Button variant="outline" className="w-full justify-start font-medium" onClick={handleExportCsv} disabled={metrics.qualified === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start font-medium text-muted-foreground"
            onClick={() => router.push(`/instagram/new`)}
          >
            <Copy className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
