import { useState, useEffect, useMemo } from "react";
import { ResultLead } from "../types/results";
import { generateMockLeads } from "../mock/generate-leads";

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

export function useCampaignResults() {
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
    website: false,
    email: false,
    phone: false,
    aiScore: true,
    confidence: false,
    status: true,
    source: true,
    dateFound: true
  });

  useEffect(() => {
    // Simulate initial data fetch
    const fetchLeads = async () => {
      setIsLoading(true);
      setTimeout(() => {
        setLeads(generateMockLeads(250));
        setIsLoading(false);
      }, 800);
    };
    fetchLeads();
  }, []);

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
  }, [drawerOpenId, leads, sortConfig, searchTerm]);

  const toggleSavedView = (viewId: string) => {
    if (viewId === "all") {
      setSavedViews([]);
      return;
    }
    setSavedViews(prev => 
      prev.includes(viewId) ? prev.filter(v => v !== viewId) : [...prev, viewId]
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
        (l.businessName && l.businessName.toLowerCase().includes(lower))
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

  return {
    leads: filteredAndSortedLeads,
    isLoading,
    selectedIds,
    drawerOpenId,
    searchTerm,
    sortConfig,
    savedViews,
    visibleColumns,
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
