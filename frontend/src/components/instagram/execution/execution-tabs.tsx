import React from "react";
import { CampaignSimulation } from "@/hooks/use-campaign-simulation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function ExecutionTabs({ simulation }: { simulation: CampaignSimulation }) {
  const { campaign, activityLogs, metrics } = simulation;

  if (!campaign) return null;

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4 max-w-[400px]">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="logs">Raw Logs</TabsTrigger>
        <TabsTrigger value="api">API Usage</TabsTrigger>
        <TabsTrigger value="errors">Errors</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="mt-4">
        <Card className="rounded-xl border-border/50 bg-background/50 shadow-none">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold tracking-tight mb-4">Configuration Snapshot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 text-sm">
              {Object.entries(campaign.config).map(([key, value]) => {
                if (value === undefined || value === null || value === "") return null;
                const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                const displayValue = Array.isArray(value) ? value.join(", ") : 
                                     typeof value === "boolean" ? (value ? "Yes" : "No") : 
                                     value.toString();
                return (
                  <div key={key}>
                    <p className="text-muted-foreground capitalize mb-1">{formattedKey}</p>
                    <p className="font-medium truncate" title={displayValue}>{displayValue}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="logs" className="mt-4">
        <Card className="rounded-xl border-border/50 bg-black shadow-none overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted/30 dark:bg-muted/20 p-4 h-[300px] overflow-y-auto font-mono text-[11px] leading-relaxed text-muted-foreground selection:bg-blue-500/30">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex gap-4 hover:bg-white/5 px-2 py-0.5 rounded transition-colors">
                  <span className="text-blue-400/70 shrink-0">
                    [{log.timestamp.toISOString()}]
                  </span>
                  <span className="text-emerald-400/70 shrink-0">
                    [WORKER_01]
                  </span>
                  <span className={`
                    ${log.type === 'error' ? 'text-red-400' : ''}
                    ${log.type === 'warning' ? 'text-amber-400' : ''}
                    ${log.type === 'success' ? 'text-emerald-400' : ''}
                    ${log.type === 'info' ? 'text-gray-300' : ''}
                  `}>
                    {log.message}
                  </span>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <div className="text-gray-500 italic">Waiting for incoming log streams...</div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="api" className="mt-4">
        <Card className="rounded-xl border-border/50 bg-background/50 shadow-none">
          <CardContent className="p-6 text-sm">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <span className="text-muted-foreground">Total Endpoint Hits</span>
              <span className="font-mono font-semibold">{metrics.apiRequests}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <span className="text-muted-foreground">Rate Limit Status</span>
              <span className="font-mono font-semibold text-emerald-500">Healthy (98% capacity remaining)</span>
            </div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-muted-foreground">Average Latency</span>
              <span className="font-mono font-semibold">142ms</span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="errors" className="mt-4">
        <Card className="rounded-xl border-border/50 bg-background/50 shadow-none">
          <CardContent className="p-6 text-sm flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
            <p>No critical pipeline errors detected.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
