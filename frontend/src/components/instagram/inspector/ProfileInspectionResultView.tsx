import React, { useState } from "react";
import { ProfileSummaryData } from "@/lib/types/instagram";
import { InspectionLogEntry } from "@/lib/types/inspector";
import { ProfileSummary } from "../profile-summary/ProfileSummary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { 
  Search, 
  RefreshCw, 
  ChevronDown, 
  Terminal, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Calendar,
  Lock,
  Unlock
} from "lucide-react";

interface ProfileInspectionResultViewProps {
  profile: ProfileSummaryData;
  rawLogs: InspectionLogEntry[];
  onInspectAnother: () => void;
  onReinspect: () => void;
}

export function ProfileInspectionResultView({
  profile,
  rawLogs,
  onInspectAnother,
  onReinspect,
}: ProfileInspectionResultViewProps) {
  const [logsOpen, setLogsOpen] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Top Banner with Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-background/50 shadow-none">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm tracking-tight text-foreground">
                Inspection Completed
              </h3>
              <Badge variant="outline" className="text-[10px] font-mono bg-muted/40">
                @{profile.username}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              All selected public fields successfully extracted.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onReinspect}
            className="text-xs h-8"
          >
            <RefreshCw className="h-3 w-3 mr-1.5" />
            Re-inspect
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onInspectAnother}
            className="text-xs h-8 font-medium"
          >
            <Search className="h-3 w-3 mr-1.5" />
            Inspect Another Profile
          </Button>
        </div>
      </div>

      {/* Main Profile Summary Content Card */}
      <Card className="rounded-xl border-border/50 bg-background/50 shadow-none overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <ProfileSummary profile={profile} showActions={true} />

          {/* Account Details Box */}
          <div className="p-4 rounded-lg border border-border/40 bg-muted/20 space-y-3 mt-4">
            <h4 className="text-xs font-mono uppercase font-semibold text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Account Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded border border-border/30 bg-background/60 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  {profile.isPrivate ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  Profile Type
                </span>
                <span className="font-semibold text-foreground">
                  {profile.isPrivate ? "Private Account" : "Public Account"}
                </span>
              </div>
              <div className="p-2.5 rounded border border-border/30 bg-background/60 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  Category
                </span>
                <span className="font-semibold text-foreground truncate block">
                  {profile.category || "Not Available"}
                </span>
              </div>
              <div className="p-2.5 rounded border border-border/30 bg-background/60 space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Inspected
                </span>
                <span className="font-semibold text-foreground truncate block font-mono text-[11px]">
                  {profile.inspectedAt ? new Date(profile.inspectedAt).toLocaleTimeString() : "Just now"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Playwright Execution Logs Collapsible */}
      {rawLogs.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-background/40 overflow-hidden">
          <button
            type="button"
            onClick={() => setLogsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/30 text-xs font-mono text-muted-foreground transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-emerald-500" />
              <span>Playwright Inspection Logs ({rawLogs.length} actions)</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                logsOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {logsOpen && (
            <div className="p-4 pt-0">
              <div className="p-3 rounded-lg border border-border/50 bg-neutral-950 font-mono text-[11px] text-emerald-400 space-y-1 max-h-48 overflow-y-auto">
                {rawLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-neutral-600 select-none">&gt;</span>
                    <span className="text-neutral-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
