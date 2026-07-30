"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MobileSidebar } from "./mobile-sidebar";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  } from "@/components/ui/breadcrumb";

export function Navbar() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  // Capitalize first letter of path segments
  const formatPath = (path: string) => {
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4 overflow-hidden flex-1">
        <MobileSidebar />
        
        <div className="hidden sm:flex items-center mt-[1px]">
          <Breadcrumb>
            <BreadcrumbList className="sm:gap-2.5">
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[14px] font-semibold text-foreground tracking-tight">
                  {paths.length > 0 ? formatPath(paths[paths.length - 1]) : "Dashboard"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <SearchBar />
        <ThemeToggle />
      </div>
    </header>
  );
}
