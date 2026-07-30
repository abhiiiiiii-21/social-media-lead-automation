"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Users, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FaInstagram, FaLinkedin } from "react-icons/fa";

const MOCK_CAMPAIGNS = [
  {
    id: "camp_1",
    name: "Florida Realtors",
    leads: 245,
    status: "Completed",
    timeAgo: "2 days ago",
  },
  {
    id: "camp_2",
    name: "Austin Realtors",
    leads: 182,
    status: "Completed",
    timeAgo: "Yesterday",
  },
  {
    id: "camp_3",
    name: "Miami Luxury Agents",
    leads: 96,
    status: "Completed",
    timeAgo: "Today",
  }
];

function CampaignSelectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const platform = searchParams.get("platform") || "instagram";

  const handleOpenResults = (campaignId: string) => {
    router.push(`/instagram/campaigns/${campaignId}/results`);
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative">
      
      {/* Back Button */}
      <div className="absolute top-8 left-4 sm:left-6 lg:left-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center w-full mb-10 mt-12"
      >
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            {platform === "linkedin" ? (
              <><FaLinkedin className="w-3.5 h-3.5 text-[#0077b5]" /> LinkedIn</>
            ) : (
              <><FaInstagram className="w-3.5 h-3.5 text-pink-500" /> Instagram</>
            )}
          </div>
        </div>
        
        <div className="text-xs font-mono font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Step 3 of 3
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Select Campaign</h1>
        <p className="text-muted-foreground text-sm">
          Choose a completed campaign to open its results and select leads for outreach.
        </p>
      </motion.div>

      <div className="w-full max-w-2xl flex flex-col gap-4 mb-10">
        {MOCK_CAMPAIGNS.map((campaign, i) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
          >
            <div className={cn(
              "flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl transition-all duration-300",
              "bg-background/60 backdrop-blur-xl border border-border/40",
              "hover:border-border/80 hover:bg-muted/10",
              "hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)]"
            )}>
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1">{campaign.name}</h3>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {campaign.leads} Qualified Leads
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {campaign.status} • {campaign.timeAgo}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline"
                className="w-full sm:w-auto hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors"
                onClick={() => handleOpenResults(campaign.id)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Results
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function CampaignSelectionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-pulse w-8 h-8 rounded-full border-2 border-primary/50 border-t-transparent animate-spin" />
      </div>
    }>
      <CampaignSelectionContent />
    </Suspense>
  );
}
