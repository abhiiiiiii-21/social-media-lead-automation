"use client";

import React, { use } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useCampaignSimulation } from "@/hooks/use-campaign-simulation";

import { ExecutionHeader } from "@/components/instagram/execution/execution-header";
import { ExecutionPipeline } from "@/components/instagram/execution/execution-pipeline";
import { ExecutionQueue } from "@/components/instagram/execution/execution-queue";
import { ExecutionMetricsGrid } from "@/components/instagram/execution/execution-metrics-grid";
import { LiveActivityTimeline } from "@/components/instagram/execution/live-activity-timeline";

import { ExecutionStickySidebar } from "@/components/instagram/execution/execution-sticky-sidebar";
import { ExecutionTabs } from "@/components/instagram/execution/execution-tabs";

export default function InstagramCampaignExecutionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  // The simulation engine manages the entire lifecycle and mock data flow
  const simulation = useCampaignSimulation(resolvedParams.id);
  const { campaign, isLoading } = simulation;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full rounded-xl lg:col-span-2" />
          <Skeleton className="h-96 w-full rounded-xl lg:col-span-1" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
        <Button variant="outline" onClick={() => router.push("/instagram/campaigns")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <ExecutionHeader simulation={simulation} />
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          <ExecutionPipeline simulation={simulation} />
          
          <ExecutionQueue simulation={simulation} />
          
          <ExecutionMetricsGrid simulation={simulation} />

          <div className="mt-2">
            <LiveActivityTimeline simulation={simulation} />
          </div>

          <div className="mt-6">
            <ExecutionTabs simulation={simulation} />
          </div>

        </div>

        <div className="hidden xl:block xl:col-span-1 relative">
          <ExecutionStickySidebar simulation={simulation} />
        </div>
      </div>
    </div>
  );
}
