"use client";

import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstagramProfile, OutreachCampaign } from "@/lib/types/instagram";
import { AiMessageDrawer } from "./ai-message-drawer";
import { Sparkles, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { MOCK_INSTAGRAM_PROFILES } from "@/lib/data/mock-instagram";

interface CampaignDetailsProps {
  campaign: OutreachCampaign;
}

export function CampaignDetails({ campaign }: CampaignDetailsProps) {
  const [selectedProfile, setSelectedProfile] = useState<InstagramProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // In a real app, we'd fetch the queue of leads for this campaign.
  // We'll mock it by slicing the global mock list.
  const leadsQueue = MOCK_INSTAGRAM_PROFILES.slice(0, 3);

  const handleOpenDrawer = (profile: InstagramProfile) => {
    setSelectedProfile(profile);
    setDrawerOpen(true);
  };

  return (
    <>
      <div className="border border-border/50 rounded-lg overflow-hidden bg-background">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-medium">Lead</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Last Action</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leadsQueue.map((profile, i) => (
              <TableRow key={profile.id} className="hover:bg-muted/10 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border/50">
                      <AvatarImage src={profile.avatarUrl} alt={profile.username} />
                      <AvatarFallback className="bg-muted text-[10px]">
                        {profile.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-foreground tracking-tight">
                      {profile.username}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {i === 0 ? (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border/50 font-medium">
                      <Clock className="h-3 w-3 mr-1" /> Pending
                    </Badge>
                  ) : i === 1 ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Sent
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium">
                      <AlertCircle className="h-3 w-3 mr-1" /> Failed
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {i === 0 ? "Message generated" : i === 1 ? "Sent 2h ago" : "Failed to send"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs font-medium gap-1.5"
                    onClick={() => handleOpenDrawer(profile)}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Preview AI
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AiMessageDrawer 
        profile={selectedProfile} 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen} 
      />
    </>
  );
}
