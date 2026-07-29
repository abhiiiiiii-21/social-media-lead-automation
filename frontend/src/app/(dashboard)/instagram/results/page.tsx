"use client";

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LeadsDataTable } from "@/components/instagram/leads-data-table";
import { useScrapedLeads } from "@/hooks/use-instagram";
import { Skeleton } from "@/components/ui/skeleton";
import { Database } from "lucide-react";

export default function InstagramResultsPage() {
  const { data: leads, isLoading } = useScrapedLeads();

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Scraped Leads"
        description="View, filter, and export all the targeted profiles collected from your scraping campaigns."
      />

      {isLoading ? (
        <div className="border border-border/50 rounded-lg p-4 bg-background space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-9 w-64 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ) : !leads || leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border border-border/50 rounded-lg bg-muted/5">
          <div className="h-12 w-12 rounded-full bg-background border border-border/50 flex items-center justify-center mb-4 shadow-sm">
            <Database className="h-5 w-5 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-medium text-foreground">No leads found</p>
          <p className="text-xs text-muted-foreground mt-1">Start a scraping campaign to populate this list.</p>
        </div>
      ) : (
        <LeadsDataTable data={leads} />
      )}
    </div>
  );
}
