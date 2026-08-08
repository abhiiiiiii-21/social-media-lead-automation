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
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Database,
  Search,
  Download,
  Trash2,
  ExternalLink,
  MessageSquare,
  Hash,
  User,
  Sparkles
} from "lucide-react";
import { Campaign, campaignsApi } from "@/lib/api/campaigns";
import { useDeleteCampaign } from "@/hooks/use-campaigns";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface CampaignsTableProps {
  campaigns: Campaign[] | undefined;
  isLoading: boolean;
}

export function CampaignsTable({ campaigns, isLoading }: CampaignsTableProps) {
  const router = useRouter();
  const { mutateAsync: deleteCampaign } = useDeleteCampaign();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
      case "pending":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-border/50 font-medium">
            Pending
          </Badge>
        );
      case "active":
      case "running":
      case "collecting":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-medium">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Running
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
      case "stopped":
      case "paused":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-medium">
            Stopped
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

  const getScraperTypeIcon = (type?: string | null) => {
    const t = (type || "").toLowerCase();
    if (t.includes("comment")) return <MessageSquare className="h-3.5 w-3.5 text-blue-500 mr-1.5" />;
    if (t.includes("hashtag")) return <Hash className="h-3.5 w-3.5 text-emerald-500 mr-1.5" />;
    if (t.includes("profile")) return <User className="h-3.5 w-3.5 text-purple-500 mr-1.5" />;
    return <Sparkles className="h-3.5 w-3.5 text-amber-500 mr-1.5" />;
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this campaign and all its scraped leads?")) {
      try {
        await deleteCampaign(id);
      } catch (err) {
        console.error("Failed to delete campaign:", err);
      }
    }
  };

  const handleExport = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    window.open(campaignsApi.getExportUrl(id, "csv"), "_blank");
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
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
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
            <TableHead className="font-medium">Created</TableHead>
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const scraperType = campaign.scraper_type || campaign.scraperType || campaign.config?.scraperType || "Comment Scraper";
            const leadCount = campaign.lead_count ?? 0;
            const targetCount = Number(campaign.config?.maxProfiles) || 100;
            const progressPct = targetCount > 0 ? Math.min(100, Math.round((leadCount / targetCount) * 100)) : 0;
            
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
                  <div className="flex items-center text-xs font-medium text-muted-foreground">
                    {getScraperTypeIcon(scraperType)}
                    <span>{scraperType}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(campaign.status || "Unknown")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5 w-full max-w-[150px]">
                    <div className="h-1.5 w-full bg-muted overflow-hidden rounded-full">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {leadCount} / {targetCount} collected ({progressPct}%)
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
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-xs"
                      onClick={() => router.push(`/instagram/campaigns/${campaign.id}/results`)}
                      title="View Lead Results"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Results
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={(e) => handleExport(e, campaign.id)}
                      title="Export CSV"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => handleDelete(e, campaign.id)}
                      title="Delete Campaign"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
