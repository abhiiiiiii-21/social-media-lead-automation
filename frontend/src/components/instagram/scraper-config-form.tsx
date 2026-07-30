import React from "react";
import { ScraperType, ScrapingConfig } from "@/lib/types/instagram";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TagsInput } from "@/components/ui/tags-input";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, SlidersHorizontal, Sparkles } from "lucide-react";

interface ScraperConfigFormProps {
  type: ScraperType;
  config: ScrapingConfig;
  setConfig: (config: ScrapingConfig) => void;
}

const AI_EXAMPLES = [
  "Florida Realtors",
  "Roofing Companies in Texas",
  "Dentists in Austin",
  "Luxury Home Builders in Miami"
];

export function ScraperConfigForm({ type, config, setConfig }: ScraperConfigFormProps) {
  
  const updateConfig = (key: string, value: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
    setConfig({ ...config, [key]: value });
  };

  const renderCommonFields = () => (
    <div className="grid gap-2">
      <label className="text-sm font-medium">Campaign Name <span className="text-destructive">*</span></label>
      <Input 
        placeholder="e.g. Q3 Startup Founders" 
        value={config.campaignName || ""}
        onChange={(e) => updateConfig("campaignName", e.target.value)}
      />
    </div>
  );

  const renderAiDiscoveryFields = () => (
    <>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Describe Target Customer <span className="text-destructive">*</span></label>
        <Textarea 
          placeholder="Find real estate agents in Florida. Business accounts only. Must have a website. Minimum 2,000 followers. Recently active. Avoid duplicate accounts." 
          className="resize-none min-h-[100px]"
          value={config.targetCustomer || ""}
          onChange={(e) => updateConfig("targetCustomer", e.target.value)}
        />
        <div className="flex flex-col gap-1.5 mt-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Sparkles className="h-3 w-3" /> Examples</span>
          <div className="flex flex-wrap gap-2">
            {AI_EXAMPLES.map((ex) => (
              <button 
                key={ex}
                type="button"
                onClick={() => updateConfig("targetCustomer", ex)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Target Leads</label>
          <Input type="number" placeholder="500" value={config.targetLeads || ""} onChange={(e) => updateConfig("targetLeads", parseInt(e.target.value))} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Lead Quality</label>
          <Select value={config.leadQuality || "Balanced"} onValueChange={(v) => updateConfig("leadQuality", v)}>
            <SelectTrigger className="h-9 bg-background">
              <SelectValue placeholder="Select quality..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Strict">Strict</SelectItem>
              <SelectItem value="Balanced">Balanced</SelectItem>
              <SelectItem value="Broad">Broad</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );

  const renderProfileScraperFields = () => (
    <>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Instagram Usernames <span className="text-destructive">*</span></label>
        <TagsInput 
          placeholder="Type a username and press Enter..." 
          value={config.instagramUsernames || []} 
          onChange={(v) => updateConfig("instagramUsernames", v)} 
        />
      </div>
      <div className="grid gap-2 w-1/2 pr-2">
        <label className="text-sm font-medium">Maximum Profiles</label>
        <Input type="number" placeholder="1000" value={config.maximumProfiles || ""} onChange={(e) => updateConfig("maximumProfiles", parseInt(e.target.value))} />
      </div>
      <div className="flex gap-6 mt-2 flex-wrap">
        <div className="flex items-center space-x-2">
          <Checkbox id="followers" checked={config.extractFollowers || false} onCheckedChange={(c) => updateConfig("extractFollowers", c)} />
          <label htmlFor="followers" className="text-sm font-medium leading-none">Extract Followers</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="following" checked={config.extractFollowing || false} onCheckedChange={(c) => updateConfig("extractFollowing", c)} />
          <label htmlFor="following" className="text-sm font-medium leading-none">Extract Following</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="website" checked={config.extractWebsite || false} onCheckedChange={(c) => updateConfig("extractWebsite", c)} />
          <label htmlFor="website" className="text-sm font-medium leading-none">Website</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="email" checked={config.extractEmail || false} onCheckedChange={(c) => updateConfig("extractEmail", c)} />
          <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="phone" checked={config.extractPhone || false} onCheckedChange={(c) => updateConfig("extractPhone", c)} />
          <label htmlFor="phone" className="text-sm font-medium leading-none">Phone</label>
        </div>
      </div>
    </>
  );

  const renderCommentScraperFields = () => (
    <>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Instagram Post URLs <span className="text-destructive">*</span></label>
        <TagsInput 
          placeholder="Paste Instagram post URLs and press Enter..." 
          value={config.postUrls || []} 
          onChange={(v) => updateConfig("postUrls", v)} 
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Keyword Filter</label>
          <Input placeholder="e.g. interested" value={config.keywordFilter || ""} onChange={(e) => updateConfig("keywordFilter", e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Maximum Profiles</label>
          <Input type="number" placeholder="500" value={config.maximumProfiles || ""} onChange={(e) => updateConfig("maximumProfiles", parseInt(e.target.value))} />
        </div>
      </div>
      <div className="flex gap-6 mt-2 flex-wrap">
        <div className="flex items-center space-x-2">
          <Checkbox id="replies" checked={config.includeReplies || false} onCheckedChange={(c) => updateConfig("includeReplies", c)} />
          <label htmlFor="replies" className="text-sm font-medium leading-none">Include Replies</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="skip_duplicates" checked={config.skipDuplicates || false} onCheckedChange={(c) => updateConfig("skipDuplicates", c)} />
          <label htmlFor="skip_duplicates" className="text-sm font-medium leading-none">Skip Duplicates</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="enrich" checked={config.profileEnrichment || false} onCheckedChange={(c) => updateConfig("profileEnrichment", c)} />
          <label htmlFor="enrich" className="text-sm font-medium leading-none">Profile Enrichment</label>
        </div>
      </div>
    </>
  );

  const renderHashtagScraperFields = () => (
    <>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Hashtags <span className="text-destructive">*</span></label>
        <TagsInput 
          placeholder="Type a hashtag and press Enter..." 
          value={config.hashtags || []} 
          onChange={(v) => updateConfig("hashtags", v)} 
        />
      </div>
      <div className="grid gap-2 w-1/2 pr-2">
        <label className="text-sm font-medium">Target Profiles</label>
        <Input type="number" placeholder="1000" value={config.targetProfiles || ""} onChange={(e) => updateConfig("targetProfiles", parseInt(e.target.value))} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Minimum Followers</label>
          <Input type="number" placeholder="1000" value={config.minFollowers || ""} onChange={(e) => updateConfig("minFollowers", parseInt(e.target.value))} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Maximum Followers</label>
          <Input type="number" placeholder="100000" value={config.maxFollowers || ""} onChange={(e) => updateConfig("maxFollowers", parseInt(e.target.value))} />
        </div>
      </div>
      <div className="flex gap-6 mt-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="skip_dupes_hash" checked={config.skipDuplicates || false} onCheckedChange={(c) => updateConfig("skipDuplicates", c)} />
          <label htmlFor="skip_dupes_hash" className="text-sm font-medium leading-none">Skip Duplicates</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="enrich_hash" checked={config.profileEnrichment || false} onCheckedChange={(c) => updateConfig("profileEnrichment", c)} />
          <label htmlFor="enrich_hash" className="text-sm font-medium leading-none">Profile Enrichment</label>
        </div>
      </div>
    </>
  );

  const renderAdvancedFilters = () => (
    <Collapsible className="border border-border/50 rounded-lg bg-background/50 overflow-hidden">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/30 transition-colors [&[data-state=open]>svg]:rotate-180">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Advanced Filters</span>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 pt-2 border-t border-border/50 bg-background/30 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">Minimum Followers</label>
            <Input type="number" placeholder="1000" value={config.minFollowers || ""} onChange={(e) => updateConfig("minFollowers", parseInt(e.target.value))} className="h-8" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">Maximum Followers</label>
            <Input type="number" placeholder="100000" value={config.maxFollowers || ""} onChange={(e) => updateConfig("maxFollowers", parseInt(e.target.value))} className="h-8" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">Minimum Posts</label>
            <Input type="number" placeholder="10" value={config.minPosts || ""} onChange={(e) => updateConfig("minPosts", parseInt(e.target.value))} className="h-8" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">Maximum Posts</label>
            <Input type="number" placeholder="5000" value={config.maxPosts || ""} onChange={(e) => updateConfig("maxPosts", parseInt(e.target.value))} className="h-8" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">Language</label>
            <Input placeholder="e.g. English" value={config.language || ""} onChange={(e) => updateConfig("language", e.target.value)} className="h-8" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">Country</label>
            <Input placeholder="e.g. United States" value={config.country || ""} onChange={(e) => updateConfig("country", e.target.value)} className="h-8" />
          </div>
          <div className="grid gap-2 col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Business Category</label>
            <Select value={config.businessCategory || ""} onValueChange={(v) => updateConfig("businessCategory", v)}>
              <SelectTrigger className="h-8 w-full bg-background">
                <SelectValue placeholder="Search categories..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Realtor">Realtor</SelectItem>
                <SelectItem value="Restaurant">Restaurant</SelectItem>
                <SelectItem value="Dentist">Dentist</SelectItem>
                <SelectItem value="Lawyer">Lawyer</SelectItem>
                <SelectItem value="Gym">Gym</SelectItem>
                <SelectItem value="Roofing">Roofing</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
                <SelectItem value="Financial Advisor">Financial Advisor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-6">
          <div className="flex items-center space-x-2">
            <Checkbox id="businessOnly" checked={config.businessOnly || false} onCheckedChange={(c) => updateConfig("businessOnly", c)} />
            <label htmlFor="businessOnly" className="text-sm font-medium text-muted-foreground leading-none">Business Account Only</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="verifiedOnly" checked={config.verifiedOnly || false} onCheckedChange={(c) => updateConfig("verifiedOnly", c)} />
            <label htmlFor="verifiedOnly" className="text-sm font-medium text-muted-foreground leading-none">Verified Only</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="websiteRequired" checked={config.hasWebsite || false} onCheckedChange={(c) => updateConfig("hasWebsite", c)} />
            <label htmlFor="websiteRequired" className="text-sm font-medium text-muted-foreground leading-none">Website Required</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="emailRequired" checked={config.hasEmail || false} onCheckedChange={(c) => updateConfig("hasEmail", c)} />
            <label htmlFor="emailRequired" className="text-sm font-medium text-muted-foreground leading-none">Email Required</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="phoneRequired" checked={config.hasPhone || false} onCheckedChange={(c) => updateConfig("hasPhone", c)} />
            <label htmlFor="phoneRequired" className="text-sm font-medium text-muted-foreground leading-none">Phone Required</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="recentlyActive" checked={config.recentlyActive || false} onCheckedChange={(c) => updateConfig("recentlyActive", c)} />
            <label htmlFor="recentlyActive" className="text-sm font-medium text-muted-foreground leading-none">Recently Active</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="excludeContacted" checked={config.excludeContacted || false} onCheckedChange={(c) => updateConfig("excludeContacted", c)} />
            <label htmlFor="excludeContacted" className="text-sm font-medium text-muted-foreground leading-none">Exclude Contacted</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="skipDuplicatesAdvanced" checked={config.skipDuplicates || false} onCheckedChange={(c) => updateConfig("skipDuplicates", c)} />
            <label htmlFor="skipDuplicatesAdvanced" className="text-sm font-medium text-muted-foreground leading-none">Skip Duplicates</label>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="flex flex-col space-y-6 max-w-2xl">
      {renderCommonFields()}
      {type === "AI Discovery" && renderAiDiscoveryFields()}
      {type === "Profile Scraper" && renderProfileScraperFields()}
      {type === "Comment Scraper" && renderCommentScraperFields()}
      {type === "Hashtag Scraper" && renderHashtagScraperFields()}
      
      {renderAdvancedFilters()}
    </div>
  );
}
