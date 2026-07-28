import Link from "next/link";
import React from "react";
import {
  LayoutDashboard,
  Globe,
  Share2,
  Users,
  Kanban,
  Send,
  BarChart3,
  Settings,
  HelpCircle,
  Search,
  Megaphone,
  User,
  Key,
} from "lucide-react";

export const metadata = {
  title: "Social Lead Automation | Dashboard",
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Instagram Automation",
    items: [
      { label: "Overview", href: "/instagram", icon: Globe },
      { label: "Lead Search", href: "/instagram/search", icon: Search },
      { label: "Campaigns", href: "/instagram/campaigns", icon: Megaphone },
      { label: "Analytics", href: "/instagram/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "LinkedIn Automation",
    items: [
      { label: "Overview", href: "/linkedin", icon: Share2 },
      { label: "Lead Search", href: "/linkedin/search", icon: Search },
      { label: "Campaigns", href: "/linkedin/campaigns", icon: Megaphone },
      { label: "Analytics", href: "/linkedin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Pipeline & Outreach",
    items: [
      { label: "Leads Directory", href: "/leads", icon: Users },
      { label: "CRM Pipeline", href: "/crm", icon: Kanban },
      { label: "Outreach Engine", href: "/outreach", icon: Send },
      { label: "Unified Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "System & Config",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Profile", href: "/settings/profile", icon: User },
      { label: "API Configuration", href: "/settings/api", icon: Key },
      { label: "Help & Docs", href: "/help", icon: HelpCircle },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-950 text-neutral-100 antialiased">
      {/* Sidebar framing */}
      <aside className="w-64 flex-shrink-0 border-r border-neutral-800 bg-neutral-900/40 flex flex-col justify-between">
        <div className="flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-neutral-800/80">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-white flex items-center justify-center font-mono font-bold text-xs text-black">
                SL
              </div>
              <span className="text-xs font-semibold tracking-tight text-neutral-200">
                Social Lead Auto
              </span>
            </div>
            <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded border border-neutral-800 bg-neutral-900 text-neutral-400">
              Internal
            </span>
          </div>

          {/* Navigation Groups */}
          <nav className="p-3 space-y-6">
            {navigation.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-neutral-500 font-medium">
                  {group.title}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/60 transition-colors"
                      >
                        <Icon className="h-3.5 w-3.5 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User / Workspace Footer */}
        <div className="p-3 border-t border-neutral-800/80">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800">
            <div className="h-5 w-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-medium text-neutral-300">
              WA
            </div>
            <div className="flex flex-col text-[11px] leading-none">
              <span className="font-medium text-neutral-200">Websual Team</span>
              <span className="text-[9px] font-mono text-neutral-500 mt-0.5">3 Team Members</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-neutral-950">
        <header className="h-14 px-6 border-b border-neutral-800/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-mono text-neutral-500">internal</span>
            <span>/</span>
            <span className="text-neutral-200 font-medium">social-lead-automation</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-neutral-800 bg-neutral-900 text-[11px] font-mono text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>FastAPI Ready</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
