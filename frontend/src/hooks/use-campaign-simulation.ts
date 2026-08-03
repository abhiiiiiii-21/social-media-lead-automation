import { useState, useEffect, useCallback, useRef } from "react";
import { Campaign } from "@/lib/api/campaigns";
import { CampaignStatus } from "@/lib/types/instagram";
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

const FAKE_USERNAMES = ["floridahomes", "miamirealtor", "luxuryhomes", "naplesrealty", "tampabuilder", "orlandoremax", "zillow_agent", "sunshinerealty"];
const FAKE_CATEGORIES = ["Real Estate", "Brokerage", "Property Management", "Agent"];
const FAKE_REASONS = [
  "✓ Business account",
  "✓ Website found",
  "✓ High engagement",
  "✓ Realtor keywords detected",
  "✓ Recent activity",
  "✓ Valid contact info",
  "✓ High follower quality"
];
const FAKE_REJECT_REASONS = [
  "× Personal profile",
  "× No website",
  "× Low activity",
  "× Spam indicators",
  "× Wrong industry"
];

const generateFakeProfile = (): SimulatedProfile => {
  const isQualified = Math.random() > 0.3;
  const score = isQualified ? Math.floor(Math.random() * 20 + 80) : Math.floor(Math.random() * 40 + 30);
  
  const shuffled = [...FAKE_REASONS].sort(() => 0.5 - Math.random());
  const reasons = shuffled.slice(0, isQualified ? 4 : 1);
  
  if (!isQualified) {
    reasons.push(FAKE_REJECT_REASONS[Math.floor(Math.random() * FAKE_REJECT_REASONS.length)]);
    if (Math.random() > 0.5) reasons.push(FAKE_REJECT_REASONS[Math.floor(Math.random() * FAKE_REJECT_REASONS.length)]);
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    username: FAKE_USERNAMES[Math.floor(Math.random() * FAKE_USERNAMES.length)] + Math.floor(Math.random() * 999),
    followers: Math.floor(Math.random() * 20000 + 1000),
    following: Math.floor(Math.random() * 2000 + 100),
    posts: Math.floor(Math.random() * 1500 + 50),
    websiteFound: isQualified ? true : Math.random() > 0.5,
    emailFound: isQualified ? Math.random() > 0.2 : Math.random() > 0.8,
    phoneFound: isQualified ? Math.random() > 0.5 : Math.random() > 0.9,
    isBusiness: isQualified ? true : Math.random() > 0.5,
    isVerified: Math.random() > 0.8,
    businessCategory: FAKE_CATEGORIES[Math.floor(Math.random() * FAKE_CATEGORIES.length)],
    aiScore: score,
    decision: isQualified ? "Qualified" : "Rejected",
    reasoning: reasons,
    avatarUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
    timeQualified: isQualified ? new Date() : undefined,
  };
};

export function useCampaignSimulation(campaignId: string): CampaignSimulation {
  const { data: campaign, isLoading } = useCampaign(campaignId);
  
  const [status, setStatus] = useState<string>("Pending");
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
    estimatedRemainingSeconds: 300,
  });
  
  const [currentProfile, setCurrentProfile] = useState<SimulatedProfile | null>(null);
  const [recentQualified, setRecentQualified] = useState<SimulatedProfile[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("Searching");

  const loopRef = useRef<NodeJS.Timeout | null>(null);
  const runtimeRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((message: string, type: ActivityLog["type"] = "info") => {
    setActivityLogs(prev => [
      { id: Math.random().toString(), timestamp: new Date(), message, type },
      ...prev
    ].slice(0, 100));
  }, []);

  useEffect(() => {
    if (campaign && status === "Pending") {
      setStatus("Connecting" as CampaignStatus);
      addLog("Generated AI search query", "info");
      
      if (campaign.status === "Completed") {
        setStatus("Completed");
        setPipelineStage("Completed");
        setProgress(100);
        setMetrics(prev => ({
          ...prev,
          profilesFound: 250,
          completed: 100,
          qualified: 10,
          rejected: 90,
          duplicatesRemoved: 40,
        }));
      }
    }
  }, [campaign, status, addLog]);

  useEffect(() => {
    if (status === "Completed" || status === "Failed" || status === "Pending") {
      return;
    }

    if (status === ("Connecting" as any)) {
      const timer = setTimeout(() => {
        addLog("Searching Instagram...", "info");
        setStatus("Collecting");
        setPipelineStage("Searching");
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (status === ("Paused" as any)) {
      return;
    }

    runtimeRef.current = setInterval(() => {
      setMetrics(prev => ({ 
        ...prev, 
        runtimeSeconds: prev.runtimeSeconds + 1,
        estimatedRemainingSeconds: Math.max(0, prev.estimatedRemainingSeconds - 1)
      }));
    }, 1000);

    let stageCounter = 0;

    loopRef.current = setInterval(() => {
      stageCounter++;
      
      if (Math.random() < 0.05) {
        addLog("Rate limit detected", "warning");
        setTimeout(() => addLog("Retrying...", "info"), 1000);
        return;
      }
      
      setProgress(p => {
        const newProgress = Math.min(100, p + (Math.random() * 0.8));
        
        if (newProgress >= 100) {
          setStatus("Completed");
          setPipelineStage("Completed");
          addLog("Saving to database", "success");
          return 100;
        }

        if (newProgress < 20 && pipelineStage !== "Searching") {
          setPipelineStage("Searching");
        } else if (newProgress >= 20 && newProgress < 40 && pipelineStage !== "Collecting Profiles") {
          setPipelineStage("Collecting Profiles");
          addLog(`Retrieved ${Math.floor(newProgress * 125)} profiles`, "success");
          addLog("Removing duplicates", "info");
        } else if (newProgress >= 40 && newProgress < 60 && pipelineStage !== "Extracting Contacts") {
          setPipelineStage("Extracting Contacts");
          addLog("Downloading metadata", "info");
        } else if (newProgress >= 60 && newProgress < 90 && pipelineStage !== "AI Qualification") {
          setPipelineStage("AI Qualification");
        } else if (newProgress >= 90 && pipelineStage !== "Saving Leads") {
          setPipelineStage("Saving Leads");
        }
        
        return newProgress;
      });

      setMetrics(prev => {
        const found = prev.profilesFound + Math.floor(Math.random() * 8);
        const processing = Math.floor(Math.random() * 3) + 1;
        const newCompleted = prev.completed + 1;
        const queued = Math.max(0, found - newCompleted - processing);
        const dupes = prev.duplicatesRemoved + (Math.random() > 0.7 ? 1 : 0);
        
        return {
          ...prev,
          profilesFound: found,
          queued,
          processing,
          completed: newCompleted,
          duplicatesRemoved: dupes,
          apiRequests: prev.apiRequests + Math.floor(Math.random() * 3) + 1,
        };
      });

      if (progress > 40) {
        if (stageCounter % 4 === 0) addLog("Checking website", "info");
        else if (stageCounter % 5 === 0) addLog("Checking email", "info");
        else if (stageCounter % 6 === 0) addLog("Checking phone", "info");
      }

      if (progress > 60) {
        const profile = generateFakeProfile();
        setCurrentProfile(profile);
        
        setMetrics(prev => ({
          ...prev,
          qualified: profile.decision === "Qualified" ? prev.qualified + 1 : prev.qualified,
          rejected: profile.decision === "Rejected" ? prev.rejected + 1 : prev.rejected,
        }));

        if (profile.decision === "Qualified") {
          setRecentQualified(prev => [profile, ...prev].slice(0, 10));
          addLog(`AI Score: ${profile.aiScore}`, "success");
          addLog("Lead Qualified", "success");
        }
      }

    }, 2000);

    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
      if (runtimeRef.current) clearInterval(runtimeRef.current);
    };
  }, [status, progress, pipelineStage, addLog]);

  const pause = useCallback(() => {
    setStatus("Paused" as any);
    addLog("Campaign Paused by user", "warning");
  }, [addLog]);

  const resume = useCallback(() => {
    setStatus("Collecting");
    addLog("Campaign Resumed", "info");
  }, [addLog]);

  const stop = useCallback(() => {
    setStatus("Completed");
    setPipelineStage("Completed");
    setProgress(100);
    setCurrentProfile(null);
    setMetrics(prev => ({ ...prev, processing: 0, queued: 0 }));
    addLog("Campaign Stopped and Saved", "success");
  }, [addLog]);

  return {
    campaign,
    isLoading,
    metrics,
    currentProfile,
    recentQualified,
    activityLogs,
    progress,
    pipelineStage,
    status,
    pause,
    resume,
    stop
  };
}
