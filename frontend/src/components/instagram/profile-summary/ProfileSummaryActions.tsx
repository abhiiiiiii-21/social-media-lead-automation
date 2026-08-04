"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { FileJson, FileSpreadsheet } from "lucide-react";
import { ProfileSummaryData } from "@/lib/types/instagram";
import { exportProfileToJson, exportProfileToCsv } from "@/lib/utils/export-profile";

interface ProfileSummaryActionsProps {
  profile: ProfileSummaryData;
  className?: string;
}

export function ProfileSummaryActions({ profile, className }: ProfileSummaryActionsProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-center gap-2.5 ${className || ""}`}>
      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto flex-1 h-9 font-medium text-xs border-border/60 bg-background hover:bg-muted/50 gap-2 shadow-xs"
        onClick={() => exportProfileToJson(profile)}
      >
        <FileJson className="h-4 w-4 text-muted-foreground" />
        Export JSON
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="w-full sm:w-auto flex-1 h-9 font-medium text-xs border-border/60 bg-background hover:bg-muted/50 gap-2 shadow-xs"
        onClick={() => exportProfileToCsv(profile)}
      >
        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
        Export CSV
      </Button>
    </div>
  );
}
