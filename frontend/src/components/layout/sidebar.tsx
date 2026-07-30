"use client";

import React from "react";
import {
  LayoutDashboard,
  Search,
  Megaphone,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Inbox,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/store/use-sidebar";
import { SidebarItem } from "./sidebar-item";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";

// Define the navigation structure as requested
const navigation = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Instagram",
    items: [
      { label: "New Campaign", href: "/instagram/new", icon: Search },
      { label: "Campaigns", href: "/instagram/campaigns", icon: Megaphone },
    ],
  },
  {
    title: "LinkedIn",
    items: [
      { label: "Search", href: "/linkedin/search", icon: Search },
      { label: "Campaigns", href: "/linkedin/campaigns", icon: Megaphone },
    ],
  },
  {
    title: "Outreach",
    items: [
      { label: "Queue", href: "/outreach/queue", icon: Inbox },
      { label: "Templates", href: "/outreach/templates", icon: FileText },
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

      <div className={cn("p-4 border-t border-border/40 flex items-center", collapsed ? "flex-col gap-4 justify-center" : "justify-between")}>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className={cn("relative p-0 hover:bg-muted/50 transition-colors rounded-md h-auto w-auto", collapsed ? "mx-auto" : "flex items-center gap-3 justify-start overflow-hidden flex-1")} />}>
            <Avatar className="h-8 w-8 rounded-md border border-border/60 transition-colors hover:border-border shrink-0">
              <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-semibold rounded-md">
                WA
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col items-start overflow-hidden text-left">
                <span className="text-[13px] font-medium leading-none truncate w-full">Websual Admin</span>
                <span className="text-[11px] text-muted-foreground truncate mt-1 w-full">admin@websual.agency</span>
              </div>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-xl" align={collapsed ? "start" : "end"} side={collapsed ? "right" : "bottom"} sideOffset={12}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Websual Admin</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@websual.agency
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider delay={200}>
          <Tooltip>
            <TooltipTrigger render={
              <Button
                variant="ghost"
                size="icon"
                onClick={toggle}
                className={cn("h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors shrink-0 rounded-md", collapsed && "mx-auto")}
              />
            }>
              {collapsed ? <PanelLeftOpen className="h-[16px] w-[16px]" /> : <PanelLeftClose className="h-[16px] w-[16px]" />}
              <span className="sr-only">Toggle Sidebar</span>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? "right" : "top"}>
              {collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}

// Export navigation data to use it in MobileSidebar as well
export { navigation };
