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
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Database,
  Search,
  Filter
} from "lucide-react";
import { Campaign } from "@/lib/api/campaigns";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, formatDistance } from "date-fns";

interface CampaignsTableProps {
  campaigns: Campaign[] | undefined;
  isLoading: boolean;
}

export function CampaignsTable({ campaigns, isLoading }: CampaignsTableProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
      case "pending":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border/50 font-medium">
            {status}
          </Badge>
        );
      case "active":
      case "running":
      case "collecting":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-medium">
            <Search className="h-3 w-3 mr-1" /> {status}
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium">
            <AlertCircle className="h-3 w-3 mr-1" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border/50 font-medium">
            {status}
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
        <p className="text-xs text-muted-foreground mt-1">Go to &apos;New Campaign&apos; to start scraping leads.</p>
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
            const isFinished = campaign.status?.toLowerCase() === "completed" || campaign.status?.toLowerCase() === "failed";
            
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
                    Search
                  </span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(campaign.status || "Unknown")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5 w-full max-w-[150px]">
                    <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                      <div 
                        className="h-full bg-foreground transition-all duration-500"
                        style={{ width: `0%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      0 / 0 collected
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
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
