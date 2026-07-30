"use client";

import React, { useState } from "react";
import { 
  Plus, RefreshCw, Inbox, Layers, UserCheck, AlertTriangle, Send, FileText, Clock, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// --- MOCK DATA ---
const RUNNING_CAMPAIGNS = [
  { id: "1", name: "Realtors in Miami", platform: "Instagram", status: "Running", sent: 142, remaining: 858, total: 1000, eta: "2h 15m" },
  { id: "2", name: "B2B SaaS Founders", platform: "LinkedIn", status: "Running", sent: 45, remaining: 105, total: 150, eta: "45m" },
  { id: "3", name: "Tech CTOs SF", platform: "LinkedIn", status: "Running", sent: 12, remaining: 288, total: 300, eta: "3h 40m" },
];

const RECENT_CAMPAIGNS = [
  { id: "1", name: "Miami Luxury Homes", platform: "Instagram", status: "Running", leads: 1000, created: "2 hrs ago" },
  { id: "2", name: "Tech CTOs SF", platform: "LinkedIn", status: "Completed", leads: 150, created: "1 day ago" },
  { id: "3", name: "Plumbers in Texas", platform: "Instagram", status: "Draft", leads: 0, created: "2 days ago" },
];

const TOP_TEMPLATES = [
  { id: "1", name: "Florida Realtor Intro", platform: "Instagram", uses: 342 },
  { id: "2", name: "B2B Connection Request", platform: "LinkedIn", uses: 128 },
  { id: "3", name: "SEO Audit Pitch", platform: "LinkedIn", uses: 89 },
];

const RECENT_ACTIVITY = [
  { type: "Queue Started", desc: "Started outreach for 'Miami Luxury Homes'", time: "10 mins ago", icon: Inbox, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { type: "Template Updated", desc: "Edited 'Florida Realtor Intro'", time: "1 hr ago", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
  { type: "CSV Imported", desc: "Imported 1,000 leads for 'Realtors in Miami'", time: "2 hrs ago", icon: UserCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
  { type: "Campaign Created", desc: "Created 'Miami Luxury Homes' campaign", time: "2 hrs ago", icon: Layers, color: "text-purple-500", bg: "bg-purple-500/10" },
];

// ------------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------------
export default function DashboardPage() {
  const router = useRouter();
  const [dateFilter, setDateFilter] = useState("7 Days");

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto w-full">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor campaigns and outreach automation from one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-background border border-border/60 rounded-md p-1 mr-2">
            {["Today", "7 Days", "30 Days"].map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded transition-colors",
                  dateFilter === filter ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 bg-background">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button size="sm" className="h-9 px-4 font-medium" onClick={() => router.push("/instagram/new")}>
            <Plus className="h-4 w-4 mr-1.5" /> New Campaign
          </Button>
        </div>
      </div>

      {/* KPI CARDS (5) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Campaigns", value: "12", icon: Layers },
          { label: "Qualified Leads", value: "2,450", icon: UserCheck, highlight: true },
          { label: "Messages Sent", value: "1,842", icon: Send, highlight: true },
          { label: "Failed Messages", value: "3", icon: AlertTriangle, danger: true },
          { label: "Templates", value: "24", icon: FileText },
        ].map((kpi, i) => (
          <div key={i} className={cn("flex flex-col p-4 rounded-xl border border-border/40 bg-background shadow-sm hover:border-border transition-colors", kpi.highlight && "bg-muted/30 border-border/60")}>
            <div className="flex items-center justify-between mb-3">
              <span className={cn("text-xs font-semibold uppercase tracking-wider", kpi.highlight ? "text-foreground/80" : "text-muted-foreground")}>{kpi.label}</span>
              <kpi.icon className={cn("h-4 w-4", kpi.danger ? "text-red-500" : (kpi.highlight ? "text-foreground/80" : "text-muted-foreground/50"))} />
            </div>
            <span className={cn("text-2xl font-bold tracking-tight", kpi.danger && "text-red-500")}>{kpi.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Running Campaigns (2/3 width on xl screens) */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm pl-1">Running Campaigns</h3>
          </div>
          
          {RUNNING_CAMPAIGNS.length > 0 ? (
            <div className="flex flex-col gap-4">
              {RUNNING_CAMPAIGNS.map((campaign) => (
                <div 
                  key={campaign.id} 
                  className="flex flex-col p-4 rounded-xl border border-border/40 bg-background shadow-sm hover:border-foreground/20 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        {campaign.platform === "Instagram" ? <FaInstagram className="text-pink-500 w-3.5 h-3.5 opacity-90" /> : <FaLinkedin className="text-[#0077b5] w-3.5 h-3.5 opacity-90" />}
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-blue-500/10 text-blue-500 border-blue-500/20">{campaign.status}</span>
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-1">{campaign.name}</h4>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => router.push(`/outreach/queue/${campaign.id}`)}
                      className="h-7 px-2.5 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1"
                    >
                      View Queue <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{campaign.sent} / {campaign.total} Sent</span>
                      <span className="text-muted-foreground">{campaign.remaining} Remaining</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 bg-muted/60 rounded-full overflow-hidden relative">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${(campaign.sent / campaign.total) * 100}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground w-8 text-right">{Math.round((campaign.sent / campaign.total) * 100)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                       <span className="flex items-center gap-1.5">
                         <Clock className="w-3 h-3 opacity-70" /> ETA: {campaign.eta}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border/60 bg-background/50 h-64">
              <div className="h-12 w-12 rounded-full bg-muted/30 border border-border/50 flex items-center justify-center mb-4">
                <Layers className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1.5">No campaigns are currently running.</h3>
              <p className="text-sm text-muted-foreground max-w-[280px] mb-6">Create a campaign to begin outreach and view it here.</p>
              <Button size="sm" onClick={() => router.push("/instagram/new")}>
                <Plus className="h-4 w-4 mr-1.5" /> Create Campaign
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (1/3 width on xl screens) */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          
          {/* TODAY'S AUTOMATION */}
          <div className="flex flex-col p-5 rounded-xl border border-border/40 bg-background shadow-sm gap-4">
            <h3 className="font-semibold text-sm">Today&apos;s Automation</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Messages Sent</span>
                <span className="text-lg font-bold text-foreground">342</span>
              </div>
              <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Qualified Leads</span>
                <span className="text-lg font-bold text-foreground">45</span>
              </div>
              <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Running Queues</span>
                <span className="text-lg font-bold text-foreground">2</span>
              </div>
              <div className="flex flex-col gap-0.5 p-3 rounded-lg bg-muted/20 border border-border/40">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Failed</span>
                <span className="text-lg font-bold text-red-500">1</span>
              </div>
            </div>
          </div>

          {/* RECENT CAMPAIGNS */}
          <div className="flex flex-col rounded-xl border border-border/40 bg-background shadow-sm">
            <div className="px-5 py-4 border-b border-border/40 flex justify-between items-center">
              <h3 className="font-semibold text-sm">Recent Campaigns</h3>
              <button className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col">
              {RECENT_CAMPAIGNS.map((campaign, i) => (
                <div 
                  key={campaign.id} 
                  className={cn(
                    "flex items-center justify-between px-5 py-3 hover:bg-muted/30 cursor-pointer transition-colors group",
                    i !== RECENT_CAMPAIGNS.length - 1 && "border-b border-border/40"
                  )}
                  onClick={() => router.push(`/instagram/campaigns/${campaign.id}`)}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      {campaign.platform === "Instagram" ? <FaInstagram className="text-pink-500 w-3 h-3 opacity-80" /> : <FaLinkedin className="text-[#0077b5] w-3 h-3 opacity-80" />}
                      <span className="text-[13px] font-semibold line-clamp-1">{campaign.name}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">{campaign.leads} leads • {campaign.created}</span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                    campaign.status === "Running" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : 
                    campaign.status === "Completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                    "bg-muted text-muted-foreground border-border"
                  )}>
                    {campaign.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TOP TEMPLATES */}
          <div className="flex flex-col rounded-xl border border-border/40 bg-background shadow-sm">
            <div className="px-5 py-4 border-b border-border/40">
              <h3 className="font-semibold text-sm">Top Templates</h3>
            </div>
            <div className="flex flex-col">
              {TOP_TEMPLATES.map((template, i) => (
                <div 
                  key={template.id} 
                  className={cn(
                    "flex items-center justify-between px-5 py-3 hover:bg-muted/30 cursor-pointer transition-colors",
                    i !== TOP_TEMPLATES.length - 1 && "border-b border-border/40"
                  )}
                  onClick={() => router.push("/outreach/templates")}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      {template.platform === "Instagram" ? <FaInstagram className="text-pink-500 w-3 h-3 opacity-80" /> : <FaLinkedin className="text-[#0077b5] w-3 h-3 opacity-80" />}
                      <span className="text-[13px] font-semibold line-clamp-1">{template.name}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">{template.uses} Runs</span>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT ACTIVITY TIMELINE */}
          <div className="flex flex-col rounded-xl border border-border/40 bg-background shadow-sm overflow-hidden h-max">
            <div className="px-5 py-4 border-b border-border/40 bg-muted/10">
              <h3 className="font-semibold text-sm">Recent Activity</h3>
            </div>
            <div className="p-6 flex flex-col gap-5">
              {RECENT_ACTIVITY.map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 border border-background shadow-sm", activity.bg)}>
                      <activity.icon className={cn("w-3.5 h-3.5", activity.color)} />
                    </div>
                    {i !== RECENT_ACTIVITY.length - 1 && (
                      <div className="w-px h-full bg-border/60 absolute top-7" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 pt-0.5 pb-2">
                    <span className="text-[13px] font-semibold text-foreground/90">{activity.type}</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">{activity.desc}</span>
                    <span className="text-[10px] font-medium text-muted-foreground/60 mt-0.5">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
