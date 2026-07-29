import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8", className)}>
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}
