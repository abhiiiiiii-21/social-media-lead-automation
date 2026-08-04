"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ScraperTypeCard } from "@/components/instagram/scraper-type-card";
import { ScraperConfigForm } from "@/components/instagram/scraper-config-form";
import { LiveSummaryCard } from "@/components/instagram/live-summary-card";
import { ProfileInspector } from "@/components/instagram/inspector";
import { ScraperType, ScrapingConfig } from "@/lib/types/instagram";
import { useCreateCampaign } from "@/hooks/use-campaigns";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SCRAPER_TYPES: ScraperType[] = [
  "AI Discovery",
  "Profile Scraper",
  "Comment Scraper",
  "Hashtag Scraper"
];

export default function NewCampaignPage() {
  const [selectedType, setSelectedType] = useState<ScraperType>("AI Discovery");
  const [config, setConfig] = useState<ScrapingConfig>({});
  
  const { mutateAsync: createCampaign, isPending } = useCreateCampaign();
  const router = useRouter();

  // Validate form state
  const isValid = useMemo(() => {
    if (!config.campaignName || config.campaignName.trim() === "") return false;

    if (selectedType === "AI Discovery") {
      return Boolean(config.targetCustomer && config.targetCustomer.trim() !== "");
    }
    
    if (selectedType === "Profile Scraper") {
      return Boolean(config.instagramUsernames && config.instagramUsernames.length > 0);
    }
    
    if (selectedType === "Comment Scraper") {
      return Boolean(config.postUrls && config.postUrls.length > 0);
    }
    
    if (selectedType === "Hashtag Scraper") {
      return Boolean(config.hashtags && config.hashtags.length > 0);
    }

    return false;
  }, [config, selectedType]);

  const handleStartScraping = async () => {
    if (!isValid) return;

    try {
      const campaign = await createCampaign({
        name: config.campaignName || "Instagram Campaign",
        platform: "Instagram",
        config: {
          scraperType: selectedType,
          ...config
        }
      });
      router.push(`/instagram/campaigns/${campaign.id}`);
    } catch (error) {
      console.error("Failed to start scraping campaign", error);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <PageHeader
        title="Instagram Lead Scraper"
        description="Configure a scraping campaign to discover targeted Instagram leads."
      />

      {/* Scraper Type Selector */}
      <section>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Select Scraper Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCRAPER_TYPES.map((type) => (
            <ScraperTypeCard
              key={type}
              type={type}
              selected={selectedType === type}
              onClick={() => {
                setSelectedType(type);
                setConfig({ campaignName: config.campaignName }); // Keep name, reset the rest
              }}
            />
          ))}
        </div>
      </section>

      {/* Profile Scraper: Dedicated Profile Inspector */}
      {selectedType === "Profile Scraper" ? (
        <section className="pt-2">
          <ProfileInspector showTitle={false} />
        </section>
      ) : (
        /* Lead Generation Scrapers: AI Discovery / Comment / Hashtag */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <Card className="rounded-xl border-border/50 bg-background/50 shadow-none">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold tracking-tight mb-6">Configuration</h2>
                  <ScraperConfigForm
                    type={selectedType}
                    config={config}
                    setConfig={setConfig}
                  />
                  
                  {/* Fallback button for mobile below the form */}
                  <div className="mt-8 lg:hidden">
                    <Button 
                      size="lg" 
                      className="w-full font-medium" 
                      onClick={handleStartScraping} 
                      disabled={isPending || !isValid}
                    >
                      Start Scraping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="hidden lg:block lg:col-span-1 relative">
            <LiveSummaryCard 
              type={selectedType}
              config={config}
              isPending={isPending}
              onSubmit={handleStartScraping}
              isValid={isValid}
            />
          </div>
        </div>
      )}
    </div>
  );
}
