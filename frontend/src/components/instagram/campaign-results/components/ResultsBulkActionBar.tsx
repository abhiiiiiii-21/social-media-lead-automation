import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Send, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ResultsBulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  campaignName?: string;
  platform?: string;
}

export function ResultsBulkActionBar({ 
  selectedCount, 
  onClear,
  campaignName = "Campaign",
  platform = "Instagram"
}: ResultsBulkActionBarProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [queueName, setQueueName] = useState(`${campaignName} - Outreach`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (selectedCount === 0) return null;

  const handleMoveToOutreach = () => {
    setIsSubmitting(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      onClear();
      router.push("/outreach/queue");
    }, 600);
  };

  return (
    <>
      <div className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 p-2 bg-foreground text-background rounded-xl shadow-2xl border border-border/10",
        "animate-in slide-in-from-bottom-10 fade-in duration-300"
      )}>
        <div className="px-4 border-r border-background/20 font-medium text-sm whitespace-nowrap">
          {selectedCount} Selected
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 hover:bg-background/20 hover:text-background transition-colors text-background/80"
            onClick={() => setIsModalOpen(true)}
          >
            <Send className="mr-2 h-3.5 w-3.5" /> Move to Outreach
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move Leads to Outreach</DialogTitle>
            <DialogDescription>
              Create a new batch in your outreach queue for these selected leads.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Platform</span>
                <span className="font-medium">{platform}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Selected Leads</span>
                <span className="font-medium">{selectedCount}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="queueName" className="text-sm font-medium">
                Queue Name
              </label>
              <Input 
                id="queueName"
                value={queueName}
                onChange={(e) => setQueueName(e.target.value)}
                placeholder="e.g. Florida Realtors - Qualified"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveToOutreach} disabled={isSubmitting || !queueName.trim()}>
              {isSubmitting ? "Moving..." : "Move to Outreach"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
