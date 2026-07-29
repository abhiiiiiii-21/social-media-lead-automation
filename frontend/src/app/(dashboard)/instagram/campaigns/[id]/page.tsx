"use client";

import React, { use } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pause, Trash2, Download, Users, UserX, Globe, Mail, Phone, Activity, CheckCircle2 } from "lucide-react";
import { useScrapingCampaign } from "@/hooks/use-instagram";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrapingProgress } from "@/components/instagram/scraping-progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function InstagramCampaignDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: campaign, isLoading } = useScrapingCampaign(resolvedParams.id);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>
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

  const m = campaign.metrics || {
    qualified: 0,
    rejected: 0,
    websitesFound: 0,
    emailsFound: 0,
    phonesFound: 0,
    averageQualityScore: 0
  };

  const MetricCard = ({ title, value, icon: Icon, subtitle, className }: any) => (
    <Card className="rounded-xl border-border/50 bg-background/50 shadow-none">
      <CardHeader className="pb-2 px-6 pt-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground/50" />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-5 pt-1">
        <div className={cn("text-3xl font-bold tabular-nums tracking-tighter", className)}>
          {value.toLocaleString()}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-md bg-muted/30 hover:bg-muted"
            onClick={() => router.push("/instagram/campaigns")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
                {campaign.name}
              </h1>
              <Badge variant="outline" className="bg-muted/50 border-border/50 text-muted-foreground font-medium">
                {campaign.scraperType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Campaign Information • Started on {new Date(campaign.startedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status !== "Completed" && campaign.status !== "Failed" && (
            <Button variant="outline" size="sm" className="h-9 gap-1.5 font-medium border-amber-500/20 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10 hover:text-amber-700">
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-9 gap-1.5 font-medium border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
          <Button size="sm" className="h-9 gap-1.5 font-medium" onClick={() => router.push("/instagram/results")}>
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard title="Profiles Collected" value={campaign.targetCount} icon={Users} subtitle="Raw profiles gathered" className="text-foreground" />
        <MetricCard title="Qualified Leads" value={m.qualified} icon={CheckCircle2} subtitle="Passed advanced filters" className="text-emerald-500" />
        <MetricCard title="Rejected" value={m.rejected} icon={UserX} subtitle="Failed filter criteria" className="text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard title="Websites Found" value={m.websitesFound} icon={Globe} />
            <MetricCard title="Emails Found" value={m.emailsFound} icon={Mail} />
            <MetricCard title="Phones Found" value={m.phonesFound} icon={Phone} />
            <MetricCard title="Est. Quality Score" value={`${m.averageQualityScore}/100`} icon={Activity} className="text-blue-500" />
          </div>

          <div className="border border-border/50 rounded-xl p-6 bg-background/50">
            <h3 className="text-sm font-semibold tracking-tight mb-4">Configuration Details</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              {Object.entries(campaign.config).map(([key, value]) => {
                if (value === undefined || value === null || value === "") return null;
                const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                const displayValue = Array.isArray(value) ? value.join(", ") : 
                                     typeof value === "boolean" ? (value ? "Yes" : "No") : 
                                     value.toString();
                return (
                  <div key={key}>
                    <p className="text-muted-foreground capitalize">{formattedKey}</p>
                    <p className="font-medium mt-1 truncate" title={displayValue}>{displayValue}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <ScrapingProgress campaign={campaign} />
        </div>
      </div>
    </div>
  );
}
