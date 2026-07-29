import React from "react";
import { ResultLead } from "../../types/results";
import { Button } from "@/components/ui/button";
import { Globe, Mail, Phone, MapPin, Briefcase, MessageCircle, Copy, ExternalLink, Smartphone } from "lucide-react";

export function ContactInfoPanel({ lead }: { lead: ResultLead }) {
  const contacts = [
    { label: "Website", value: lead.website, icon: Globe, color: "text-emerald-500", url: lead.website },
    { label: "Email", value: lead.email, icon: Mail, color: "text-amber-500", url: lead.email ? `mailto:${lead.email}` : undefined },
    { label: "Phone", value: lead.phone, icon: Phone, color: "text-purple-500", url: lead.phone ? `tel:${lead.phone.replace(/[^0-9+]/g, '')}` : undefined },
    { label: "WhatsApp", value: lead.whatsapp, icon: Smartphone, color: "text-emerald-500", url: lead.whatsapp ? `https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}` : undefined },
    { label: "Address", value: lead.address, icon: MapPin, color: "text-sky-500", url: lead.address ? `https://maps.google.com/?q=${encodeURIComponent(lead.address)}` : undefined },
    { label: "LinkedIn", value: lead.linkedin, icon: Briefcase, color: "text-blue-500", url: lead.linkedin },
    { label: "Facebook", value: lead.facebook, icon: MessageCircle, color: "text-blue-500", url: lead.facebook }
  ];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contact Information</span>
      <div className="flex flex-col gap-2">
        {contacts.map((contact, i) => {
          if (!contact.value) return null;
          return (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background hover:bg-muted/10 transition-colors group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`p-2 rounded-md bg-muted/30 ${contact.color}`}>
                  <contact.icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] text-muted-foreground uppercase">{contact.label}</span>
                  <span className="text-sm font-medium text-foreground truncate">{contact.value.replace(/^https?:\/\//, '')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => contact.value && navigator.clipboard.writeText(contact.value)}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                {contact.url && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 text-muted-foreground hover:text-foreground" 
                    onClick={() => contact.url && window.open(contact.url, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        {contacts.every(c => !c.value) && (
          <div className="text-sm text-muted-foreground italic p-4 text-center border border-dashed border-border/50 rounded-lg">
            No contact information available.
          </div>
        )}
      </div>
    </div>
  );
}
