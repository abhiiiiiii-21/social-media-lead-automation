import React from "react";
import { CampaignSimulation } from "@/hooks/use-campaign-simulation";
import { Check, Info, AlertTriangle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function LiveActivityTimeline({ simulation }: { simulation: CampaignSimulation }) {
  const { activityLogs } = simulation;

  return (
    <div className="flex flex-col border border-border/50 bg-background/50 rounded-xl overflow-hidden h-[400px]">
      <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between sticky top-0 z-10">
        <h3 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground">Live Activity Log</h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live
        </span>
      </div>
      <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
        {activityLogs.map((log) => {
          let Icon = Info;
          let colorClass = "text-muted-foreground";
          
          if (log.type === "success") {
            Icon = Check;
            colorClass = "text-emerald-500";
          } else if (log.type === "warning") {
            Icon = AlertTriangle;
            colorClass = "text-amber-500";
          } else if (log.type === "error") {
            Icon = XCircle;
            colorClass = "text-destructive";
          }

          return (
            <div key={log.id} className="flex gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="mt-0.5 shrink-0 text-muted-foreground">
                {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className={cn("mt-0.5 shrink-0", colorClass)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className={cn("font-medium", colorClass === "text-muted-foreground" ? "text-foreground" : colorClass)}>
                {log.message}
              </div>
            </div>
          );
        })}
        {activityLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Clock className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">Waiting for activity...</p>
          </div>
        )}
      </div>
    </div>
  );
}
