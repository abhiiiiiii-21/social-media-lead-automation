import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExtractionOptions } from "@/lib/types/inspector";
import { ListFilter } from "lucide-react";

interface ExpectedFieldsCardProps {
  options: ExtractionOptions;
}

export function ExpectedFieldsCard({ options }: ExpectedFieldsCardProps) {
  const fields: string[] = [];

  if (options.basicProfile) {
    fields.push("Username", "Display Name", "Avatar Image", "Full Bio");
  }
  if (options.followers) {
    fields.push("Follower Count");
  }
  if (options.following) {
    fields.push("Following Count");
  }
  if (options.posts) {
    fields.push("Post Count");
  }
  if (options.businessInfo) {
    fields.push("Business Category", "Verification Status", "Public / Private");
  }
  if (options.contactInfo) {
    fields.push("Public Email", "Phone Number", "Website URL", "Business Address");
  }
  if (options.externalLinks) {
    fields.push("Multi-Links", "Linktree / Portfolio URLs");
  }
  if (options.recentPosts) {
    fields.push("Recent Posts (Thumbnails, Likes, Comments, Captions)");
  }
  if (options.highlights) {
    fields.push("Story Highlights");
  }

  return (
    <Card className="rounded-xl border-border/50 bg-background/50 shadow-none">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
        <CardTitle className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ListFilter className="h-3.5 w-3.5" />
            Expected Fields
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">
            {fields.length} data points
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {fields.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {fields.map((field) => (
              <Badge
                key={field}
                variant="secondary"
                className="text-[11px] font-normal px-2.5 py-0.5 bg-muted/50 border border-border/50 text-foreground"
              >
                {field}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No fields selected. Check at least one option on the left to extract.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
