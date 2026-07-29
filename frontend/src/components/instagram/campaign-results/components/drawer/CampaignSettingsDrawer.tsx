import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Play, Copy, Trash2, Calendar, Clock, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CampaignSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CampaignSettingsDrawer({ isOpen, onClose }: CampaignSettingsDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-sm p-0 flex flex-col border-border/50 bg-background shadow-2xl">
        <SheetHeader className="p-4 border-b border-border/50 bg-background/95 backdrop-blur-sm z-10">
          <SheetTitle className="text-base font-semibold text-foreground tracking-tight">
            Campaign Settings
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-8 min-h-0">
          {/* General Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">General</h3>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="campaignName" className="text-xs font-medium text-foreground/80">Campaign Name</label>
              <Input id="campaignName" defaultValue="Florida Realtors" className="h-9" />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="description" className="text-xs font-medium text-foreground/80">Description</label>
              <Textarea 
                id="description" 
                defaultValue="Scraping top real estate agents in Florida for Q4 outreach." 
                className="resize-none h-20 text-sm" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/10 border border-border/50">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase font-semibold">Status</span>
                </div>
                <Badge variant="outline" className="w-fit bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  Completed
                </Badge>
              </div>
              <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/10 border border-border/50">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase font-semibold">Created</span>
                </div>
                <span className="text-sm font-medium">Oct 14, 2026</span>
              </div>
              <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/10 border border-border/50 col-span-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase font-semibold">Last Run</span>
                </div>
                <span className="text-sm font-medium">Oct 15, 2026 at 09:42 AM</span>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</h3>
            
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="justify-start h-10 group hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors">
                <Play className="mr-2 h-4 w-4 text-emerald-500" /> 
                <span className="group-hover:text-emerald-500 transition-colors">Run Again</span>
              </Button>
              <Button variant="outline" className="justify-start h-10 group hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors">
                <Copy className="mr-2 h-4 w-4 text-blue-500" /> 
                <span className="group-hover:text-blue-500 transition-colors">Duplicate Campaign</span>
              </Button>
              <Button variant="outline" className="justify-start h-10 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors">
                <Trash2 className="mr-2 h-4 w-4" /> 
                Delete Campaign
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border/50 bg-background/95">
          <Button className="w-full" onClick={onClose}>Save Changes</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
