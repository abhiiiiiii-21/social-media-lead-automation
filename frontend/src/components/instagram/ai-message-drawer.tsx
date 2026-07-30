"use client";

import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { InstagramProfile } from "@/lib/types/instagram";
import { Sparkles, Copy, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AiMessageDrawerProps {
  profile: InstagramProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiMessageDrawer({ profile, open, onOpenChange }: AiMessageDrawerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-xl">
          <DrawerHeader>
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="h-10 w-10 border border-border/50">
                <AvatarImage src={profile.avatarUrl} alt={profile.username} />
                <AvatarFallback className="bg-muted text-[10px]">
                  {profile.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <DrawerTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Generated Message
                </DrawerTitle>
                <DrawerDescription>
                  Personalized for @{profile.username}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="bg-muted/30 p-4 rounded-lg border border-border/50 text-sm whitespace-pre-wrap font-medium">
              Hi @{profile.username},
              {"\n\n"}
              Loved your recent post about design! We help agencies like yours scale outreach with AI.
              {"\n\n"}
              Would you be open to a quick chat?
            </div>
          </div>
          <DrawerFooter className="flex flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleCopy} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Message"}
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
