import React from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const VIEWS = [
  { id: "all", label: "All Leads", icon: null },
  { id: "qualified", label: "Qualified", icon: Star, color: "text-amber-500" },
  { id: "outreach", label: "Outreach Ready", icon: Star, color: "text-amber-500" },
  { id: "high-ticket", label: "High Ticket", icon: Star, color: "text-amber-500" },
  { id: "missing-web", label: "Website Missing", icon: Star, color: "text-amber-500" }
];

interface SavedViewsBarProps {
  currentViews: string[];
  onViewChange: (viewId: string) => void;
}

export function SavedViewsBar({ currentViews, onViewChange }: SavedViewsBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/20 border border-border/50 text-xs text-muted-foreground mr-2 font-medium">
        <Bookmark className="h-3.5 w-3.5" />
        Saved Views
      </div>
      
      {VIEWS.map(view => {
        const Icon = view.icon;
        const isActive = view.id === "all" ? currentViews.length === 0 : currentViews.includes(view.id);
        return (
          <Button
            key={view.id}
            variant="ghost"
            size="sm"
            onClick={() => onViewChange(view.id)}
            className={cn(
              "h-8 px-3 rounded-full text-xs transition-colors",
              isActive 
                ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background" 
                : "bg-muted/10 text-muted-foreground hover:bg-muted/30 border border-border/50"
            )}
          >
            {Icon && <Icon className={cn("mr-1.5 h-3 w-3", isActive ? "text-background" : view.color)} />}
            {view.label}
          </Button>

        );
      })}
    </div>
  );
}
