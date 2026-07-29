import React from "react";
import { useSidebar } from "@/lib/store/use-sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Logo() {
  const { collapsed } = useSidebar();

  return (
    <Link href="/dashboard" className="flex items-center gap-3 w-full transition-all duration-300 overflow-hidden">
      <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center font-mono font-bold text-xs text-primary-foreground flex-shrink-0 shadow-sm">
        SL
      </div>
      <div
        className={cn(
          "flex flex-col whitespace-nowrap transition-all duration-300",
          collapsed ? "opacity-0 w-0 translate-x-4" : "opacity-100 w-full translate-x-0"
        )}
      >
        <span className="text-sm font-semibold text-foreground leading-tight">
          Social Lead Auto
        </span>
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          Internal
        </span>
      </div>
    </Link>
  );
}
