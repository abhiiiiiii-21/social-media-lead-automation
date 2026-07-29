import React from "react";
import { ResultLead } from "../../types/results";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Copy, ExternalLink, X, MapPin } from "lucide-react";
import { ProfilePreview } from "./ProfilePreview";
import { AiReasoningPanel } from "./AiReasoningPanel";
import { WebsitePreview } from "./WebsitePreview";
import { QualificationTimeline } from "./QualificationTimeline";
import { ContactInfoPanel } from "./ContactInfoPanel";
import { Badge } from "@/components/ui/badge";

interface LeadDetailsDrawerProps {
  leadId: string | null;
  leads: ResultLead[];
  onClose: () => void;
}

export function LeadDetailsDrawer({ leadId, leads, onClose }: LeadDetailsDrawerProps) {
  const [renderedLead, setRenderedLead] = React.useState<ResultLead | null>(null);

  React.useEffect(() => {
    const found = leads.find(l => l.id === leadId);
    if (found) {
      setRenderedLead(found);
    }
  }, [leadId, leads]);

  return (
    <Sheet open={!!leadId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col border-border/50 bg-background shadow-2xl">
        <SheetHeader className="p-4 border-b border-border/50 flex flex-row items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <SheetTitle className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
            Lead Details
          </SheetTitle>
        </SheetHeader>
        
        {renderedLead ? (
          <>
            <div className="flex-1 overflow-y-auto min-h-0 p-4">
              <div className="flex flex-col gap-6 pb-20">
                {renderedLead.duplicateInfo?.isDuplicate && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm font-medium">
                    Warning: {renderedLead.duplicateInfo.reason}
                  </div>
                )}
                
                <ProfilePreview lead={renderedLead} />
                
                <div className="flex items-center gap-2 flex-wrap">
                  {renderedLead.tags.map(tag => (
                    <Badge key={tag.id} variant="outline" className={tag.color}>{tag.label}</Badge>
                  ))}
                </div>

                <ContactInfoPanel lead={renderedLead} />

                <AiReasoningPanel lead={renderedLead} />
                
                <WebsitePreview lead={renderedLead} />

                {renderedLead.internalNotes && (
                  <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/10 border border-border/50">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Internal Notes</span>
                    <p className="text-sm text-foreground/90">{renderedLead.internalNotes}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">By {renderedLead.addedBy}</span>
                    </div>
                  </div>
                )}

                <QualificationTimeline lead={renderedLead} />
              </div>
            </div>

            <div className="p-4 border-t border-border/50 bg-background/95 flex flex-col gap-2 sticky bottom-0 z-10">
              <Button className="w-full font-medium" size="sm">
                <Send className="mr-2 h-4 w-4" /> Move to CRM
              </Button>
              <div className="flex gap-2">
                {renderedLead.email && (
                  <Button variant="outline" className="flex-1 font-medium" size="sm">
                    <Copy className="mr-2 h-4 w-4" /> Copy Email
                  </Button>
                )}
                {renderedLead.phone && (
                  <Button variant="outline" className="flex-1 font-medium" size="sm">
                    <Copy className="mr-2 h-4 w-4" /> Copy Phone
                  </Button>
                )}
                {renderedLead.website && (
                  <Button variant="outline" className="flex-1 font-medium" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" /> Website
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="h-12 w-12 rounded-full border border-border/50 flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5 opacity-50" />
            </div>
            <p className="text-sm font-medium text-foreground">Select a lead</p>
            <p className="text-xs mt-1">Click any row in the table to preview the complete profile</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
