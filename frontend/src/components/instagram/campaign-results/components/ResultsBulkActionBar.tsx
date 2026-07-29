import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Send, Tag, Sparkles, Trash2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsBulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
}

export function ResultsBulkActionBar({ selectedCount, onClear }: ResultsBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className={cn(
      "fixed bottom-8 left-1/2 -translate-x-1/2 z-50",
      "flex items-center gap-3 p-2 bg-foreground text-background rounded-xl shadow-2xl border border-border/10",
      "animate-in slide-in-from-bottom-10 fade-in duration-300"
    )}>
      <div className="px-4 border-r border-background/20 font-medium text-sm whitespace-nowrap">
        {selectedCount} Selected
      </div>
      
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" className="h-8 hover:bg-background/20 hover:text-background transition-colors text-background/80">
          <Send className="mr-2 h-3.5 w-3.5" /> Move to CRM
        </Button>
        <Button size="sm" variant="ghost" className="h-8 hover:bg-background/20 hover:text-background transition-colors text-background/80">
          <Download className="mr-2 h-3.5 w-3.5" /> Export
        </Button>
        <div className="w-px h-4 bg-background/20 mx-1"></div>
        <Button size="sm" variant="ghost" className="h-8 hover:bg-destructive/20 hover:text-red-400 transition-colors text-red-400/80">
          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
        </Button>
      </div>

      <div className="px-2">
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-background/20 text-background/50 hover:text-background rounded-full" onClick={onClear}>
          ✕
        </Button>
      </div>
    </div>
  );
}
