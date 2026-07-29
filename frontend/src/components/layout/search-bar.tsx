"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full max-w-md hidden md:flex items-center transition-all duration-300">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground/70" />
      <Input
        type="search"
        placeholder="Search..."
        className="w-full pl-9 pr-12 h-9 bg-muted/40 border-border/40 focus-visible:ring-1 focus-visible:bg-background transition-all shadow-none rounded-lg text-sm font-medium"
      />
      {mounted && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      )}
    </div>
  );
}
