import React from "react";
import { ResultLead } from "../../types/results";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link as LinkIcon, Camera, MapPin } from "lucide-react";
import { formatNumber } from "../../utils/formatters";

export function ProfilePreview({ lead }: { lead: ResultLead }) {
  return (
    <div className="flex flex-col gap-4 p-4 border border-border/50 rounded-xl bg-muted/10">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border border-border/50">
          <AvatarImage src={lead.avatarUrl} />
          <AvatarFallback>{lead.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-lg tracking-tight truncate">@{lead.username}</span>
                {lead.isVerified && <Badge variant="secondary" className="h-5 px-1 bg-sky-500/10 text-sky-500 border-sky-500/20 text-[10px] shrink-0">VERIFIED</Badge>}
                {lead.isBusinessAccount && <Badge variant="secondary" className="h-5 px-1 bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-[10px] shrink-0">BUSINESS</Badge>}
              </div>
              <span className="text-xs text-muted-foreground truncate">{lead.businessName || lead.category}</span>
            </div>
            <Badge variant="outline" className="font-medium bg-background shrink-0 whitespace-nowrap">
              {lead.source}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col text-center p-2 rounded-lg bg-background border border-border/50">
          <span className="text-sm font-bold font-mono">{formatNumber(lead.followers)}</span>
          <span className="text-[10px] text-muted-foreground uppercase">Followers</span>
        </div>
        <div className="flex flex-col text-center p-2 rounded-lg bg-background border border-border/50">
          <span className="text-sm font-bold font-mono">{formatNumber(lead.following)}</span>
          <span className="text-[10px] text-muted-foreground uppercase">Following</span>
        </div>
        <div className="flex flex-col text-center p-2 rounded-lg bg-background border border-border/50">
          <span className="text-sm font-bold font-mono">{formatNumber(lead.posts)}</span>
          <span className="text-[10px] text-muted-foreground uppercase">Posts</span>
        </div>
      </div>

      <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mt-2">
        {lead.bio}
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {lead.address && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{lead.address}</span>
          </div>
        )}
        {lead.website && (
          <div className="flex items-center gap-2 text-xs text-blue-500 hover:underline cursor-pointer">
            <LinkIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
          <Camera className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">instagram.com/{lead.username}</span>
        </div>
      </div>
    </div>
  );
}
