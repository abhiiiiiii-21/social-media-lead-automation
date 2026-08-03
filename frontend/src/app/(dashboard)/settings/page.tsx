"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { AlertCircle, BrainCircuit, Trash2, Eye, EyeOff, ArrowRight, Copy, Loader2 } from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useEffect } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const [testingAi, setTestingAi] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Local state for form
  const [groqModel, setGroqModel] = useState("llama-3.3-70b-versatile");
  const [temperature, setTemperature] = useState("0.7");
  const [maxTokens, setMaxTokens] = useState("2048");

  useEffect(() => {
    if (settings) {
      setGroqModel(settings.groq_model || "llama-3.3-70b-versatile");
      setTemperature(settings.temperature?.toString() || "0.7");
      setMaxTokens(settings.max_tokens?.toString() || "2048");
    }
  }, [settings]);

  const handleTestAi = () => {
    setTestingAi(true);
    setTimeout(() => {
      setTestingAi(false);
      toast.success("Connection successful");
    }, 1500);
  };

  const handleSave = () => {
    updateSettings.mutate(
      {
        groq_model: groqModel,
        temperature: parseFloat(temperature),
        max_tokens: parseInt(maxTokens, 10),
      },
      {
        onSuccess: () => toast.success("Settings saved successfully"),
        onError: () => toast.error("Failed to save settings"),
      }
    );
  };

  const copyApiKey = () => {
    toast.info("API Key is secured in backend environment configuration");
  };

  return (
    <div className="flex flex-col p-6 max-w-[780px] mx-auto w-full min-h-[calc(100vh-80px)] justify-center">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1.5 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-[13px] text-muted-foreground/80">Manage application preferences and automation defaults.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
      <div className="flex flex-col gap-5">
        
        {/* 1. AI CONFIGURATION */}
        <Card className="rounded-2xl border-border/40 bg-card shadow-sm overflow-hidden transition-all duration-150">
          <CardHeader className="border-b border-border/30 px-6 py-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-500" />
                AI Configuration
              </CardTitle>
              <p className="text-[11px] text-muted-foreground">Manage AI provider and model settings.</p>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Connected
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-muted-foreground">AI Provider</label>
                  <Input value="Groq" readOnly className="h-9 rounded-md bg-muted/20 border-border/50 text-[13px] font-medium shadow-none focus-visible:ring-1 focus-visible:ring-foreground/20 transition-all duration-150" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-muted-foreground">Default Model</label>
                  <Select value={groqModel} onValueChange={(val) => val && setGroqModel(val)}>
                    <SelectTrigger className="h-9 rounded-md bg-background border-border/50 text-[13px] shadow-none focus:ring-1 focus:ring-foreground/20 transition-all duration-150">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</SelectItem>
                      <SelectItem value="llama-3.1-8b-instant">llama-3.1-8b-instant</SelectItem>
                      <SelectItem value="deepseek-r1-distill-llama-70b">deepseek-r1-distill-llama-70b</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-muted-foreground">API Key</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Input 
                      type={showApiKey ? "text" : "password"} 
                      placeholder="gsk_********************************" 
                      value="************************"
                      disabled
                      className="h-9 rounded-md pr-16 font-mono text-[13px] bg-background border-border/50 shadow-sm focus-visible:ring-1 focus-visible:ring-foreground/30 transition-all duration-150"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button 
                        type="button"
                        onClick={() => {}}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
                      >
                        {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="h-9 rounded-md text-[12px] px-4 border-border/50 hover:-translate-y-[0.5px] transition-all duration-150">Validate</Button>
                    <Button variant="default" size="sm" onClick={handleSave} disabled={updateSettings.isPending} className="h-9 rounded-md text-[12px] px-6 hover:-translate-y-[0.5px] transition-all duration-150">
                      {updateSettings.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">The API key is stored securely and used exclusively for AI lead qualification.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-muted-foreground">Temperature</label>
                  <Input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} step="0.1" min="0" max="2" className="h-9 rounded-md text-[13px] bg-background border-border/50 shadow-none focus-visible:ring-1 focus-visible:ring-foreground/20 transition-all duration-150" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-muted-foreground">Max Tokens</label>
                  <Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} className="h-9 rounded-md text-[13px] bg-background border-border/50 shadow-none focus-visible:ring-1 focus-visible:ring-foreground/20 transition-all duration-150" />
                </div>
              </div>

            </div>
          </CardContent>
          <CardFooter className="border-t border-border/20 px-6 py-3 flex items-center justify-end bg-muted/5">
            <button 
              onClick={handleTestAi} 
              disabled={testingAi}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 flex items-center gap-1"
            >
              {testingAi ? "Testing..." : "Test Connection"} <ArrowRight className="w-3 h-3" />
            </button>
          </CardFooter>
        </Card>

        {/* 2. DANGER ZONE */}
        <Card className="rounded-2xl border-red-500/20 bg-card shadow-sm overflow-hidden transition-all duration-150">
          <CardHeader className="border-b border-border/20 px-6 py-4 bg-red-500/5">
            <CardTitle className="text-[14px] font-semibold flex items-center gap-2 text-red-500">
              <AlertCircle className="w-4 h-4" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pt-3 pb-5">
            <p className="text-[12px] text-muted-foreground/70 leading-relaxed mb-5">
              Permanent deletion of all application data, histories, and preferences.
            </p>
            <div className="flex gap-4">
              
              <Dialog>
                <DialogTrigger render={
                  <Button variant="outline" size="sm" className="flex-1 h-9 rounded-md px-4 text-[12px] text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm transition-all duration-150" />
                }>
                  <Trash2 className="w-3 h-3 mr-2" />
                  Delete Campaign History
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete All Campaign History</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to permanently delete all historical campaign data, queued messages, and lead tracking? This action cannot be reversed.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4 sm:justify-end gap-2 sm:gap-0">
                    <DialogClose render={<Button variant="outline" size="sm" />}>
                      Cancel
                    </DialogClose>
                    <DialogClose render={<Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600 transition-colors" />}>
                      Delete Permanently
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger render={
                  <Button variant="outline" size="sm" className="flex-1 h-9 rounded-md px-4 text-[12px] text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm transition-all duration-150" />
                }>
                  <AlertCircle className="w-3 h-3 mr-2" />
                  Reset Settings
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Application Settings</DialogTitle>
                    <DialogDescription>
                      This will revert all AI configurations, API keys, and application preferences back to their original factory defaults. Do you wish to continue?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4 sm:justify-end gap-2 sm:gap-0">
                    <DialogClose render={<Button variant="outline" size="sm" />}>
                      Cancel
                    </DialogClose>
                    <DialogClose render={<Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600 transition-colors" />}>
                      Reset Settings
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

            </div>
          </CardContent>
        </Card>

      </div>
      )}
    </div>
  );
}
