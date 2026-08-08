import { useState, useEffect, useCallback, useRef } from "react";
import { Campaign, campaignsApi, BackendLead } from "@/lib/api/campaigns";
import { scraperApi, ScraperStatusResponse, ScraperLogEntry } from "@/lib/api/scraper";
import { useCampaign } from "./use-campaigns";

export interface SimulatedProfile {
  id: string;
  username: string;
  followers: number;
  following: number;
  posts: number;
  websiteFound: boolean;
  emailFound: boolean;
  phoneFound: boolean;
  isBusiness: boolean;
  isVerified: boolean;
  businessCategory: string | null;
  aiScore: number;
  decision: "Qualified" | "Rejected";
  reasoning: string[];
  avatarUrl: string;
  timeQualified?: Date;
}

export interface SimulationMetrics {
  profilesFound: number;
  queued: number;
  processing: number;
  completed: number;
  qualified: number;
  rejected: number;
  duplicatesRemoved: number;
  apiRequests: number;
  runtimeSeconds: number;
  estimatedRemainingSeconds: number;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  message: string;
  type: "success" | "info" | "warning" | "error";
}

export type PipelineStage = 
  | "Searching"
  | "Collecting Profiles"
  | "Extracting Contacts"
  | "AI Qualification"
  | "Saving Leads"
  | "Completed";

export interface CampaignSimulation {
  campaign: Campaign | undefined;
  isLoading: boolean;
  metrics: SimulationMetrics;
  currentProfile: SimulatedProfile | null;
  recentQualified: SimulatedProfile[];
  activityLogs: ActivityLog[];
  progress: number;
  pipelineStage: PipelineStage;
  status: string;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

function mapBackendStage(stage: string): PipelineStage {
  switch (stage) {
    case "Loading Comments":
    case "Extracting Usernames":
      return "Collecting Profiles";
    case "Parsing Profiles":
      return "Extracting Contacts";
    case "Saving Leads":
      return "Saving Leads";
    case "Completed":
      return "Completed";
    default:
      return "Searching";
  }
}

function mapLeadToProfile(lead: BackendLead): SimulatedProfile {
  const reasoning: string[] = [];
  if (lead.email) reasoning.push(`✓ Email: ${lead.email}`);
  if (lead.phone) reasoning.push(`✓ Phone: ${lead.phone}`);
  if (lead.website) reasoning.push(`✓ Website: ${lead.website}`);
  if (lead.category) reasoning.push(`✓ Category: ${lead.category}`);
  if (reasoning.length === 0) reasoning.push("✓ Verified public profile");

  return {
    id: lead.id,
    username: lead.username,
    followers: lead.followers || 0,
    following: lead.following || 0,
    posts: 0,
    websiteFound: Boolean(lead.website),
    emailFound: Boolean(lead.email),
    phoneFound: Boolean(lead.phone),
    isBusiness: Boolean(lead.business_name || lead.category),
    isVerified: false,
    businessCategory: lead.category || null,
    aiScore: lead.qualification_status === "QUALIFIED" ? 92 : 70,
    decision: lead.qualification_status === "QUALIFIED" ? "Qualified" : "Rejected",
    reasoning,
    avatarUrl: lead.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.username)}&background=0D8ABC&color=fff`,
    timeQualified: lead.created_at ? new Date(lead.created_at) : new Date(),
  };
}

export function useCampaignSimulation(campaignId: string): CampaignSimulation {
  const { data: campaign, isLoading: isCampaignLoading } = useCampaign(campaignId);
  
  const [status, setStatus] = useState<string>("Pending");
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("Searching");
  const [progress, setProgress] = useState(0);
  
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    profilesFound: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    qualified: 0,
    rejected: 0,
    duplicatesRemoved: 0,
    apiRequests: 0,
    runtimeSeconds: 0,
    estimatedRemainingSeconds: 0,
  });
  
  const [currentProfile, setCurrentProfile] = useState<SimulatedProfile | null>(null);
  const [recentQualified, setRecentQualified] = useState<SimulatedProfile[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Fetch real status, logs, and leads from backend
  const pollBackend = useCallback(async () => {
    if (!campaignId) return;

    try {
      // 1. Get live scraper status
      const statusRes = await scraperApi.getStatus(campaignId);
      const stats = statusRes.stats;

      if (statusRes.status) {
        setStatus(
          statusRes.status === "RUNNING" ? "Running" :
          statusRes.status === "COMPLETED" ? "Completed" :
          statusRes.status === "FAILED" ? "Failed" :
          statusRes.status === "STOPPED" ? "Paused" : "Pending"
        );
      }

      if (statusRes.stage) {
        setPipelineStage(mapBackendStage(statusRes.stage));
      }

      if (stats) {
        const target = stats.target_count || 100;
        const inserted = stats.profiles_inserted || 0;
        const processed = stats.profiles_processed || 0;
        const discovered = stats.profiles_discovered || 0;
        const duplicates = stats.duplicates_skipped || 0;
        const errors = stats.errors || 0;
        const elapsed = stats.elapsed_time_sec || 0;

        const calculatedProgress = target > 0 ? Math.min(100, Math.round((inserted / target) * 100)) : 0;
        setProgress(statusRes.status === "COMPLETED" ? 100 : calculatedProgress);

        const estRemaining = inserted > 0 && inserted < target 
          ? Math.round(((target - inserted) / inserted) * elapsed)
          : 0;

        setMetrics({
          profilesFound: discovered,
          queued: Math.max(0, target - inserted),
          processing: statusRes.is_running ? 1 : 0,
          completed: processed,
          qualified: inserted,
          rejected: errors,
          duplicatesRemoved: duplicates,
          apiRequests: processed * 2 + discovered,
          runtimeSeconds: Math.round(elapsed),
          estimatedRemainingSeconds: estRemaining,
        });

        if (statusRes.current_username) {
          setCurrentProfile({
            id: statusRes.current_username,
            username: statusRes.current_username,
            followers: 0,
            following: 0,
            posts: 0,
            websiteFound: false,
            emailFound: false,
            phoneFound: false,
            isBusiness: false,
            isVerified: false,
            businessCategory: null,
            aiScore: 0,
            decision: "Qualified",
            reasoning: ["Currently parsing profile from Instagram..."],
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(statusRes.current_username)}&background=6366f1&color=fff`,
          });
        }
      }

      // 2. Get real execution logs from DB
      const logs = await scraperApi.getLogs(campaignId, 40);
      if (Array.isArray(logs)) {
        setActivityLogs(
          logs.map((l) => ({
            id: l.id,
            timestamp: l.created_at ? new Date(l.created_at) : new Date(),
            message: l.message,
            type: l.level === "CRITICAL" || l.level === "ERROR" ? "error" :
                  l.level === "WARNING" ? "warning" : "info"
          }))
        );
      }

      // 3. Get real recently saved leads from DB
      const leadsRes = await campaignsApi.getCampaignLeads(campaignId, {
        limit: 10,
        sort_by: "created_at",
        sort_order: "desc"
      });

      if (leadsRes && Array.isArray(leadsRes.items)) {
        setRecentQualified(leadsRes.items.map(mapLeadToProfile));
      }
    } catch (err) {
      console.debug("Backend status polling error:", err);
    }
  }, [campaignId]);

  useEffect(() => {
    // Initial fetch
    pollBackend();

    // Poll every 1.5 seconds
    const interval = setInterval(pollBackend, 1500);
    return () => clearInterval(interval);
  }, [pollBackend]);

  const pause = useCallback(async () => {
    try {
      await scraperApi.stopScraper(campaignId);
      setStatus("Paused");
    } catch (e) {
      console.error("Failed to pause scraper:", e);
    }
  }, [campaignId]);

  const resume = useCallback(async () => {
    try {
      if (campaign) {
        const config = campaign.config || {};
        await scraperApi.startScraper({
          campaign_id: campaignId,
          search_mode: (config.scraperType === "Comment Scraper" ? "COMMENT" : "COMMENT"),
          source_query: (config.postUrls && config.postUrls[0]) || "",
          post_urls: config.postUrls || [],
          max_profiles: config.maxProfiles || 100,
        });
        setStatus("Running");
      }
    } catch (e) {
      console.error("Failed to resume scraper:", e);
    }
  }, [campaignId, campaign]);

  const stop = useCallback(async () => {
    try {
      await scraperApi.stopScraper(campaignId);
      setStatus("Stopped");
    } catch (e) {
      console.error("Failed to stop scraper:", e);
    }
  }, [campaignId]);

  return {
    campaign,
    isLoading: isCampaignLoading,
    metrics,
    currentProfile,
    recentQualified,
    activityLogs,
    progress,
    pipelineStage,
    status,
    pause,
    resume,
    stop,
  };
}
