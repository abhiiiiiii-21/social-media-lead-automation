"use client";

import React from "react";
import { Plus, Users, Send, LayoutTemplate, Clock, MessageSquareReply, PlayCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FaInstagram, FaLinkedin } from "react-icons/fa";

type BatchStatus = "Ready" | "Running" | "Completed" | "Paused";

interface MockBatch {
  id: string;
  name: string;
  leads: number;
  status: BatchStatus;
  platform: "Instagram" | "LinkedIn";
  template: string | null;
  created: string;
  sent?: number;
  replies?: number;
}

const MOCK_BATCHES: MockBatch[] = [
  {
    id: "batch_1",
    name: "Florida Realtors - Qualified",
    leads: 187,
    status: "Running",
    platform: "Instagram",
    template: "Florida Real Estate Intro",
    created: "Today",
    sent: 112,
    replies: 3
  },
  {
    id: "batch_2",
    name: "Florida Realtors - No Website",
    leads: 35,
    status: "Ready",
    platform: "Instagram",
    template: null,
    created: "Oct 24, 2023"
  },
  {
    id: "batch_3",
    name: "Austin Realtors - High Score",
    leads: 92,
    status: "Completed",
    platform: "LinkedIn",
    template: "Austin Luxury Connect",
    created: "Oct 20, 2023",
    sent: 92,
    replies: 15
  },
  {
    id: "batch_4",
    name: "Miami Agents - B2B",
    leads: 45,
    status: "Paused",
    platform: "Instagram",
    template: "B2B Service Intro",
    created: "Oct 25, 2023",
    sent: 12,
    replies: 1
  }
];

export default function OutreachQueueDashboard() {
  const router = useRouter();

  const getStatusIcon = (status: BatchStatus) => {
    switch (status) {
      case "Ready": return <div className="w-2 h-2 rounded-full bg-slate-500" />;
      case "Running": return <PlayCircle className="w-3.5 h-3.5 text-blue-500 animate-pulse" />;
      case "Completed": return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "Paused": return <div className="w-2 h-2 rounded-full bg-amber-500" />;
    }
  };

  const getStatusBadge = (status: BatchStatus) => {
    switch (status) {
      case "Ready": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      case "Running": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "Completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Paused": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  return (
    <div className="flex flex-col gap-8 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Outreach Queue</h1>
          <p className="text-muted-foreground text-sm">
            Manage your active outreach batches and track message delivery.
          </p>
        </div>
        <Button onClick={() => router.push("/outreach/queue/new")} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          New Outreach
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MOCK_BATCHES.map((batch) => (
          <button
            key={batch.id}
            onClick={() => router.push(`/outreach/queue/${batch.id}`)}
            className={cn(
              "flex flex-col p-6 rounded-2xl transition-all duration-300 text-left w-full focus:outline-none",
              "bg-background/60 backdrop-blur-xl border border-border/40",
              "hover:border-border/80 hover:bg-muted/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
              batch.status === "Running" ? "ring-1 ring-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : ""
            )}
          >
            <div className="flex items-start justify-between mb-4 w-full">
              <div className="flex flex-col">
                <h3 className="font-semibold text-base mb-1.5 line-clamp-1" title={batch.name}>
                  {batch.name}
                </h3>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center">
                    {batch.platform === "Instagram" ? <FaInstagram className="w-3.5 h-3.5 mr-1" /> : <FaLinkedin className="w-3.5 h-3.5 mr-1" />}
                    {batch.platform}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-border/80" />
                  <span className="flex items-center text-foreground/80">
                    <Users className="w-3.5 h-3.5 mr-1 opacity-70" />
                    {batch.leads} Leads
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5 mb-5 mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground/70">
                  <LayoutTemplate className="w-3.5 h-3.5" /> Template
                </span>
                <span className="truncate max-w-[140px]">{batch.template || "None Assigned"}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground/70">
                  <Clock className="w-3.5 h-3.5" /> Created
                </span>
                <span>{batch.created}</span>
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border/40 w-full">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("px-2 py-0.5 flex items-center gap-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border", getStatusBadge(batch.status))}>
                  {getStatusIcon(batch.status)}
                  {batch.status}
                </div>
                
                {batch.status !== "Ready" && batch.sent !== undefined && (
                  <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Send className="w-3 h-3 text-blue-500/70" /> {batch.sent} Sent
                    </span>
                  </div>
                )}
              </div>

              {(batch.status === "Running" || batch.status === "Paused") && batch.sent !== undefined && (
                <div className="w-full mt-1">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5 font-medium">
                    <span>{batch.sent} / {batch.leads} Sent</span>
                    <span>{Math.round((batch.sent / batch.leads) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", batch.status === "Running" ? "bg-blue-500" : "bg-amber-500")}
                      style={{ width: `${(batch.sent / batch.leads) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
