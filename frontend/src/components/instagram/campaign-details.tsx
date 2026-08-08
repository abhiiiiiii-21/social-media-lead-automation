"use client";

import React, { useState, useEffect } from "react";
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
import { campaignsApi, BackendLead } from "@/lib/api/campaigns";

interface CampaignDetailsProps {
  campaign: OutreachCampaign;
}

export function CampaignDetails({ campaign }: CampaignDetailsProps) {
  const [leads, setLeads] = useState<InstagramProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<InstagramProfile | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!campaign?.id) return;
    const fetchLeads = async () => {
      setIsLoading(true);
      try {
        const data = await campaignsApi.getCampaignLeads(campaign.id, { limit: 10 });
        if (data && data.items) {
          setLeads(data.items.map((l: BackendLead) => ({
            id: l.id,
            username: l.username,
            fullName: l.full_name || undefined,
            followers: l.followers,
            following: l.following,
            bio: l.bio || undefined,
            avatarUrl: l.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(l.username)}&background=0D8ABC&color=fff`,
            email: l.email || undefined,
            phone: l.phone || undefined,
            website: l.website || undefined,
          })));
        }
      } catch (err) {
        console.error("Failed to load campaign leads:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeads();
  }, [campaign?.id]);

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
              <TableHead className="font-medium">Category / Email</TableHead>
              <TableHead className="text-right font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-sm text-muted-foreground">
                  {isLoading ? "Loading leads..." : "No leads in this campaign yet"}
                </TableCell>
              </TableRow>
            ) : (
              leads.map((profile) => (
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
                        @{profile.username}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-medium">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Qualified
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {profile.email || "Public Profile"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 shadow-none"
                      onClick={() => handleOpenDrawer(profile)}
                    >
                      <Sparkles className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                      Generate DM
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AiMessageDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        profile={selectedProfile}
      />
    </>
  );
}
