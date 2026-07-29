import React, { useState } from "react";
import { ResultLead } from "../types/results";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, Globe, Mail, Phone, MapPin, Briefcase, MessageCircle,
  ArrowUpDown, ExternalLink, Send, Copy, Trash2, Eye, Map, BadgeCheck
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber, formatDate, getStatusColor, getScoreColor } from "../utils/formatters";
import { SortConfig } from "../hooks/useCampaignResults";
import { cn } from "@/lib/utils";

interface ResultsDataTableProps {
  leads: ResultLead[];
  selectedIds: string[];
  toggleSelection: (id: string) => void;
  toggleAll: () => void;
  onRowClick: (id: string) => void;
  sortConfig: SortConfig | null;
  handleSort: (key: keyof ResultLead) => void;
  visibleColumns: Record<string, boolean>;
}

export function ResultsDataTable({ 
  leads, selectedIds, toggleSelection, toggleAll, onRowClick, sortConfig, handleSort, visibleColumns 
}: ResultsDataTableProps) {

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: keyof ResultLead }) => {
    const isActive = sortConfig?.key === sortKey;
    return (
      <div 
        className={cn("flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors group", isActive && "text-foreground font-semibold")}
        onClick={() => handleSort(sortKey)}
      >
        {label}
        <ArrowUpDown className={cn("h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground", isActive && "text-foreground")} />
      </div>
    );
  };

  const IconTooltip = ({ condition, icon: Icon, activeColor, trueText, falseText }: any) => (
    <Tooltip>
      <TooltipTrigger render={<div />}>
        <Icon className={cn("h-4 w-4", condition ? activeColor : "text-muted-foreground/30")} />
      </TooltipTrigger>
      <TooltipContent>
        {condition ? trueText : falseText}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="w-full border border-border/50 rounded-xl bg-background/50 overflow-hidden shadow-sm">
      <div className="w-full overflow-x-auto">
        <TooltipProvider delay={200}>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-4 py-3 w-[40px]">
                  <Checkbox 
                    checked={leads.length > 0 && selectedIds.length === leads.length}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap min-w-[200px]">Profile</th>
                {visibleColumns.category && <th className="px-4 py-3 font-medium whitespace-nowrap"><SortableHeader label="Category" sortKey="category" /></th>}
                {visibleColumns.followers && <th className="px-4 py-3 font-medium whitespace-nowrap"><SortableHeader label="Followers" sortKey="followers" /></th>}
                <th className="px-4 py-3 font-medium whitespace-nowrap text-center">Contact Availability</th>
                {visibleColumns.aiScore && <th className="px-4 py-3 font-medium whitespace-nowrap"><SortableHeader label="AI Score" sortKey="aiScore" /></th>}
                {visibleColumns.status && <th className="px-4 py-3 font-medium whitespace-nowrap"><SortableHeader label="Status" sortKey="status" /></th>}
                {visibleColumns.source && <th className="px-4 py-3 font-medium whitespace-nowrap">Source</th>}
                {visibleColumns.dateFound && <th className="px-4 py-3 font-medium whitespace-nowrap"><SortableHeader label="Date Found" sortKey="dateFound" /></th>}
                <th className="px-4 py-3 w-[50px]"></th>
              </tr>
            </thead>
          <tbody className="divide-y divide-border/50">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={10} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Globe className="h-8 w-8 mb-2 opacity-20" />
                    <p>No leads found matching your filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedIds.includes(lead.id);
                return (
                  <tr 
                    key={lead.id} 
                    className={cn(
                      "hover:bg-muted/20 transition-colors cursor-pointer group",
                      isSelected && "bg-muted/10"
                    )}
                    onClick={() => onRowClick(lead.id)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleSelection(lead.id)}
                      />
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border/50">
                          <AvatarImage src={lead.avatarUrl} />
                          <AvatarFallback>{lead.username.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-foreground tracking-tight">@{lead.username}</span>
                            {lead.isVerified && <BadgeCheck className="h-3 w-3 text-sky-500" />}
                          </div>
                          {lead.businessName && <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">{lead.businessName}</span>}
                        </div>
                      </div>
                    </td>

                    {visibleColumns.category && <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{lead.category}</td>}
                    {visibleColumns.followers && <td className="px-4 py-3 whitespace-nowrap font-mono text-foreground">{formatNumber(lead.followers)}</td>}

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <IconTooltip condition={!!lead.website} icon={Globe} activeColor="text-emerald-500" trueText="Website Available" falseText="No Website" />
                        <IconTooltip condition={!!lead.email} icon={Mail} activeColor="text-amber-500" trueText="Email Available" falseText="No Email" />
                        <IconTooltip condition={!!lead.phone} icon={Phone} activeColor="text-purple-500" trueText="Phone Available" falseText="No Phone" />
                        <IconTooltip condition={!!lead.address} icon={MapPin} activeColor="text-emerald-500" trueText="Address Available" falseText="No Address" />
                        <IconTooltip condition={!!lead.linkedin} icon={Briefcase} activeColor="text-blue-500" trueText="LinkedIn Available" falseText="No LinkedIn" />
                        <IconTooltip condition={!!lead.facebook} icon={MessageCircle} activeColor="text-blue-500" trueText="Facebook Available" falseText="No Facebook" />
                      </div>
                    </td>

                    {visibleColumns.aiScore && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-mono font-bold", getScoreColor(lead.aiScore))}>
                            {lead.aiScore}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{lead.aiConfidence}% conf</span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.status && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant="outline" className={cn("font-medium", getStatusColor(lead.status))}>
                          {lead.status}
                        </Badge>
                      </td>
                    )}

                    {visibleColumns.source && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-muted-foreground px-2 py-1 rounded bg-muted/30">
                          {lead.source}
                        </span>
                      </td>
                    )}

                    {visibleColumns.dateFound && (
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-[13px]">
                        {formatDate(lead.dateFound)}
                      </td>
                    )}

                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                        }>
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuItem onClick={() => onRowClick(lead.id)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-4 w-4" /> Open Instagram
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" /> Move to CRM
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" /> Start Outreach
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {lead.email && (
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" /> Copy Email
                            </DropdownMenuItem>
                          )}
                          {lead.phone && (
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" /> Copy Phone
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </TooltipProvider>
      </div>
      
      {/* Pagination Footer */}
      <div className="p-4 border-t border-border/50 flex items-center justify-between bg-muted/5">
        <div className="text-xs text-muted-foreground">
          Showing 1 to {Math.min(25, leads.length)} of {leads.length} entries
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" disabled>Previous</Button>
          <div className="flex gap-1 mx-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-background">1</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">2</Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">3</Button>
            <span className="px-1 text-muted-foreground">...</span>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs">Next</Button>
        </div>
      </div>
    </div>
  );
}
