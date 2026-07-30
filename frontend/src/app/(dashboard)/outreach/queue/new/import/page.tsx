"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Rocket, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FaInstagram, FaLinkedin } from "react-icons/fa";

const OPTIONS = [
  {
    id: "campaign",
    title: "Import Campaign Leads",
    description: "Import qualified leads from one of your completed campaigns.",
    icon: Rocket,
    features: [
      "Qualified campaign leads",
      "AI scores & metadata included",
      "Import in one click"
    ]
  },
  {
    id: "csv",
    title: "Import CSV",
    description: "Import your own prospect list using a CSV file.",
    icon: Upload,
    features: [
      "Custom prospect lists",
      "Website audit reports",
      "Bulk CSV import"
    ]
  }
];

function ImportLeadSourceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const platform = searchParams.get("platform") || "instagram";
  
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedSource) return;
    
    if (selectedSource === "campaign") {
      router.push(`/outreach/queue/new/import/campaign?platform=${platform}`);
    } else if (selectedSource === "csv") {
      router.push(`/outreach/queue/new/import/csv?platform=${platform}`);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full relative">
      
      {/* Back Button */}
      <div className="absolute top-8 left-4 sm:left-6 lg:left-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center w-full mb-10 mt-12"
      >
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            {platform === "linkedin" ? (
              <><FaLinkedin className="w-3.5 h-3.5 text-[#0077b5]" /> LinkedIn</>
            ) : (
              <><FaInstagram className="w-3.5 h-3.5 text-pink-500" /> Instagram</>
            )}
          </div>
        </div>
        <div className="text-xs font-mono font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Step 2 of 3
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Choose Lead Source</h1>
        <p className="text-muted-foreground text-sm">
          Select how you want to import leads into your outreach queue.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full mb-10">
        {OPTIONS.map((option, i) => {
          const Icon = option.icon;
          const isSelected = selectedSource === option.id;
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="h-full"
            >
              <button
                onClick={() => setSelectedSource(option.id)}
                className={cn(
                  "block w-full text-left h-full focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background rounded-2xl transition-all duration-300 relative",
                  isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                )}
              >
                <div className={cn(
                  "relative h-full flex flex-col p-7 rounded-2xl overflow-hidden transition-all duration-300",
                  "bg-background/60 backdrop-blur-xl border border-border/40",
                  "hover:border-border/80 hover:bg-muted/10",
                  isSelected ? "bg-muted/20 border-primary/30" : "",
                  "hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,255,255,0.02)]"
                )}>
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full text-xs font-medium flex items-center shadow-sm backdrop-blur-sm z-20">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Selected
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col h-full mt-2">
                    <div className="flex items-start justify-between mb-5">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center bg-muted/50 border border-border/50 text-foreground transition-transform duration-300",
                        isSelected ? "scale-105 bg-primary/10 border-primary/20 text-primary" : ""
                      )}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                    </div>
                    
                    <h2 className="text-lg font-semibold mb-2">{option.title}</h2>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                      {option.description}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-border/30">
                      <ul className="flex flex-col gap-2.5">
                        {option.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                            <CheckCircle2 className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex flex-col items-center justify-center w-full"
      >
        <Button 
          size="lg"
          onClick={handleContinue}
          disabled={!selectedSource}
          className="min-w-[200px] h-12 text-base rounded-full"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Next: Select a campaign or upload your CSV.
        </p>
      </motion.div>
    </div>
  );
}

export default function OutreachImportSelectionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-pulse w-8 h-8 rounded-full border-2 border-primary/50 border-t-transparent animate-spin" />
      </div>
    }>
      <ImportLeadSourceContent />
    </Suspense>
  );
}
