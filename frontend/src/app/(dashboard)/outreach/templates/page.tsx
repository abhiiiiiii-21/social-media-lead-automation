import React from "react";

export default function TemplatesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">Manage your outreach templates here.</p>
      </div>
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10">
        <p className="text-sm text-muted-foreground">Coming soon</p>
      </div>
    </div>
  );
}
