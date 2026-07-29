"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/store/use-sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export function SidebarItem({ label, href, icon: Icon, onClick }: SidebarItemProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();
  
  // Very simple active check. In a real app, you might check if pathname.startsWith(href)
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const content = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 outline-none",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
        collapsed ? "justify-center px-0 w-9 h-9 mx-auto" : ""
      )}
    >
      {isActive && !collapsed && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute inset-0 rounded-md bg-muted/60 z-0 border border-border/30"
          initial={false}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
          }}
        />
      )}
      <Icon
        className={cn(
          "flex-shrink-0 z-10 transition-colors duration-200",
          collapsed ? "h-4 w-4" : "h-[18px] w-[18px]",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      />
      
      {!collapsed && (
        <span className="truncate z-10 flex-1 leading-none">{label}</span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="ml-2 font-medium">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
