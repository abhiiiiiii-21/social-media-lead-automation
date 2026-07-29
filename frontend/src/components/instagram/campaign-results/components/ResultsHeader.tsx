import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Download, RefreshCcw, ArrowLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { CampaignSettingsDrawer } from "./drawer/CampaignSettingsDrawer";

interface ResultsHeaderProps {
  totalCount: number;
}

export function ResultsHeader({ totalCount }: ResultsHeaderProps) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/50">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span className="hover:text-foreground cursor-pointer transition-colors" onClick={() => router.push('/instagram')}>Instagram</span>
          <ChevronRight className="h-3 w-3" />
          <span className="hover:text-foreground cursor-pointer transition-colors" onClick={() => router.push('/instagram/campaigns')}>Campaigns</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Florida Realtors</span>
        </div>
        
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Florida Realtors</h1>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-medium">
            Completed
          </Badge>
          <div className="h-4 w-px bg-border/50"></div>
          <span className="text-sm font-mono text-muted-foreground">{totalCount.toLocaleString()} Leads</span>
          <div className="h-4 w-px bg-border/50"></div>
          <span className="text-sm text-muted-foreground">Created Oct 14, 2026</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="h-9">
          <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Refresh
        </Button>
        <Button variant="outline" size="sm" className="h-9">
          <Download className="mr-2 h-3.5 w-3.5" /> Export CSV
        </Button>
        <Button variant="default" size="sm" className="h-9" onClick={() => setIsSettingsOpen(true)}>
          <Settings className="mr-2 h-3.5 w-3.5" /> Campaign Settings
        </Button>
      </div>

      <CampaignSettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
