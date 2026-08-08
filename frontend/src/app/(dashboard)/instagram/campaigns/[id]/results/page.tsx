"use client";

import React, { use } from "react";
import { useCampaignResults } from "@/components/instagram/campaign-results/hooks/useCampaignResults";
import { ResultsHeader } from "@/components/instagram/campaign-results/components/ResultsHeader";
import { CampaignFunnel } from "@/components/instagram/campaign-results/components/CampaignFunnel";
import { ResultsFilterBar } from "@/components/instagram/campaign-results/components/ResultsFilterBar";
import { ResultsBulkActionBar } from "@/components/instagram/campaign-results/components/ResultsBulkActionBar";
import { ResultsDataTable } from "@/components/instagram/campaign-results/components/ResultsDataTable";
import { LeadDetailsDrawer } from "@/components/instagram/campaign-results/components/drawer/LeadDetailsDrawer";
import { SavedViewsBar } from "@/components/instagram/campaign-results/components/SavedViewsBar";
import { ResultsMetricsGrid } from "@/components/instagram/campaign-results/components/ResultsMetricsGrid";
import { Loader2 } from "lucide-react";

export default function CampaignResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const {
    campaign,
    leads,
    isLoading,
    selectedIds,
    drawerOpenId,
    searchTerm,
    sortConfig,
    savedViews,
    visibleColumns,
    refetch,
    setSearchTerm,
    setDrawerOpenId,
    handleSort,
    toggleSelection,
    toggleAll,
    setSelectedIds,
    toggleSavedView,
    setVisibleColumns
  } = useCampaignResults(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="font-medium">Loading campaign results from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20 max-w-full">
      <ResultsHeader 
        totalCount={leads.length} 
        campaign={campaign} 
        onRefresh={refetch}
      />
      
      <CampaignFunnel leads={leads} />

      <ResultsMetricsGrid leads={leads} />

      <div className="flex flex-col gap-4">
        <SavedViewsBar 
          currentViews={savedViews}
          onViewChange={toggleSavedView}
        />
        
        <ResultsFilterBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          totalCount={leads.length} 
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
        />
        
        <ResultsDataTable 
          leads={leads}
          selectedIds={selectedIds}
          toggleSelection={toggleSelection}
          toggleAll={toggleAll}
          onRowClick={setDrawerOpenId}
          sortConfig={sortConfig}
          handleSort={handleSort}
          visibleColumns={visibleColumns}
        />
      </div>

      <ResultsBulkActionBar 
        selectedCount={selectedIds.length} 
        onClear={() => setSelectedIds([])} 
      />

      <LeadDetailsDrawer 
        leadId={drawerOpenId}
        leads={leads}
        onClose={() => setDrawerOpenId(null)}
      />
    </div>
  );
}
