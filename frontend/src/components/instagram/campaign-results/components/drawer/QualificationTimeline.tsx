import React from "react";
import { ResultLead } from "../../types/results";
import { formatTime } from "../../utils/formatters";

export function QualificationTimeline({ lead }: { lead: ResultLead }) {
  if (!lead.timeline || lead.timeline.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Qualification Timeline</span>
      <div className="flex flex-col pl-2">
        {lead.timeline.map((event, idx) => {
          const isLast = idx === lead.timeline.length - 1;
          const isFirst = idx === 0;
          return (
            <div key={event.id} className="relative flex items-start gap-4 pb-4">
              {!isLast && (
                <div className="absolute left-1.5 top-3 w-px h-full bg-border/50"></div>
              )}
              <div className={`relative z-10 h-3 w-3 rounded-full mt-1 border-2 ${isFirst ? 'border-emerald-500 bg-emerald-500/20' : 'border-muted-foreground/30 bg-background'}`}></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-mono">{formatTime(event.time)}</span>
                <span className={`text-sm ${isFirst ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{event.event}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
