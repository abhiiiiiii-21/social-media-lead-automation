"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Globe, Mail, Phone, Copy, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

interface ProfileSummaryContactProps {
  website?: string | null;
  email?: string | null;
  phone?: string | null;
}

export function ProfileSummaryContact({ website, email, phone }: ProfileSummaryContactProps) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopy = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const hasAnyContact = Boolean(website || email || phone);

  if (!hasAnyContact) {
    return (
      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-muted/10 border border-border/40">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Contact Details
        </span>
        <p className="text-xs text-muted-foreground italic">No public contact info extracted.</p>
      </div>
    );
  }

  const cleanWebsite = website ? website.replace(/^https?:\/\/(www\.)?/, "") : "";
  const formattedWebsite = website?.startsWith("http") ? website : `https://${website}`;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-background border border-border/50 shadow-xs">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Contact Information
      </span>

      <div className="flex flex-col divide-y divide-border/40">
        {/* Website */}
        {website && (
          <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-medium text-muted-foreground">Website</span>
                <a
                  href={formattedWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-foreground hover:underline truncate"
                >
                  {cleanWebsite}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => handleCopy(formattedWebsite, "Website", "website")}
                title="Copy website link"
              >
                {copiedKey === "website" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
              <a
                href={formattedWebsite}
                target="_blank"
                rel="noopener noreferrer"
                title="Open website"
                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Email */}
        {email && (
          <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-medium text-muted-foreground">Email</span>
                <a
                  href={`mailto:${email}`}
                  className="text-xs font-medium text-foreground hover:underline truncate"
                >
                  {email}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => handleCopy(email, "Email", "email")}
                title="Copy email address"
              >
                {copiedKey === "email" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        )}

        {/* Phone */}
        {phone && (
          <div className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-medium text-muted-foreground">Phone</span>
                <a
                  href={`tel:${phone}`}
                  className="text-xs font-medium text-foreground hover:underline truncate font-mono"
                >
                  {phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={() => handleCopy(phone, "Phone", "phone")}
                title="Copy phone number"
              >
                {copiedKey === "phone" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
