import React from "react";
import { ResultLead } from "../types/results";
import { Globe, Mail, Phone, ShieldCheck, BadgeCheck, Zap } from "lucide-react";

interface ResultsMetricsGridProps {
  leads: ResultLead[];
}

export function ResultsMetricsGrid({ leads }: ResultsMetricsGridProps) {
  const stats = [
    { label: "Qualified", value: leads.filter(l => l.status === "Qualified").length, icon: ShieldCheck, color: "text-emerald-500" },
    { label: "With Website", value: leads.filter(l => !!l.website).length, icon: Globe, color: "text-blue-500" },
    { label: "With Email", value: leads.filter(l => !!l.email).length, icon: Mail, color: "text-amber-500" },
    { label: "With Phone", value: leads.filter(l => !!l.phone).length, icon: Phone, color: "text-purple-500" },
    { label: "Business Accounts", value: leads.filter(l => l.isBusinessAccount).length, icon: Zap, color: "text-indigo-500" },
    { label: "Verified", value: leads.filter(l => l.isVerified).length, icon: BadgeCheck, color: "text-sky-500" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat, idx) => (
        <div key={idx} className="flex flex-col p-3 rounded-xl border border-border/50 bg-background/50 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
          </div>
          <span className="text-xl font-bold font-mono tracking-tight text-foreground">{stat.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
