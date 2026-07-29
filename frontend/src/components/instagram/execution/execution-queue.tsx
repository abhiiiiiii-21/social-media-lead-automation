import React from "react";
import { CampaignSimulation } from "@/hooks/use-campaign-simulation";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ListTree, Loader2, CheckCircle2, Star } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function ExecutionQueue({ simulation }: { simulation: CampaignSimulation }) {
  const { metrics } = simulation;

  return (
    <Card className="rounded-xl border-border/50 bg-background/50 shadow-none overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border/50">
          <div className="p-4 flex flex-col items-center text-center justify-center bg-muted/10 transition-colors">
            <Users className="h-4 w-4 text-muted-foreground mb-2" />
            <AnimatedCounter value={metrics.profilesFound} className="text-2xl font-bold font-mono tracking-tighter" />
            <span className="text-xs text-muted-foreground uppercase font-semibold mt-1">Found</span>
          </div>
          <div className="p-4 flex flex-col items-center text-center justify-center transition-colors">
            <ListTree className="h-4 w-4 text-muted-foreground mb-2" />
            <AnimatedCounter value={metrics.queued} className="text-2xl font-bold font-mono tracking-tighter" />
            <span className="text-xs text-muted-foreground uppercase font-semibold mt-1">Queued</span>
          </div>
          <div className="p-4 flex flex-col items-center text-center justify-center relative transition-colors">
            <Loader2 className="h-4 w-4 text-blue-500 mb-2 animate-spin" />
            <AnimatedCounter value={metrics.processing} className="text-2xl font-bold font-mono tracking-tighter text-blue-500" />
            <span className="text-xs text-blue-500/80 uppercase font-semibold mt-1">Processing</span>
            {metrics.processing > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
            )}
          </div>
          <div className="p-4 flex flex-col items-center text-center justify-center transition-colors">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground mb-2" />
            <AnimatedCounter value={metrics.completed} className="text-2xl font-bold font-mono tracking-tighter" />
            <span className="text-xs text-muted-foreground uppercase font-semibold mt-1">Completed</span>
          </div>
          <div className="p-4 flex flex-col items-center text-center justify-center bg-emerald-500/5 transition-colors">
            <Star className="h-4 w-4 text-emerald-500 mb-2" />
            <AnimatedCounter value={metrics.qualified} className="text-2xl font-bold font-mono tracking-tighter text-emerald-500" />
            <span className="text-xs text-emerald-600 uppercase font-semibold mt-1">Qualified</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
