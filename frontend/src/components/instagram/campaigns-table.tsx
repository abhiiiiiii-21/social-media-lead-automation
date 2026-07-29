"use client";

import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Database,
  Search,
  Filter
} from "lucide-react";
import { ScrapingCampaign, CampaignStatus } from "@/lib/types/instagram";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, formatDistance } from "date-fns";

interface CampaignsTableProps {
  campaigns: ScrapingCampaign[] | undefined;
  isLoading: boolean;
}

export function CampaignsTable({ campaigns, isLoading }: CampaignsTableProps) {
  const router = useRouter();

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border/50 font-medium">
            Pending
          </Badge>
        );
      case "Collecting":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-medium">
            <Search className="h-3 w-3 mr-1" /> Collecting
          </Badge>
        );
      case "Filtering":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-medium">
            <Filter className="h-3 w-3 mr-1" /> Filtering
          </Badge>
        );
      case "Enriching":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 font-medium">
            <Database className="h-3 w-3 mr-1 animate-pulse" /> Enriching
          </Badge>
        );
      case "Completed":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "Failed":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium">
            <AlertCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border/50 font-medium">
            Unknown
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="border border-border/50 rounded-lg overflow-hidden bg-background">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Scraper Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Profiles Scraped</TableHead>
              <TableHead>Started</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                <TableCell>
                  <div className="space-y-2 w-full max-w-[150px]">
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-border/50 rounded-lg bg-muted/5">
        <div className="h-12 w-12 rounded-full bg-background border border-border/50 flex items-center justify-center mb-4 shadow-sm">
          <Database className="h-5 w-5 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-foreground">No scraping campaigns yet</p>
        <p className="text-xs text-muted-foreground mt-1">Go to 'New Campaign' to start scraping leads.</p>
      </div>
    );
  }

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-background">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-medium">Campaign Name</TableHead>
            <TableHead className="font-medium">Scraper Type</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Profiles Scraped</TableHead>
            <TableHead className="font-medium">Duration / Started</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const isFinished = campaign.status === "Completed" || campaign.status === "Failed";
            
            return (
              <TableRow 
                key={campaign.id}
                className="hover:bg-muted/10 transition-colors cursor-pointer"
                onClick={() => router.push(`/instagram/campaigns/${campaign.id}`)}
              >
                <TableCell>
                  <span className="text-sm font-semibold text-foreground tracking-tight">
                    {campaign.name}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-muted-foreground">
                    {campaign.scraperType}
                  </span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(campaign.status)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5 w-full max-w-[150px]">
                    <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                      <div 
                        className="h-full bg-foreground transition-all duration-500"
                        style={{ width: `${campaign.targetCount === 0 ? 0 : (campaign.collectedCount / campaign.targetCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {campaign.collectedCount} / {campaign.targetCount} collected
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    {campaign.completedAt ? (
                      <span className="text-xs font-medium text-foreground">
                        {formatDistance(new Date(campaign.startedAt), new Date(campaign.completedAt))}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> In Progress
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(campaign.startedAt), { addSuffix: true })}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
