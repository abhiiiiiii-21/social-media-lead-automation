import React from "react";
import { ResultLead } from "../../types/results";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Check, X } from "lucide-react";
import { getStatusColor } from "../../utils/formatters";

export function AiReasoningPanel({ lead }: { lead: ResultLead }) {
  const isQualified = lead.status === "Qualified";

  return (
    <div className="flex flex-col border border-border/50 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/10">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Overall AI Score</span>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold font-mono tracking-tighter leading-none ${lead.aiScore >= 80 ? "text-emerald-500" : lead.aiScore >= 50 ? "text-amber-500" : "text-destructive"}`}>
              {lead.aiScore}
            </span>
            <span className="text-sm text-muted-foreground font-medium mb-1">{lead.health}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Decision</span>
          <Badge variant="outline" className={`font-semibold ${getStatusColor(lead.status)}`}>
            {isQualified ? <ShieldCheck className="h-3 w-3 mr-1" /> : <ShieldAlert className="h-3 w-3 mr-1" />}
            {lead.status}
          </Badge>
          <span className="text-[10px] text-muted-foreground mt-1 text-right">{lead.aiConfidence}% Confidence</span>
        </div>
      </div>
      
      <div className="p-4 bg-background">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Evaluation Criteria</span>
        <div className="flex flex-col gap-2">
          {lead.aiReasoning.positive.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{reason}</span>
            </div>
          ))}
          {lead.aiReasoning.negative.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-foreground">
              <X className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
        
        {(lead.aiReasoning.strengths || lead.aiReasoning.weaknesses) && (
          <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
            {lead.aiReasoning.strengths && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Strengths</span>
                <ul className="text-xs text-muted-foreground space-y-1 pl-3 list-disc">
                  {lead.aiReasoning.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {lead.aiReasoning.weaknesses && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-destructive uppercase tracking-wider">Weaknesses</span>
                <ul className="text-xs text-muted-foreground space-y-1 pl-3 list-disc">
                  {lead.aiReasoning.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {(lead.aiReasoning.recommendedAction || lead.aiReasoning.suggestedStrategy) && (
          <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-3">
            {lead.aiReasoning.recommendedAction && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Recommended Action</span>
                <span className="text-sm font-medium text-foreground">{lead.aiReasoning.recommendedAction}</span>
              </div>
            )}
            {lead.aiReasoning.suggestedStrategy && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Suggested Strategy</span>
                <span className="text-sm text-muted-foreground">{lead.aiReasoning.suggestedStrategy}</span>
              </div>
            )}
            {lead.aiReasoning.priority && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Priority</span>
                <Badge variant="outline" className={`w-fit font-semibold ${
                  lead.aiReasoning.priority === "High" ? "text-rose-500 border-rose-500/20 bg-rose-500/10" :
                  lead.aiReasoning.priority === "Medium" ? "text-amber-500 border-amber-500/20 bg-amber-500/10" :
                  "text-blue-500 border-blue-500/20 bg-blue-500/10"
                }`}>
                  {lead.aiReasoning.priority} Priority
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
