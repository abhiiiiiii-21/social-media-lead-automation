import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Smartphone, Briefcase, Users, Activity, Megaphone, BarChart3, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 pb-8">
      <PageHeader
        title="Dashboard"
        description="Monitor your outreach campaigns, lead pipeline and automation activity from one place."
      >
        <Button size="sm" className="h-9 gap-1.5 px-4 font-medium rounded-lg">
          <Plus className="h-4 w-4" />
          <span>New Campaign</span>
        </Button>
      </PageHeader>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-xl border-border/50 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/20 hover:border-foreground/20 hover:bg-muted/5 transition-all duration-300 shadow-none flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Instagram Queue</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-2">
            <div className="text-4xl font-bold tabular-nums tracking-tighter text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Active outreach campaigns
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/50 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/20 hover:border-foreground/20 hover:bg-muted/5 transition-all duration-300 shadow-none flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LinkedIn Queue</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-2">
            <div className="text-4xl font-bold tabular-nums tracking-tighter text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Active outreach campaigns
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/50 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/20 hover:border-foreground/20 hover:bg-muted/5 transition-all duration-300 shadow-none flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-6 pt-6">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-2">
            <div className="text-4xl font-bold tabular-nums tracking-tighter text-foreground">0</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Captured in pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Recent Activity, Recent Campaigns, Pipeline Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl border-border/50 shadow-none min-h-[320px] flex flex-col hover:border-foreground/10 transition-colors">
          <CardHeader className="border-b border-border/40 pb-4 px-6 pt-6">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-foreground">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/5">
            <div className="h-12 w-12 rounded-full bg-background border border-border/50 flex items-center justify-center mb-5 shadow-sm">
              <Activity className="h-5 w-5 text-muted-foreground/70" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">No recent activity</h3>
            <p className="text-sm text-muted-foreground max-w-[280px] mb-6 leading-relaxed">
              Activity across all your connected accounts and outreach campaigns will appear here.
            </p>
            <Button variant="outline" size="sm" className="h-9 px-4 gap-2 font-medium rounded-lg text-xs bg-background hover:bg-muted/50">
              <span>Connect Accounts</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/50 shadow-none min-h-[320px] flex flex-col hover:border-foreground/10 transition-colors">
          <CardHeader className="border-b border-border/40 pb-4 px-6 pt-6">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-foreground">
              <Megaphone className="h-4 w-4 text-muted-foreground" />
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-muted/5">
            <div className="h-12 w-12 rounded-full bg-background border border-border/50 flex items-center justify-center mb-5 shadow-sm">
              <Megaphone className="h-5 w-5 text-muted-foreground/70" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">No campaigns running</h3>
            <p className="text-sm text-muted-foreground max-w-[280px] mb-6 leading-relaxed">
              Create a campaign to begin outreach.
            </p>
            <Button size="sm" className="h-9 px-4 gap-2 font-medium rounded-lg text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Create Campaign</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Charts & Analytics Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-xl border-border/50 shadow-none min-h-[350px] flex flex-col hover:border-foreground/10 transition-colors">
          <CardHeader className="border-b border-border/40 pb-4 px-6 pt-6">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-foreground">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Performance Overview
            </CardTitle>
            <CardDescription className="text-sm mt-1.5 text-muted-foreground/80">
              Campaign engagement and response rates over time.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-background border border-border/50 flex items-center justify-center mb-5 shadow-sm">
                <BarChart3 className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <span className="text-sm font-semibold text-foreground mb-1.5">Chart data unavailable</span>
              <span className="text-xs text-muted-foreground">Waiting for campaign activity</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl border-border/50 shadow-none min-h-[350px] flex flex-col hover:border-foreground/10 transition-colors">
          <CardHeader className="border-b border-border/40 pb-4 px-6 pt-6">
            <CardTitle className="text-base font-semibold flex items-center gap-2.5 text-foreground">
              <Users className="h-4 w-4 text-muted-foreground" />
              Lead Sources
            </CardTitle>
            <CardDescription className="text-sm mt-1.5 text-muted-foreground/80">
              Distribution of leads across platforms.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-background border border-border/50 flex items-center justify-center mb-5 shadow-sm">
                <Users className="h-5 w-5 text-muted-foreground/60" />
              </div>
              <span className="text-sm font-semibold text-foreground mb-1.5">No leads captured</span>
              <span className="text-xs text-muted-foreground">Start an outreach campaign first</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
