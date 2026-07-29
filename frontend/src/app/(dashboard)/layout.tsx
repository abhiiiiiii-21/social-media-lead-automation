import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export const metadata = {
  title: "Social Lead Automation | Dashboard",
  description: "Internal agency social media lead generation & outreach platform",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground antialiased">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="h-full p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
