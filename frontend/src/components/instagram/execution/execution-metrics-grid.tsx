import React from "react";
import { CampaignSimulation } from "@/hooks/use-campaign-simulation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle2, UserX, Network, Clock, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function ExecutionMetricsGrid({ simulation }: { simulation: CampaignSimulation }) {
  const { metrics } = simulation;

  const MetricCard = ({ title, value, icon: Icon, className, isTime = false }: any) => (
    <Card className="rounded-xl border-border/50 bg-background/50 shadow-none hover:bg-muted/10 transition-colors">
      <CardHeader className="pb-2 px-6 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground/50" />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-5 pt-1">
        <div className={cn("text-2xl font-bold font-mono tracking-tighter", className)}>
          {isTime ? (
            value
          ) : (
            <AnimatedCounter value={Number(value) || 0} />
          )}
        </div>
      </CardContent>
    </Card>
  );

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <MetricCard 
        title="Profiles Scanned" 
        value={metrics.profilesFound} 
        icon={Users} 
        className="text-foreground" 
      />
      <MetricCard 
        title="Qualified Leads" 
        value={metrics.qualified} 
        icon={CheckCircle2} 
        className="text-emerald-500" 
      />
      <MetricCard 
        title="Rejected Profiles" 
        value={metrics.rejected} 
        icon={UserX} 
        className="text-muted-foreground" 
      />
      <MetricCard 
        title="Duplicates Removed" 
        value={metrics.duplicatesRemoved} 
        icon={Network} 
        className="text-foreground" 
      />
      <MetricCard 
        title="Elapsed Time" 
        value={formatTime(metrics.runtimeSeconds)} 
        icon={Clock} 
        className="text-foreground"
        isTime={true}
      />
      <MetricCard 
        title="ETA" 
        value={simulation.status === "Completed" ? "00:00" : formatTime(metrics.estimatedRemainingSeconds)} 
        icon={Timer} 
        className="text-blue-500"
        isTime={true}
      />
    </div>
  );
}
