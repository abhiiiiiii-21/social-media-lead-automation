import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  InspectionStep, 
  InspectionLogEntry, 
  InspectionErrorType 
} from "@/lib/types/inspector";
import { 
  CheckCircle2, 
  Loader2, 
  Terminal, 
  Activity, 
  AlertCircle, 
  RefreshCw,
  Globe,
  FileSearch,
  Database,
  Contact,
  Check
} from "lucide-react";

interface InspectionProgressViewProps {
  currentStep: InspectionStep;
  isInspecting: boolean;
  liveLogs: InspectionLogEntry[];
  rawLogs: InspectionLogEntry[];
  errorDetails: { message: string; type: InspectionErrorType } | null;
  onRetry: () => void;
}

const PIPELINE_STEPS: Array<{
  id: InspectionStep;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: "opening", label: "Opening Profile", icon: <Globe className="h-3.5 w-3.5" /> },
  { id: "loading", label: "Loading Profile", icon: <Loader2 className="h-3.5 w-3.5" /> },
  { id: "extracting", label: "Extracting Info", icon: <FileSearch className="h-3.5 w-3.5" /> },
  { id: "contact", label: "Contact Details", icon: <Contact className="h-3.5 w-3.5" /> },
  { id: "saving", label: "Saving Results", icon: <Database className="h-3.5 w-3.5" /> },
  { id: "completed", label: "Completed", icon: <Check className="h-3.5 w-3.5" /> },
];

export function InspectionProgressView({
  currentStep,
  isInspecting,
  liveLogs,
  rawLogs,
  errorDetails,
  onRetry,
}: InspectionProgressViewProps) {
  const [activeTab, setActiveTab] = useState<"live" | "raw">("live");
  const logEndRef = useRef<HTMLDivElement>(null);

  // Compute progress percentage
  const getProgressPercentage = () => {
    switch (currentStep) {
      case "opening": return 15;
      case "loading": return 35;
      case "extracting": return 60;
      case "contact": return 80;
      case "saving": return 95;
      case "completed": return 100;
      case "error": return 100;
      default: return 0;
    }
  };

  const getStepStatus = (stepId: InspectionStep) => {
    const stepOrder: InspectionStep[] = ["opening", "loading", "extracting", "contact", "saving", "completed"];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(stepId);

    if (currentStep === "error") {
      return targetIndex <= currentIndex ? "error" : "pending";
    }
    if (targetIndex < currentIndex || currentStep === "completed") {
      return "completed";
    }
    if (targetIndex === currentIndex) {
      return "active";
    }
    return "pending";
  };

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveLogs, rawLogs, activeTab]);

  return (
    <Card className="rounded-xl border-border/50 bg-background/50 shadow-none overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
            Inspection Pipeline
          </CardTitle>
          <span className="text-xs font-mono text-muted-foreground">
            {getProgressPercentage()}%
          </span>
        </div>
        <Progress value={getProgressPercentage()} className="h-1.5 mt-2" />
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {/* Pipeline Steps Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {PIPELINE_STEPS.map((step) => {
            const status = getStepStatus(step.id);
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                  status === "completed"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : status === "active"
                    ? "bg-foreground/5 border-foreground/30 text-foreground font-medium shadow-sm ring-1 ring-foreground/20"
                    : status === "error"
                    ? "bg-destructive/10 border-destructive/30 text-destructive"
                    : "bg-muted/10 border-border/30 text-muted-foreground opacity-50"
                }`}
              >
                <div className="mb-1.5 flex items-center justify-center">
                  {status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : status === "active" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                  ) : status === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className="text-[11px] leading-tight line-clamp-1">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Error State Banner */}
        {errorDetails && (
          <Alert variant="destructive" className="rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">
              Inspection Failed ({errorDetails.type || "Error"})
            </AlertTitle>
            <AlertDescription className="text-xs mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>{errorDetails.message}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-7 text-xs border-destructive/40 hover:bg-destructive/10 self-start sm:self-auto"
              >
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Retry Inspection
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Log Viewer Tabs */}
        <div className="space-y-2">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "live" | "raw")}>
            <div className="flex items-center justify-between pb-1">
              <TabsList className="h-7 p-0.5 bg-muted/40 border border-border/40 rounded-lg">
                <TabsTrigger
                  value="live"
                  className="text-xs h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <Activity className="h-3 w-3 mr-1 text-blue-500" />
                  Live Logs ({liveLogs.length})
                </TabsTrigger>
                <TabsTrigger
                  value="raw"
                  className="text-xs h-6 px-2.5 data-[state=active]:bg-background data-[state=active]:shadow-xs"
                >
                  <Terminal className="h-3 w-3 mr-1 text-emerald-500" />
                  Raw Logs ({rawLogs.length})
                </TabsTrigger>
              </TabsList>
              <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                {isInspecting ? (
                  <>
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                    Streaming...
                  </>
                ) : (
                  "Stream Complete"
                )}
              </span>
            </div>

            <TabsContent value="live" className="mt-0">
              <div className="h-44 p-3 rounded-lg border border-border/50 bg-neutral-950 font-mono text-[11px] text-neutral-300 overflow-y-auto space-y-1.5 select-text">
                {liveLogs.length === 0 ? (
                  <p className="text-neutral-600 italic">Waiting for inspection to begin...</p>
                ) : (
                  liveLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2">
                      <span className="text-neutral-500 shrink-0 select-none">[{log.timestamp}]</span>
                      <span
                        className={
                          log.type === "success"
                            ? "text-emerald-400 font-medium"
                            : log.type === "error"
                            ? "text-rose-400 font-medium"
                            : log.type === "warning"
                            ? "text-amber-400"
                            : "text-neutral-200"
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </TabsContent>

            <TabsContent value="raw" className="mt-0">
              <div className="h-44 p-3 rounded-lg border border-border/50 bg-neutral-950 font-mono text-[11px] text-emerald-400 overflow-y-auto space-y-1.5 select-text">
                {rawLogs.length === 0 ? (
                  <p className="text-neutral-600 italic">No Playwright actions recorded yet...</p>
                ) : (
                  rawLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2">
                      <span className="text-neutral-600 shrink-0 select-none">&gt;</span>
                      <span className="text-neutral-300">{log.message}</span>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
