"use client";

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CampaignsTable } from "@/components/instagram/campaigns-table";
import { useCampaigns } from "@/hooks/use-campaigns";
import { useRouter } from "next/navigation";

export default function InstagramCampaignsPage() {
  const { data: campaignsData, isLoading } = useCampaigns({ platform: "Instagram" });
  const router = useRouter();

  const campaigns = campaignsData?.items || [];

  return (
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader
        title="Scraping Campaigns"
        description="Monitor the progress of your active and past Instagram data extraction jobs."
      >
        <Button 
          size="sm" 
          className="h-9 gap-1.5 px-4 font-medium" 
          onClick={() => router.push("/instagram/new")}
        >
          <Plus className="h-4 w-4" />
          <span>New Campaign</span>
        </Button>
      </PageHeader>

      <div>
        <CampaignsTable campaigns={campaigns} isLoading={isLoading} />
      </div>
    </div>
  );
}
