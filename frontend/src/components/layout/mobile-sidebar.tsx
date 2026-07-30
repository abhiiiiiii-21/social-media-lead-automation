"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navigation } from "./sidebar";
import { SidebarItem } from "./sidebar-item";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground mr-2"
        />
      }>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col border-r-border/40">
        <SheetHeader className="h-14 flex items-center justify-center border-b border-border/40 px-6 text-left">
          <SheetTitle className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center font-mono font-bold text-xs text-primary-foreground">
              SL
            </div>
            <span className="text-sm font-semibold">Social Lead Auto</span>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 py-4">
          <div className="flex flex-col gap-6 px-4">
            {navigation.map((group, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="px-3 pb-1 text-[11px] font-mono font-medium uppercase text-muted-foreground/70">
                  {group.title}
                </div>
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
