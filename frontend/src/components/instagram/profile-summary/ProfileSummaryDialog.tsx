"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileSummaryData } from "@/lib/types/instagram";
import { ProfileSummary } from "./ProfileSummary";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProfileSummaryDialogProps {
  profile: ProfileSummaryData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSummaryDialog({
  profile,
  open,
  onOpenChange,
}: ProfileSummaryDialogProps) {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] p-0 flex flex-col gap-0 border-border/60 bg-background shadow-2xl overflow-hidden">
        <DialogHeader className="p-4 px-6 border-b border-border/50 bg-background/95 backdrop-blur-xs">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Profile Summary
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 max-h-[calc(90vh-65px)] p-6">
          <ProfileSummary profile={profile} showActions={true} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
