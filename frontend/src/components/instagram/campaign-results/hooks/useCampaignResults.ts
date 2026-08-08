import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { ResultLead } from "../types/results";
import { campaignsApi, BackendLead, Campaign } from "@/lib/api/campaigns";

export interface SortConfig {
  key: keyof ResultLead;
  direction: "asc" | "desc";
}

export interface CampaignResultsState {
  leads: ResultLead[];
  selectedIds: string[];
  drawerOpenId: string | null;
  sortConfig: SortConfig | null;
  searchTerm: string;
}

function mapBackendLeadToResultLead(lead: BackendLead): ResultLead {
  const isQualified = lead.qualification_status === "QUALIFIED" || lead.qualification_status === "PENDING";
  const positives: string[] = [];
  if (lead.email) positives.push(`Valid email address: ${lead.email}`);
  if (lead.phone) positives.push(`Phone contact: ${lead.phone}`);
  if (lead.website) positives.push(`Website URL: ${lead.website}`);
  if (lead.category) positives.push(`Category matched: ${lead.category}`);
  if (positives.length === 0) positives.push("Public active Instagram commenter");

  return {
    id: lead.id,
    avatarUrl: lead.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.username)}&background=0D8ABC&color=fff`,
    username: lead.username,
    fullName: lead.full_name,
    businessName: lead.business_name || lead.full_name || `@${lead.username}`,
    isBusinessAccount: Boolean(lead.business_name || lead.category),
    isVerified: false,
    category: lead.category || "General",
    followers: lead.followers || 0,
    following: lead.following || 0,
    posts: 0,
    bio: lead.bio || "",
    website: lead.website || null,
    email: lead.email || null,
    phone: lead.phone || null,
    whatsapp: null,
    country: lead.country || null,
    address: lead.city ? `${lead.city}${lead.country ? `, ${lead.country}` : ""}` : null,
    facebook: null,
    linkedin: null,
    externalLinks: lead.website ? [{ url: lead.website, title: "Website" }] : [],
    latestPosts: [],
    aiScore: isQualified ? 92 : 72,
    aiConfidence: 95,
    health: (lead.email || lead.phone) ? "Excellent" : lead.website ? "Good" : "Average",
    status: isQualified ? "Qualified" : "Needs Review",
    aiReasoning: {
      positive: positives,
      negative: isQualified ? [] : ["Missing direct email contact"],
      priority: isQualified ? "High" : "Medium",
    },
    source: (lead.source?.includes(":") ? lead.source.split(":")[0] : lead.source) as any || "Comment Scraper",
    enrichmentStatus: (lead.email || lead.phone || lead.website) ? "Fully Enriched" : "Partial",
    dateFound: lead.created_at ? new Date(lead.created_at) : new Date(),
    tags: lead.category ? [{ id: "tag-1", label: lead.category, color: "blue" }] : [],
    internalNotes: null,
    timeline: [
      {
        id: "evt-1",
        time: lead.created_at ? new Date(lead.created_at) : new Date(),
        event: "Discovered and saved from Instagram comment section"
      }
    ]
  };
}

export function useCampaignResults(explicitCampaignId?: string) {
  const params = useParams();
  const campaignId = explicitCampaignId || (params?.id as string);

  const [campaign, setCampaign] = useState<Campaign | undefined>(undefined);
  const [leads, setLeads] = useState<ResultLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerOpenId, setDrawerOpenId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedViews, setSavedViews] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    category: true,
    followers: true,
    following: false,
    posts: false,
    website: true,
    email: true,
    phone: true,
    aiScore: true,
    confidence: false,
    status: true,
    source: true,
    dateFound: true
  });

  const fetchLeads = useCallback(async () => {
    if (!campaignId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [campaignRes, leadsRes] = await Promise.allSettled([
        campaignsApi.getCampaign(campaignId),
        campaignsApi.getCampaignLeads(campaignId, { limit: 500, sort_by: "created_at", sort_order: "desc" })
      ]);

      if (campaignRes.status === "fulfilled") {
        setCampaign(campaignRes.value);
      }

      if (leadsRes.status === "fulfilled" && leadsRes.value?.items) {
        setLeads(leadsRes.value.items.map(mapBackendLeadToResultLead));
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error("Error fetching campaign leads:", err);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const toggleSavedView = (viewId: string) => {
    if (viewId === "all") {
      setSavedViews([]);
      return;
    }
    setSavedViews(prev => 
      prev.includes(viewId) ? prev.filter(v => v !== viewId) : [...prev, viewId]
    );
  };

  const handleSort = (key: keyof ResultLead) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    if (savedViews.length > 0) {
      if (savedViews.includes('qualified')) {
        result = result.filter(l => l.status === 'Qualified');
      }
      if (savedViews.includes('outreach')) {
        result = result.filter(l => (l.email || l.phone) && l.aiScore >= 80);
      }
      if (savedViews.includes('high-ticket')) {
        result = result.filter(l => l.followers >= 10000 || l.aiScore >= 90);
      }
      if (savedViews.includes('missing-web')) {
        result = result.filter(l => !l.website);
      }
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(l => 
        l.username.toLowerCase().includes(lower) || 
        (l.fullName && l.fullName.toLowerCase().includes(lower)) ||
        (l.businessName && l.businessName.toLowerCase().includes(lower)) ||
        (l.email && l.email.toLowerCase().includes(lower)) ||
        (l.bio && l.bio.toLowerCase().includes(lower))
      );
    }

    if (sortConfig !== null) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key] as any;
        const valB = b[sortConfig.key] as any;
        
        if (valA == null || valB == null) return 0;
        
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [leads, sortConfig, searchTerm, savedViews]);

  const toggleAll = () => {
    if (selectedIds.length === filteredAndSortedLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedLeads.map(l => l.id));
    }
  };

  // Keyboard navigation for drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!drawerOpenId) return;

      const currentIndex = filteredAndSortedLeads.findIndex(l => l.id === drawerOpenId);
      if (currentIndex === -1) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextId = filteredAndSortedLeads[Math.min(filteredAndSortedLeads.length - 1, currentIndex + 1)].id;
        setDrawerOpenId(nextId);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevId = filteredAndSortedLeads[Math.max(0, currentIndex - 1)].id;
        setDrawerOpenId(prevId);
      } else if (e.key === "Escape") {
        setDrawerOpenId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpenId, filteredAndSortedLeads]);

  return {
    campaign,
    leads: filteredAndSortedLeads,
    isLoading,
    selectedIds,
    drawerOpenId,
    searchTerm,
    sortConfig,
    savedViews,
    visibleColumns,
    refetch: fetchLeads,
    setSearchTerm,
    setDrawerOpenId,
    handleSort,
    toggleSelection,
    toggleAll,
    setSelectedIds,
    toggleSavedView,
    setVisibleColumns
  };
}
