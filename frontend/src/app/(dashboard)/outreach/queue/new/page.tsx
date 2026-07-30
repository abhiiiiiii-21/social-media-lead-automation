"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    description: "Import leads from Instagram campaigns or upload a CSV containing Instagram usernames.",
    icon: FaInstagram,
    features: [
      "Campaign Import",
      "CSV Import",
      "Direct Message Outreach"
    ]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Import leads from LinkedIn campaigns or upload a CSV containing LinkedIn profile URLs.",
    icon: FaLinkedin,
    features: [
      "Campaign Import",
      "CSV Import",
      "Connection Message Outreach"
    ]
  }
];

export default function OutreachPlatformSelectionPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (selectedPlatform) {
      router.push(`/outreach/queue/new/import?platform=${selectedPlatform}`);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="text-center w-full mb-10 mt-6"
      >
        <div className="text-xs font-mono font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Step 1 of 3
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Choose Your Outreach Platform</h1>
        <p className="text-muted-foreground text-sm">
          Select the platform where you want to start your outreach workflow.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full mb-10">
        {PLATFORMS.map((platform, i) => {
          const Icon = platform.icon;
          const isSelected = selectedPlatform === platform.id;
          
          return (
            <motion.div
              key={platform.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="h-full"
            >
              <button
                onClick={() => setSelectedPlatform(platform.id)}
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
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <h2 className="text-lg font-semibold mb-2">{platform.name}</h2>
                    <p className="text-muted-foreground text-sm flex-grow mb-6 leading-relaxed">
                      {platform.description}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-border/30">
                      <ul className="flex flex-col gap-2.5">
                        {platform.features.map((feature, idx) => (
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
          disabled={!selectedPlatform}
          className="min-w-[200px] h-12 text-base rounded-full"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Next: Choose Lead Source
        </p>
      </motion.div>
    </div>
  );
}
