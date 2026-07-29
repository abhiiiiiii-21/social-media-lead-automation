import React from "react";
import { CampaignSimulation, PipelineStage } from "@/hooks/use-campaign-simulation";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Search, Users, Database, Sparkles, Save, CheckCircle2 } from "lucide-react";

const STAGES: { id: PipelineStage; label: string; icon: any }[] = [
  { id: "Searching", label: "Searching", icon: Search },
  { id: "Collecting Profiles", label: "Collecting Profiles", icon: Users },
  { id: "Extracting Contacts", label: "Extracting Contacts", icon: Database },
  { id: "AI Qualification", label: "AI Qualification", icon: Sparkles },
  { id: "Saving Leads", label: "Saving Leads", icon: Save },
  { id: "Completed", label: "Completed", icon: CheckCircle2 },
];

export function ExecutionPipeline({ simulation }: { simulation: CampaignSimulation }) {
  const { progress, pipelineStage, status } = simulation;

  const currentStageIndex = STAGES.findIndex(s => s.id === pipelineStage);
  const isFailed = status === "Failed";
  const isPaused = status === ("Paused" as any);

  return (
    <div className="flex flex-col gap-6 p-6 border border-border/50 bg-background/50 rounded-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">Campaign Progress</h3>
        <span className={cn(
          "text-2xl font-bold font-mono tracking-tighter transition-colors duration-300",
          isFailed ? "text-destructive" : isPaused ? "text-amber-500" : "text-foreground"
        )}>
          {progress.toFixed(1)}%
        </span>
      </div>

      <Progress 
        value={progress} 
        className={cn("h-2 transition-all duration-500 ease-out", isFailed ? "bg-destructive/20 [&>div]:bg-destructive" : isPaused ? "bg-amber-500/20 [&>div]:bg-amber-500" : "bg-muted/50")} 
      />

      <div className="grid grid-cols-6 gap-2 mt-2">
        {STAGES.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const Icon = stage.icon;
          
          let colorClass = "text-muted-foreground/40";
          if (isCompleted) colorClass = "text-emerald-500";
          else if (isCurrent && isFailed) colorClass = "text-destructive";
          else if (isCurrent && isPaused) colorClass = "text-amber-500";
          else if (isCurrent) colorClass = "text-foreground font-semibold";

          return (
            <div key={stage.id} className={cn("flex flex-col items-center text-center gap-3 transition-all duration-500", colorClass)}>
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border transition-all duration-500",
                isCompleted ? "border-emerald-500 bg-emerald-500/10" :
                isCurrent && isFailed ? "border-destructive bg-destructive/10" :
                isCurrent && isPaused ? "border-amber-500 bg-amber-500/10" :
                isCurrent ? "border-emerald-500/80 bg-emerald-500/10 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-400" :
                "border-border/50 bg-transparent"
              )}>
                <Icon className={cn("h-4 w-4 transition-all duration-500", isCurrent && !isCompleted && !isFailed && !isPaused && index !== 5 ? "animate-pulse" : "")} />
              </div>
              <span className="text-xs max-w-[80px] leading-tight transition-colors duration-500">{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
