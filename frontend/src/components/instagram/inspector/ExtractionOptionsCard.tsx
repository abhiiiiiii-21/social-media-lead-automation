import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ExtractionOptions } from "@/lib/types/inspector";
import { 
  User, 
  Mail, 
  Briefcase, 
  Users, 
  UserPlus, 
  Grid3X3, 
  Link as LinkIcon, 
  Sparkles, 
  Layers 
} from "lucide-react";

interface ExtractionOptionsCardProps {
  options: ExtractionOptions;
  toggleOption: (key: keyof ExtractionOptions) => void;
  setAllOptions: (val: boolean) => void;
  disabled?: boolean;
}

const OPTION_ITEMS: Array<{
  key: keyof ExtractionOptions;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    key: "basicProfile",
    label: "Basic Profile",
    description: "Username, full name, avatar, bio text",
    icon: <User className="h-4 w-4 text-muted-foreground" />,
  },
  {
    key: "contactInfo",
    label: "Contact Information",
    description: "Public email, phone number, website, address",
    icon: <Mail className="h-4 w-4 text-muted-foreground" />,
  },
  {
    key: "businessInfo",
    label: "Business Information",
    description: "Business category, verified badge, creator status",
    icon: <Briefcase className="h-4 w-4 text-muted-foreground" />,
  },
  {
    key: "followers",
    label: "Followers",
    description: "Total follower count and statistics",
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
  },
  {
    key: "following",
    label: "Following",
    description: "Total following count",
    icon: <UserPlus className="h-4 w-4 text-muted-foreground" />,
  },
  {
    key: "posts",
    label: "Posts",
    description: "Total published post count",
    icon: <Grid3X3 className="h-4 w-4 text-muted-foreground" />,
  },
  {
    key: "externalLinks",
    label: "External Links",
    description: "Linktree, Beacons, portfolio, and social URLs",
    icon: <LinkIcon className="h-4 w-4 text-muted-foreground" />,
  },
  {
    key: "highlights",
    label: "Highlights",
    description: "Story highlight reels and pinned collections",
    icon: <Sparkles className="h-4 w-4 text-muted-foreground" />,
  },
  {
    key: "recentPosts",
    label: "Recent Posts",
    description: "Latest 3-6 post cards, likes, comments, captions",
    icon: <Layers className="h-4 w-4 text-muted-foreground" />,
  },
];

export function ExtractionOptionsCard({
  options,
  toggleOption,
  setAllOptions,
  disabled = false,
}: ExtractionOptionsCardProps) {
  const allChecked = Object.values(options).every(Boolean);

  return (
    <Card className="rounded-xl border-border/50 bg-background/50 shadow-none">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">Extraction Options</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Select the specific data points to extract from the profile.
          </CardDescription>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => setAllOptions(!allChecked)}
            className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
          >
            {allChecked ? "Deselect All" : "Select All"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {OPTION_ITEMS.map((item) => {
            const isChecked = options[item.key];
            return (
              <div
                key={item.key}
                onClick={() => !disabled && toggleOption(item.key)}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                  isChecked
                    ? "border-foreground/30 bg-muted/20"
                    : "border-border/40 bg-background/50 hover:bg-muted/10 opacity-70"
                } ${disabled ? "pointer-events-none opacity-50" : ""}`}
              >
                <div className="mt-0.5" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    id={`opt-${item.key}`}
                    checked={isChecked}
                    onCheckedChange={() => !disabled && toggleOption(item.key)}
                    disabled={disabled}
                  />
                </div>
                <div className="flex-1 space-y-0.5">
                  <label
                    htmlFor={`opt-${item.key}`}
                    className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1.5"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </label>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
