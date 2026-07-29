"use client";

import React from "react";
import {
  LayoutDashboard,
  Search,
  Megaphone,
  BarChart3,
  Users,
  Kanban,
  Send,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/store/use-sidebar";
import { SidebarItem } from "./sidebar-item";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define the navigation structure as requested
const navigation = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Instagram",
    items: [
      { label: "Search", href: "/instagram/search", icon: Search },
      { label: "Campaigns", href: "/instagram/campaigns", icon: Megaphone },
      { label: "Analytics", href: "/instagram/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "LinkedIn",
    items: [
      { label: "Search", href: "/linkedin/search", icon: Search },
      { label: "Campaigns", href: "/linkedin/campaigns", icon: Megaphone },
      { label: "Analytics", href: "/linkedin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Pipeline",
    items: [
      { label: "Leads", href: "/leads", icon: Users },
      { label: "CRM", href: "/crm", icon: Kanban },
      { label: "Outreach", href: "/outreach", icon: Send },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 relative",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      <div className="flex h-14 items-center px-4 border-b border-border/40">
        <Logo />
      </div>

      <ScrollArea className="flex-1 py-4">
        <div className="flex flex-col gap-8 px-3">
          {navigation.map((group, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              {!collapsed && (
                <div className="px-3 pb-2 text-[11px] font-mono font-medium uppercase text-muted-foreground/60">
                  {group.title}
                </div>
              )}
              {collapsed && (
                <div className="mx-auto pb-2 mb-2 border-b border-border/50 w-6" />
              )}
              {group.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                />
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/40 flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(
            "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
            collapsed ? "mx-auto" : "ml-auto"
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px]" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
    </aside>
  );
}

// Export navigation data to use it in MobileSidebar as well
export { navigation };
