import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUALIFICATION_STATUS_OPTIONS, BUSINESS_CATEGORIES, COUNTRIES } from "../constants/filters";

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";

interface ResultsFilterBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  totalCount: number;
  visibleColumns: Record<string, boolean>;
  setVisibleColumns: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export function ResultsFilterBar({ searchTerm, setSearchTerm, totalCount, visibleColumns, setVisibleColumns }: ResultsFilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-border/50 rounded-xl bg-background/50 sticky top-0 z-10 backdrop-blur-md">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search leads by username or business..." 
            className="pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {QUALIFICATION_STATUS_OPTIONS.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_CATEGORIES.map(o => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map(o => (
              <SelectItem key={o} value={o}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="h-9 border-dashed text-muted-foreground">
          <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
          More Filters
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" size="sm" className="h-9 font-medium text-muted-foreground" />
          }>
            <Settings2 className="mr-2 h-3.5 w-3.5" />
            Columns
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            {Object.keys(visibleColumns).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={visibleColumns[key]}
                onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, [key]: checked }))}
                className="capitalize"
              >
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {searchTerm && (
          <Button variant="ghost" size="sm" className="h-9 text-muted-foreground hover:text-foreground" onClick={() => setSearchTerm("")}>
            <X className="mr-2 h-3.5 w-3.5" /> Clear
          </Button>
        )}
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {totalCount.toLocaleString()} results
        </span>
      </div>
    </div>
  );
}
