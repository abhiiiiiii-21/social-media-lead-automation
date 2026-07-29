"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MobileSidebar } from "./mobile-sidebar";
import { SearchBar } from "./search-bar";
import { ThemeToggle } from "./theme-toggle";
import { ProfileMenu } from "./profile-menu";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

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
                <BreadcrumbLink href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Internal
                </BreadcrumbLink>
              </BreadcrumbItem>
              {paths.length > 0 && <BreadcrumbSeparator className="opacity-40" />}
              
              {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join("/")}`;
                const isLast = index === paths.length - 1;
                
                return (
                  <Fragment key={path}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="text-sm font-semibold text-foreground">
                          {formatPath(path)}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                          {formatPath(path)}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator className="opacity-40" />}
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <SearchBar />
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
