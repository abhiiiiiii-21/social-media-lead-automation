"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, FileText, Send, MoreHorizontal, Search, CheckCircle2,
  Inbox, XCircle, LayoutTemplate, Trash2, Mail, PlayCircle, 
  PauseCircle, Settings, Download, Activity, Eye, Info, Clock, Check, Users, RefreshCcw, AlertTriangle, Percent
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LeadDetailsDrawer } from "@/components/instagram/campaign-results/components/drawer/LeadDetailsDrawer";
import { ResultLead } from "@/components/instagram/campaign-results/types/results";

// ----------------------------------------------------------------------
// TYPES & MOCKS
// ----------------------------------------------------------------------

type DashboardState = "Ready" | "Running" | "Completed";
type MessageStatus = "Ready" | "Sending" | "Sent" | "Paused" | "Failed" | "Retrying";

interface OutreachLead extends ResultLead {
  messageStatus: MessageStatus;
  attempts: number;
  lastAttempt: string | null;
  lastActivity: string;
}

const MOCK_LEADS: OutreachLead[] = [
  {
    id: "lead_1",
    avatarUrl: "https://i.pravatar.cc/150?u=1",
    username: "miamirealtor.jane",
    businessName: "Jane Doe Real Estate",
    isBusinessAccount: true,
    isVerified: true,
    category: "Real Estate Agent",
    followers: 12400,
    following: 850,
    posts: 412,
    bio: "Top producer in Miami 🌴 | Helping you find your dream home.",
    website: "janedoe.com",
    email: "jane@janedoe.com",
    phone: null,
    whatsapp: null,
    country: "US",
    address: "Miami, FL",
    facebook: null,
    linkedin: null,
    aiScore: 95,
    aiConfidence: 0.98,
    health: "Excellent",
    status: "Qualified",
    aiReasoning: { positive: [], negative: [] },
    source: "Hashtag Scraper",
    enrichmentStatus: "Fully Enriched",
    dateFound: new Date(),
    tags: [{ id: "t1", label: "High Priority", color: "bg-red-500/10 text-red-500 border-red-500/20" }],
    internalNotes: null,
    timeline: [],
    messageStatus: "Sent",
    attempts: 1,
    lastAttempt: "10:30 AM",
    lastActivity: "Message sent successfully"
  },
  {
    id: "lead_2",
    avatarUrl: "https://i.pravatar.cc/150?u=2",
    username: "florida.homes.expert",
    businessName: "Florida Homes Expert",
    isBusinessAccount: true,
    isVerified: false,
    category: "Real Estate Broker",
    followers: 8500,
    following: 1200,
    posts: 320,
    bio: "Your trusted broker in South Florida.",
    website: "floridahomes.expert",
    email: "hello@floridahomes.expert",
    phone: null,
    whatsapp: null,
    country: "US",
    address: "Boca Raton, FL",
    facebook: null,
    linkedin: null,
    aiScore: 88,
    aiConfidence: 0.92,
    health: "Good",
    status: "Qualified",
    aiReasoning: { positive: [], negative: [] },
    source: "Hashtag Scraper",
    enrichmentStatus: "Fully Enriched",
    dateFound: new Date(),
    tags: [],
    internalNotes: null,
    timeline: [],
    messageStatus: "Retrying",
    attempts: 2,
    lastAttempt: "11:15 AM",
    lastActivity: "Rate limit detected, waiting..."
  },
  {
    id: "lead_3",
    avatarUrl: "https://i.pravatar.cc/150?u=3",
    username: "luxury.properties.fl",
    businessName: null,
    isBusinessAccount: false,
    isVerified: false,
    category: "Real Estate",
    followers: 3200,
    following: 500,
    posts: 150,
    bio: "Luxury properties in FL.",
    website: null,
    email: null,
    phone: null,
    whatsapp: null,
    country: "US",
    address: "FL",
    facebook: null,
    linkedin: null,
    aiScore: 75,
    aiConfidence: 0.85,
    health: "Average",
    status: "Qualified",
    aiReasoning: { positive: [], negative: [] },
    source: "AI Discovery",
    enrichmentStatus: "Not Enriched",
    dateFound: new Date(),
    tags: [],
    internalNotes: null,
    timeline: [],
    messageStatus: "Ready",
    attempts: 0,
    lastAttempt: null,
    lastActivity: "Added to Queue"
  }
];

const MOCK_ACTIVITIES = [
  { time: "09:30", text: "Added @john to queue", type: "info" },
  { time: "09:31", text: "Sending message to @john", type: "info" },
  { time: "09:31", text: "Waiting 65 seconds", type: "wait" },
  { time: "09:32", text: "Message sent to @john", type: "success" },
  { time: "09:35", text: "Rate limit detected", type: "error" },
  { time: "09:36", text: "Retrying in 5 minutes", type: "warning" },
  { time: "09:41", text: "Queue resumed", type: "success" },
  { time: "09:45", text: "Failed to send to @mike", type: "error" },
  { time: "09:46", text: "Queue paused by user", type: "warning" },
];

const FILTER_CHIPS = ["All", "Ready", "Sending", "Sent", "Paused", "Failed", "Retrying"];

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------

export default function OutreachDashboardPage() {
  const router = useRouter();
  
  // States
  const [dashboardState, setDashboardState] = useState<DashboardState>("Running");
  const [hasTemplate, setHasTemplate] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [selectedLeadIdForDrawer, setSelectedLeadIdForDrawer] = useState<string | null>(null);

  // Live Activity Auto-scroll
  const activityEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    activityEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dashboardState]);

  // Table Helpers
  const toggleLeadSelection = (id: string) => {
    const newSet = new Set(selectedLeads);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedLeads(newSet);
  };

  const toggleAllLeads = () => {
    if (selectedLeads.size === MOCK_LEADS.length) setSelectedLeads(new Set());
    else setSelectedLeads(new Set(MOCK_LEADS.map(l => l.id)));
  };

  const clearSelection = () => setSelectedLeads(new Set());

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case "Ready": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      case "Sending": return "bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse";
      case "Sent": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Paused": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "Retrying": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getActivityIcon = (type: string) => {
    switch(type) {
      case "success": return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "error": return <XCircle className="w-3.5 h-3.5 text-red-500" />;
      case "warning": return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case "wait": return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
      default: return <Info className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-32">
      
      {/* ------------------------------------------------------------------
          HEADER & COMMAND BAR
      -------------------------------------------------------------------*/}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div className="px-6 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 max-w-[1600px] mx-auto w-full">
          <div className="flex flex-col gap-1.5">
            <button 
              onClick={() => router.push('/outreach/queue')}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center w-fit transition-colors font-medium mb-0.5"
            >
              <ArrowLeft className="w-3 h-3 mr-1" /> Back to Queue
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Florida Realtors – Qualified</h1>
              <Badge variant="outline" className={cn("rounded-md text-[10px] font-bold uppercase tracking-wider", 
                dashboardState === "Running" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                dashboardState === "Completed" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                "bg-slate-500/10 text-slate-500 border-slate-500/20"
              )}>
                {dashboardState === "Running" && <PlayCircle className="w-3 h-3 mr-1.5 animate-pulse" />}
                {dashboardState === "Completed" && <CheckCircle2 className="w-3 h-3 mr-1.5" />}
                {dashboardState}
              </Badge>
            </div>
            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <span className="flex items-center text-xs font-medium text-foreground/80">
                <FaInstagram className="w-3.5 h-3.5 mr-1.5 text-pink-500" />
                Instagram
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-xs text-muted-foreground font-medium">187 Leads</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-xs text-muted-foreground font-medium">Created Today</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-xs text-muted-foreground font-medium flex items-center">
                Source: <a href="#" className="ml-1 text-primary hover:underline">Campaign #12</a>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 xl:pb-0 scrollbar-hide">
            {/* Dev toggle to preview states */}
            <select 
              className="text-xs bg-muted/20 border border-border/50 rounded-md px-2 py-1.5 mr-2"
              value={dashboardState}
              onChange={(e) => setDashboardState(e.target.value as DashboardState)}
            >
              <option value="Ready">View: Ready</option>
              <option value="Running">View: Running</option>
              <option value="Completed">View: Completed</option>
            </select>

            <Button variant="outline" size="sm" onClick={() => setHasTemplate(!hasTemplate)}>
              <LayoutTemplate className="w-4 h-4 mr-2 text-muted-foreground" />
              Assign Template
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2 text-muted-foreground" />
              Preview Messages
            </Button>
            
            {dashboardState === "Running" ? (
              <Button size="sm" variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20">
                <PauseCircle className="w-4 h-4 mr-2" /> Pause / Resume
              </Button>
            ) : dashboardState === "Ready" ? (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 border-0">
                <PlayCircle className="w-4 h-4 mr-2" /> Start Outreach
              </Button>
            ) : null}

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 px-0 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {dashboardState === "Running" && <DropdownMenuItem className="text-destructive"><XCircle className="w-4 h-4 mr-2"/> Stop Queue</DropdownMenuItem>}
                <DropdownMenuItem><RefreshCcw className="w-4 h-4 mr-2" /> Retry Failed</DropdownMenuItem>
                <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Export</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2"/> Delete Batch</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8">
        
        {/* ------------------------------------------------------------------
            STATE: COMPLETED BANNER
        -------------------------------------------------------------------*/}
        {dashboardState === "Completed" && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div>
              <h2 className="text-lg font-bold text-emerald-500 flex items-center mb-1">
                <CheckCircle2 className="w-5 h-5 mr-2" /> Outreach Completed
              </h2>
              <p className="text-emerald-500/80 text-sm font-medium">
                Batch finished processing in 3h 42m.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm font-semibold text-emerald-500/90 bg-emerald-500/10 px-6 py-3 rounded-xl border border-emerald-500/20">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-emerald-500">187</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Total</span>
              </div>
              <div className="w-px h-8 bg-emerald-500/20" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-emerald-500">182</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Sent</span>
              </div>
              <div className="w-px h-8 bg-emerald-500/20" />
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-emerald-500">4</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">Failed</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ------------------------------------------------------------------
            STATE: READY CTA
        -------------------------------------------------------------------*/}
        {dashboardState === "Ready" && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="w-full bg-background border border-border/50 rounded-2xl p-10 flex flex-col items-center text-center shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
              <Send className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready to Start Outreach</h2>
            <p className="text-muted-foreground text-sm max-w-md mb-8">
              187 leads are waiting in this batch. Ensure your template is assigned and settings are correct before launching the sequence.
            </p>
            <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 rounded-full">
              Start Outreach Now
            </Button>
          </motion.div>
        )}


        {/* ------------------------------------------------------------------
            TOP ROW: PROGRESS & TIMELINE
        -------------------------------------------------------------------*/}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sending Progress */}
          <div className="lg:col-span-2 p-6 rounded-2xl border border-border/40 bg-background/60 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> Sending Progress
                </h3>
                <p className="text-sm text-muted-foreground mt-1">112 / 187 Messages Sent</p>
              </div>
              <span className="text-4xl font-bold tracking-tighter text-blue-500">60%</span>
            </div>
            
            <div className="w-full bg-muted rounded-full h-3 mb-6 overflow-hidden border border-border/50 shadow-inner">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  dashboardState === "Running" ? "bg-blue-500 relative overflow-hidden" : 
                  dashboardState === "Completed" ? "bg-emerald-500" : "bg-slate-500 w-0"
                )}
                style={{ width: dashboardState !== "Ready" ? (dashboardState === "Completed" ? "100%" : "60%") : "0%" }}
              >
                {dashboardState === "Running" && (
                   <div className="absolute top-0 bottom-0 left-0 right-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/40">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Estimated Time</span>
                <span className="text-sm font-medium">2h 15m</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Avg Send Speed</span>
                <span className="text-sm font-medium">~45 / hour</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Remaining</span>
                <span className="text-sm font-medium">75 leads</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Messages Sent</span>
                <span className="text-sm font-medium text-foreground">112</span>
              </div>
            </div>
          </div>

          {/* Outreach Timeline */}
          <div className="p-6 rounded-2xl border border-border/40 bg-background/60 shadow-sm flex flex-col justify-center">
            <h3 className="text-base font-semibold mb-6">Timeline</h3>
            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border/60 -z-10" />
              
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Batch Created</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Template Assigned</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2", 
                  dashboardState !== "Ready" ? "bg-primary border-primary" : "bg-background border-primary"
                )}>
                  {dashboardState !== "Ready" && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>
                <div className="flex flex-col">
                  <span className={cn("text-sm font-medium", dashboardState === "Ready" && "text-primary")}>Queue Ready</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2", 
                  dashboardState === "Completed" ? "bg-primary border-primary" : 
                  dashboardState === "Running" ? "bg-background border-blue-500 animate-pulse" : "bg-muted border-border"
                )}>
                  {dashboardState === "Completed" && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                  {dashboardState === "Running" && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <div className="flex flex-col">
                  <span className={cn("text-sm font-medium", dashboardState === "Running" && "text-blue-500", dashboardState === "Ready" && "text-muted-foreground")}>Sending</span>
                </div>
              </div>
              <div className="flex items-center gap-4 opacity-70">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2", 
                  dashboardState === "Completed" ? "bg-emerald-500 border-emerald-500" : "bg-muted border-border"
                )}>
                  {dashboardState === "Completed" && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>
                <div className="flex flex-col">
                  <span className={cn("text-sm font-medium", dashboardState === "Completed" && "text-emerald-500")}>Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------
            STATISTICS GRID
        -------------------------------------------------------------------*/}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          {[
            { label: "Total Leads", value: "187", icon: Users, color: "text-foreground" },
            { label: "Ready", value: "75", icon: Inbox, color: "text-slate-500" },
            { label: "Sending", value: "1", icon: Activity, color: "text-blue-500" },
            { label: "Sent", value: "112", icon: Send, color: "text-emerald-500" },
            { label: "Pending", value: "0", icon: Clock, color: "text-purple-500" },
            { label: "Failed", value: "4", icon: XCircle, color: "text-red-500" },
            { label: "Paused", value: "0", icon: PauseCircle, color: "text-amber-500" },
            { label: "Completion %", value: "60%", icon: Percent, color: "text-primary" },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-xl border border-border/40 bg-background/60 shadow-sm flex flex-col items-center text-center justify-center">
              <stat.icon className={cn("w-4 h-4 mb-2 opacity-80", stat.color)} />
              <span className="text-2xl font-bold tracking-tight mb-1">{stat.value}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* ------------------------------------------------------------------
            MIDDLE CONTENT SPLIT
        -------------------------------------------------------------------*/}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column (Activities & Info) */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            
            {/* Live Activity */}
            <div className="p-6 rounded-2xl border border-border/40 bg-background/60 shadow-sm flex flex-col h-[350px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live Activity
                </h3>
                <span className="text-[10px] uppercase text-muted-foreground font-semibold">Auto-scroll</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                {dashboardState === "Ready" ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    Waiting to start...
                  </div>
                ) : (
                  <>
                    {MOCK_ACTIVITIES.map((act, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="w-10 shrink-0 text-xs text-muted-foreground pt-0.5">{act.time}</div>
                        <div className="mt-0.5">{getActivityIcon(act.type)}</div>
                        <div className="text-foreground/90">{act.text}</div>
                      </div>
                    ))}
                    <div ref={activityEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* Outreach Information */}
            <div className="p-6 rounded-2xl border border-border/40 bg-background/60 shadow-sm flex flex-col">
              <h3 className="text-base font-semibold mb-4">Configuration</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-medium flex items-center"><FaInstagram className="w-3 h-3 mr-1" /> Instagram</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">Campaign Source</span>
                  <span className="font-medium text-primary cursor-pointer hover:underline">Campaign #12</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">Template</span>
                  <span className="font-medium truncate max-w-[150px]">Florida Real Estate Intro</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">Daily Limit</span>
                  <span className="font-medium">100 / day</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">Delay Range</span>
                  <span className="font-medium">60s - 120s</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">Started At</span>
                  <span className="font-medium">Today, 10:30 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Created By</span>
                  <span className="font-medium">Admin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Template & Table) */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            
            {/* Template Card */}
            <div className={cn(
              "rounded-2xl border transition-all duration-300",
              hasTemplate 
                ? "border-border/40 bg-background/60 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" 
                : "border-dashed border-border/60 bg-muted/10 p-8 flex flex-col items-center justify-center text-center h-[120px]"
            )}>
              {!hasTemplate ? (
                <>
                  <h3 className="font-semibold mb-1">No Template Assigned</h3>
                  <p className="text-sm text-muted-foreground mb-4">Choose a message template before starting.</p>
                  <Button size="sm" onClick={() => setHasTemplate(true)}>Assign Template</Button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base mb-1">Florida Real Estate Intro</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><FaInstagram className="w-3.5 h-3.5" /> Instagram DM</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>Last updated 3 days ago</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto bg-background" onClick={() => setHasTemplate(false)}>
                      Change
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                      Preview
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Leads Table & Filters */}
            <div className="flex-1 flex flex-col rounded-2xl border border-border/40 overflow-hidden bg-background shadow-sm">
              
              {/* Toolbar */}
              <div className="p-4 border-b border-border/40 bg-background/60 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search username or name..." className="pl-9 h-9 text-sm rounded-lg bg-background" />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="h-9">Sort</Button>
                    <Button variant="outline" size="sm" className="h-9">Columns</Button>
                  </div>
                </div>
                
                {/* Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {FILTER_CHIPS.map(chip => (
                    <button
                      key={chip}
                      onClick={() => setActiveFilter(chip)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                        activeFilter === chip 
                          ? "bg-foreground text-background border-foreground" 
                          : "bg-background text-muted-foreground border-border/60 hover:bg-muted"
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/30 border-b border-border/40 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-border/50 text-primary focus:ring-primary/20 cursor-pointer"
                          checked={selectedLeads.size > 0 && selectedLeads.size === MOCK_LEADS.length}
                          ref={input => {
                            if (input) input.indeterminate = selectedLeads.size > 0 && selectedLeads.size < MOCK_LEADS.length;
                          }}
                          onChange={toggleAllLeads}
                        />
                      </th>
                      <th className="px-4 py-3">Profile</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Attempts</th>
                      <th className="px-4 py-3">Last Attempt</th>
                      <th className="px-4 py-3">Last Activity</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {MOCK_LEADS.map((lead) => (
                      <tr 
                        key={lead.id} 
                        className={cn(
                          "hover:bg-muted/10 transition-colors cursor-pointer group",
                          selectedLeads.has(lead.id) ? "bg-primary/5 hover:bg-primary/10" : ""
                        )}
                        onClick={() => setSelectedLeadIdForDrawer(lead.id)}
                      >
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            className="rounded border-border/50 text-primary focus:ring-primary/20 cursor-pointer"
                            checked={selectedLeads.has(lead.id)}
                            onChange={() => toggleLeadSelection(lead.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-lg border border-border/50 shrink-0">
                              <AvatarImage src={lead.avatarUrl} />
                              <AvatarFallback className="rounded-lg">{lead.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium truncate max-w-[120px] text-foreground">{lead.businessName || lead.username}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-[120px]">@{lead.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border whitespace-nowrap",
                            getStatusColor(lead.messageStatus)
                          )}>
                            {lead.messageStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-foreground whitespace-nowrap">
                          {lead.attempts}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {lead.lastAttempt || "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap truncate max-w-[150px]">
                          {lead.lastActivity}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedLeads.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 100, opacity: 0, x: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 p-2 bg-foreground text-background rounded-xl shadow-2xl border border-border/10"
          >
            <div className="px-4 border-r border-background/20 font-medium text-sm whitespace-nowrap">
              {selectedLeads.size} Selected
            </div>
            
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-[60vw]">
              <Button size="sm" variant="ghost" className="h-8 hover:bg-background/20 hover:text-background transition-colors text-background/80 whitespace-nowrap">
                <RefreshCcw className="mr-2 h-3.5 w-3.5" /> Retry Failed
              </Button>
              <Button size="sm" variant="ghost" className="h-8 hover:bg-background/20 hover:text-background transition-colors text-background/80 whitespace-nowrap">
                <PauseCircle className="mr-2 h-3.5 w-3.5" /> Pause Selected
              </Button>
              <Button size="sm" variant="ghost" className="h-8 hover:bg-background/20 hover:text-background transition-colors text-background/80 whitespace-nowrap">
                <LayoutTemplate className="mr-2 h-3.5 w-3.5" /> Assign Template
              </Button>
              <Button size="sm" variant="ghost" className="h-8 hover:bg-background/20 hover:text-background transition-colors text-background/80 whitespace-nowrap">
                <Download className="mr-2 h-3.5 w-3.5" /> Export
              </Button>
              <div className="w-px h-4 bg-background/20 mx-1 shrink-0"></div>
              <Button size="sm" variant="ghost" className="h-8 hover:bg-destructive/20 hover:text-red-400 transition-colors text-red-400/80 whitespace-nowrap">
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove From Batch
              </Button>
            </div>

            <div className="px-2 border-l border-background/20 shrink-0">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-background/20 text-background/50 hover:text-background rounded-full" onClick={clearSelection}>
                ✕
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LeadDetailsDrawer 
        leadId={selectedLeadIdForDrawer}
        leads={MOCK_LEADS}
        onClose={() => setSelectedLeadIdForDrawer(null)}
      />
    </div>
  );
}
