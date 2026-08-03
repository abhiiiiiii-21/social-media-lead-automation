import React from "react";
import { CampaignSimulation } from "@/hooks/use-campaign-simulation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, PauseCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ExecutionHeader({ simulation }: { simulation: CampaignSimulation }) {
  const router = useRouter();
  const { campaign, status, metrics, progress } = simulation;

  if (!campaign) return null;

  const getStatusIcon = () => {
    switch(status) {
      case "Pending":
      case "Connecting":
      case "Collecting":
      case "Removing Duplicates":
      case "Enriching":
      case "Scoring":
      case "Saving":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "Paused":
        return <PauseCircle className="h-4 w-4 text-amber-500" />;
      case "Completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "Failed":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusVariant = () => {
    if (status === "Completed") return "outline";
    if (status === "Failed") return "destructive";
    if (status === "Paused") return "outline";
    return "secondary";
  };

  const formatRuntime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isRunning = !["Completed", "Failed", "Paused", "Pending"].includes(status as any);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-md bg-muted/30 hover:bg-muted"
          onClick={() => router.push("/instagram/campaigns")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
              {campaign.name}
            </h1>
            <Badge variant={getStatusVariant()} className="font-medium flex items-center gap-1.5 capitalize">
              {getStatusIcon()}
              {isRunning ? "Running" : status}
            </Badge>
            <Badge variant="outline" className="bg-muted/50 border-border/50 text-muted-foreground font-medium hidden sm:inline-flex">
              {campaign.scraperType || campaign.config?.scraperType || campaign.platform}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Live Header Counters */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex flex-col items-end">
          <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-0.5">Progress</span>
          <span className="font-medium font-mono">{progress.toFixed(1)}%</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-0.5">Leads Found</span>
          <span className="font-medium font-mono">{metrics.profilesFound.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold mb-0.5">Runtime</span>
          <span className="font-medium font-mono">{formatRuntime(metrics.runtimeSeconds)}</span>
        </div>
      </div>
    </div>
  );
}
