"use client";

import React, { Suspense, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Upload, CheckCircle2, AlertTriangle, FileText, 
  Check, Clock, ChevronLeft, ChevronRight, Eye, PlayCircle, Download, ShieldCheck, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------------
// TYPES
// ------------------------------------------------------------------
type WizardStep = "upload" | "mapping" | "preview" | "template" | "settings" | "review" | "success";

// ------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------
function CSVImportWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const platform = searchParams.get("platform") || "instagram";

  // Wizard State
  const [currentStep, setCurrentStep] = useState<WizardStep>("upload");
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);

  // Mapping State
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({
    username: "Username",
    business_name: "Business Name",
    website: "Website",
    email: "Email"
  });

  // Settings State
  const [dailyLimit, setDailyLimit] = useState(100);
  const [delayMin, setDelayMin] = useState(60);
  const [delayMax, setDelayMax] = useState(120);
  const [retryFailed, setRetryFailed] = useState(true);
  const [maxRetries, setMaxRetries] = useState(2);
  const [startTime, setStartTime] = useState("immediately");

  // Template State
  const [selectedTemplate, setSelectedTemplate] = useState("Florida Realtor Intro");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success State
  const [creationStep, setCreationStep] = useState(0);

  const getStepNumber = () => {
    switch(currentStep) {
      case "upload": return 3;
      case "mapping": return 4;
      case "preview": return 5;
      case "template": return 6;
      case "settings": return 7;
      case "review": return 8;
      case "success": return 9;
      default: return 3;
    }
  };

  const stepNumber = getStepNumber();
  
  // Animation config
  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  // Calculate dynamic ETA
  const validLeadsCount = 238;
  const days = Math.floor(validLeadsCount / dailyLimit);
  const remainder = validLeadsCount % dailyLimit;
  const hours = Math.ceil((remainder / dailyLimit) * 24);
  const etaString = `${days > 0 ? `${days}d ` : ''}${hours}h`;

  // ------------------------------------------------------------------
  // RENDERERS FOR EACH STEP
  // ------------------------------------------------------------------

  const renderUploadStep = () => {
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        setFileName(e.target.files[0].name);
        setIsUploading(true);
        
        // Simulate upload
        let prog = 0;
        const interval = setInterval(() => {
          prog += 15;
          if (prog >= 100) {
            clearInterval(interval);
            setUploadProgress(100);
            setIsUploadSuccess(true);
            setTimeout(() => {
              setCurrentStep("mapping");
            }, 1000);
          } else {
            setUploadProgress(prog);
          }
        }, 150);
      }
    };

    return (
      <motion.div key="upload" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}
        className="w-full max-w-2xl flex flex-col items-center justify-center p-12 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10 backdrop-blur-sm"
      >
        {!isUploading && !isUploadSuccess ? (
          <>
            <Upload className="w-10 h-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload your file</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
              Drag and drop your CSV or XLSX file here, or click to browse. Ensure it includes at least a username or profile URL column.
            </p>
            <input 
              type="file" 
              accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFile} 
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Browse Files</Button>
          </>
        ) : (
          <div className="flex flex-col w-full max-w-md">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-background shadow-sm mb-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", isUploadSuccess ? "bg-emerald-500/10 text-emerald-500" : "bg-primary/10 text-primary")}>
                {isUploadSuccess ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate text-foreground">{fileName}</span>
                <span className="text-xs text-muted-foreground flex gap-2">
                  <span>18 KB</span>
                  <span>•</span>
                  <span>247 rows</span>
                </span>
              </div>
            </div>
            
            {!isUploadSuccess ? (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm font-medium text-emerald-500 flex items-center justify-center gap-2">
                Ready to import
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  const renderMappingStep = () => {
    // Required check
    const hasUsernameMap = Object.values(mappedFields).includes("Username") || Object.values(mappedFields).includes("Profile URL");

    return (
      <motion.div key="mapping" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}
        className="w-full max-w-4xl"
      >
        <h1 className="text-2xl font-bold tracking-tight mb-2">CSV Mapping</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Review the detected columns and map them to the correct lead fields. Required fields must be mapped to continue.
        </p>

        {/* Summary Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl border border-border/40 bg-background flex flex-col justify-center shadow-sm">
            <span className="text-foreground flex items-center gap-2 font-bold mb-1 text-2xl">
              247
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total Rows</span>
          </div>
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-center shadow-sm">
            <span className="text-emerald-500 flex items-center gap-2 font-bold mb-1 text-2xl">
              238
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500/80">Valid Leads</span>
          </div>
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex flex-col justify-center shadow-sm">
            <span className="text-red-500 flex items-center gap-2 font-bold mb-1 text-2xl">
              7
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-red-500/80">Invalid Rows</span>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col justify-center shadow-sm">
            <span className="text-amber-500 flex items-center gap-2 font-bold mb-1 text-2xl">
              2
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500/80">Duplicate Rows</span>
          </div>
        </div>

        {/* Requirements */}
        <div className="flex gap-8 mb-6 p-4 rounded-xl bg-muted/20 border border-border/40">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Required</span>
            <span className={cn("text-sm font-medium flex items-center gap-2", hasUsernameMap ? "text-emerald-500" : "text-amber-500")}>
              {hasUsernameMap ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              Username OR Profile URL
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Optional</span>
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              Name, Business, Website, Email, Phone, City, Country
            </span>
          </div>
        </div>

        {/* Mapping Table */}
        <div className="rounded-xl border border-border/40 bg-background overflow-hidden shadow-sm mb-8">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 border-b border-border/40 text-muted-foreground font-medium text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 w-1/2">CSV Column</th>
                <th className="px-6 py-3 w-1/2">Maps To System Field</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {[
                { csv: "username", map: "Username", required: true },
                { csv: "business_name", map: "Business Name", required: false },
                { csv: "website", map: "Website", required: false },
                { csv: "email", map: "Email", required: false },
                { csv: "phone", map: "Phone", required: false },
                { csv: "city", map: "City", required: false },
                { csv: "country", map: "Country", required: false },
                { csv: "followers", map: "Followers", required: false },
                { csv: "notes", map: "Notes", required: false },
              ].map((row, i) => (
                <tr key={i} className={cn("hover:bg-muted/10 transition-colors", row.required ? "bg-primary/5" : "")}>
                  <td className="px-6 py-4 font-mono text-xs font-medium text-foreground">{row.csv}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={mappedFields[row.csv] || "Ignore"}
                      onChange={(e) => setMappedFields({...mappedFields, [row.csv]: e.target.value})}
                      className="bg-muted/30 border border-border rounded-md px-3 py-1.5 text-xs text-foreground min-w-[200px]"
                    >
                      <option>Ignore</option>
                      <option>Username</option>
                      <option>Profile URL</option>
                      <option>Business Name</option>
                      <option>Website</option>
                      <option>Email</option>
                      <option>Phone</option>
                      <option>City</option>
                      <option>Country</option>
                      <option>Followers</option>
                      <option>Notes</option>
                    </select>
                    {row.required && <span className="ml-3 text-[10px] uppercase font-bold text-primary">Required ✓</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => {
            setCurrentStep("upload");
            setIsUploadSuccess(false);
            setUploadProgress(0);
            setIsUploading(false);
          }}>Back</Button>
          <Button disabled={!hasUsernameMap} onClick={() => setCurrentStep("preview")}>Continue</Button>
        </div>
      </motion.div>
    );
  };

  const renderPreviewStep = () => {
    return (
      <motion.div key="preview" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}
        className="w-full max-w-[1200px]"
      >
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Preview Imported Leads</h1>
            <p className="text-muted-foreground text-sm">
              Review the first 15 parsed rows from your CSV file to ensure data is mapped correctly.
            </p>
          </div>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="w-4 h-4 mr-2" /> Download Invalid Rows
          </Button>
        </div>

        {/* Table Preview */}
        <div className="rounded-xl border border-border/40 bg-background overflow-hidden shadow-sm mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/30 border-b border-border/40 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {/* Mock Valid Row */}
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">@miamirealtor.jane</td>
                  <td className="px-4 py-3 text-muted-foreground">Jane Doe Real Estate</td>
                  <td className="px-4 py-3 text-blue-400">janedoe.com</td>
                  <td className="px-4 py-3 text-muted-foreground">jane@janedoe.com</td>
                  <td className="px-4 py-3 text-muted-foreground">Miami</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-wider">VALID</span>
                  </td>
                </tr>
                {/* Mock Valid Row */}
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">@florida.homes.expert</td>
                  <td className="px-4 py-3 text-muted-foreground">Florida Homes Expert</td>
                  <td className="px-4 py-3 text-blue-400">floridahomes.expert</td>
                  <td className="px-4 py-3 text-muted-foreground">hello@floridahomes.expert</td>
                  <td className="px-4 py-3 text-muted-foreground">Boca Raton</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase tracking-wider">VALID</span>
                  </td>
                </tr>
                {/* Mock Invalid Row */}
                <tr className="bg-red-500/5 hover:bg-red-500/10 transition-colors">
                  <td className="px-4 py-3 font-medium text-muted-foreground italic">--</td>
                  <td className="px-4 py-3 text-muted-foreground">Miami Beach Properties</td>
                  <td className="px-4 py-3 text-blue-400">miamibeach.com</td>
                  <td className="px-4 py-3 text-muted-foreground">info@miamibeach.com</td>
                  <td className="px-4 py-3 text-muted-foreground">Miami Beach</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap bg-red-500/10 text-red-500 border-red-500/20 uppercase tracking-wider">MISSING USERNAME</span>
                  </td>
                </tr>
                {/* Mock Duplicate Row */}
                <tr className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">@miamirealtor.jane</td>
                  <td className="px-4 py-3 text-muted-foreground">Jane Doe Real Estate</td>
                  <td className="px-4 py-3 text-blue-400">janedoe.com</td>
                  <td className="px-4 py-3 text-muted-foreground">jane@janedoe.com</td>
                  <td className="px-4 py-3 text-muted-foreground">Miami</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase tracking-wider">DUPLICATE</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border/40 bg-muted/10 text-xs text-muted-foreground flex items-center justify-between">
            <span>Showing 15 of 247 rows</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => setCurrentStep("mapping")}>Back</Button>
          <Button onClick={() => setCurrentStep("template")}>Continue</Button>
        </div>
      </motion.div>
    );
  };

  const renderTemplateStep = () => {
    const templates = [
      { name: "Florida Realtor Intro", stats: "Used 34 times" },
      { name: "Luxury Home Intro", stats: "Last edited 2 days ago" },
      { name: "Commercial Real Estate", stats: "Used 12 times" },
      { name: "Follow-up Message", stats: "Last edited 1 week ago" }
    ];

    return (
      <motion.div key="template" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}
        className="w-full max-w-4xl"
      >
        <h1 className="text-2xl font-bold tracking-tight mb-2">Assign Outreach Template</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Select the message template to use for this batch. The live preview will inject your CSV data automatically.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Template Selection */}
          <div className="flex flex-col gap-3">
            {templates.map(t => (
              <div 
                key={t.name}
                onClick={() => setSelectedTemplate(t.name)}
                className={cn(
                  "p-4 rounded-xl border flex flex-col justify-center cursor-pointer transition-all relative",
                  selectedTemplate === t.name 
                    ? "bg-primary/10 border-primary text-foreground" 
                    : "bg-background border-border/60 text-muted-foreground hover:bg-muted/30 hover:border-border"
                )}
              >
                <div className="flex items-center gap-3 mb-1">
                  <FileText className={cn("w-4 h-4", selectedTemplate === t.name ? "text-primary" : "text-muted-foreground")} />
                  <span className="font-semibold text-sm">{t.name}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-7">{t.stats}</span>
                {selectedTemplate === t.name && <CheckCircle2 className="w-5 h-5 text-primary absolute right-4 top-1/2 -translate-y-1/2" />}
              </div>
            ))}
            
            <div className="mt-2 flex justify-center">
              <Button variant="outline" className="w-full border-dashed border-border/60 hover:bg-muted/10">
                + Create New Template
              </Button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-6 rounded-xl border border-border/40 bg-background shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> Live Preview
              </h3>
              <span className="text-xs text-muted-foreground">@miamirealtor.jane</span>
            </div>
            <div className="flex-1 text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">
              Hi <span className="bg-primary/20 text-primary px-1 rounded">Jane Doe Real Estate</span>,<br/><br/>
              I came across your profile and really liked your work in real estate...<br/><br/>
              Since you&apos;re active in <span className="bg-primary/20 text-primary px-1 rounded">Miami</span>, I wanted to reach out. I noticed your website <span className="bg-primary/20 text-primary px-1 rounded">janedoe.com</span> could use some lead automation. Let&apos;s connect!
            </div>
            
            <div className="mt-6 pt-4 border-t border-border/40 flex flex-wrap gap-2">
              {['{{first_name}}', '{{business}}', '{{city}}', '{{website}}'].map(v => (
                <span key={v} className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-1 rounded-md border border-border/50">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => setCurrentStep("preview")}>Back</Button>
          <Button onClick={() => setCurrentStep("settings")}>Continue</Button>
        </div>
      </motion.div>
    );
  };

  const renderSettingsStep = () => {
    return (
      <motion.div key="settings" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <h1 className="text-2xl font-bold tracking-tight mb-2">Configure Outreach</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Set up the constraints and timing for this automation batch.
        </p>

        <div className="flex flex-col gap-6 mb-10">
          
          {/* Safe Limits Card */}
          <div className={cn(
            "p-4 rounded-xl border flex items-start gap-3 shadow-sm",
            dailyLimit <= 200 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
          )}>
            {dailyLimit <= 200 ? <ShieldCheck className="w-5 h-5 shrink-0" /> : <ShieldAlert className="w-5 h-5 shrink-0" />}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold">
                {dailyLimit <= 200 ? "Instagram Safe Limits" : "Account Risk Warning"}
              </span>
              <span className={cn("text-xs font-medium", dailyLimit <= 200 ? "text-emerald-500/80" : "text-red-500/80")}>
                {dailyLimit <= 200 
                  ? "✓ Daily limit is within recommended range." 
                  : "Higher daily limits may increase account risk. Recommended limit is under 200/day."}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-xl border border-border/40 bg-background shadow-sm flex flex-col gap-6">
            
            {/* Daily Limit */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold flex items-center justify-between">
                Daily Sending Limit
                <span className="text-xs text-muted-foreground font-normal">{dailyLimit} / day</span>
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="10" max="500" step="10" 
                  value={dailyLimit} onChange={(e) => setDailyLimit(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Delay */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border/30">
              <label className="text-sm font-semibold">Delay Between Messages</label>
              <div className="flex items-center gap-4">
                <div className="flex-1 flex items-center gap-2">
                  <Input type="number" value={delayMin} onChange={(e) => setDelayMin(Number(e.target.value))} className="h-9" />
                  <span className="text-sm text-muted-foreground">Min (sec)</span>
                </div>
                <span className="text-muted-foreground">-</span>
                <div className="flex-1 flex items-center gap-2">
                  <Input type="number" value={delayMax} onChange={(e) => setDelayMax(Number(e.target.value))} className="h-9" />
                  <span className="text-sm text-muted-foreground">Max (sec)</span>
                </div>
              </div>
            </div>

            {/* Retries */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border/30">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">Retry Failed Messages</label>
                  <span className="text-xs text-muted-foreground">Automatically retry on rate limits or failures</span>
                </div>
                <Switch checked={retryFailed} onCheckedChange={setRetryFailed} />
              </div>
              {retryFailed && (
                <div className="flex items-center gap-3 mt-2 pl-4 border-l-2 border-border/50">
                  <label className="text-sm text-muted-foreground">Maximum Retry Attempts:</label>
                  <select 
                    value={maxRetries} onChange={(e) => setMaxRetries(Number(e.target.value))}
                    className="bg-muted/30 border border-border rounded-md px-3 py-1.5 text-xs text-foreground"
                  >
                    <option value={1}>1 time</option>
                    <option value={2}>2 times</option>
                    <option value={3}>3 times</option>
                  </select>
                </div>
              )}
            </div>

            {/* Start Time */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border/30">
              <label className="text-sm font-semibold">Start Time</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => setStartTime("immediately")}
                  className={cn(
                    "p-4 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all text-center",
                    startTime === "immediately" ? "bg-primary/10 border-primary text-foreground" : "bg-background border-border text-muted-foreground"
                  )}
                >
                  <PlayCircle className={cn("w-6 h-6 mb-2", startTime === "immediately" ? "text-primary" : "text-muted-foreground")} />
                  <span className="font-semibold text-sm">Immediately</span>
                </div>
                <div 
                  onClick={() => setStartTime("scheduled")}
                  className={cn(
                    "p-4 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all text-center",
                    startTime === "scheduled" ? "bg-primary/10 border-primary text-foreground" : "bg-background border-border text-muted-foreground"
                  )}
                >
                  <Clock className={cn("w-6 h-6 mb-2", startTime === "scheduled" ? "text-primary" : "text-muted-foreground")} />
                  <span className="font-semibold text-sm">Schedule Later</span>
                </div>
              </div>
            </div>

          </div>

          <div className="text-center p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-sm font-medium flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" /> Estimated Completion Time: {etaString}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => setCurrentStep("template")}>Back</Button>
          <Button onClick={() => setCurrentStep("review")}>Continue</Button>
        </div>
      </motion.div>
    );
  };

  const renderReviewStep = () => {
    return (
      <motion.div key="review" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }}
        className="w-full max-w-3xl mx-auto"
      >
        <h1 className="text-2xl font-bold tracking-tight mb-2">Review & Create Queue</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Finalize your outreach configuration. Once created, the batch will appear in your Queue.
        </p>

        <div className="p-8 rounded-2xl border border-border/40 bg-background shadow-sm flex flex-col gap-6 mb-10">
          
          {/* Template Preview Section */}
          <div className="flex flex-col gap-2 pb-6 border-b border-border/40">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Template Preview</span>
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 text-sm text-foreground/90 font-medium italic relative">
              <FileText className="absolute right-4 top-4 w-12 h-12 text-muted/30" />
              Hi Jane Doe Real Estate,<br/><br/>
              I came across your profile and really liked your work in real estate...
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Platform</span>
              <span className="font-semibold text-sm flex items-center">
                {platform === "linkedin" ? <FaLinkedin className="w-3.5 h-3.5 mr-1.5 text-[#0077b5]" /> : <FaInstagram className="w-3.5 h-3.5 mr-1.5 text-pink-500" />}
                {platform === "linkedin" ? "LinkedIn" : "Instagram"}
              </span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Lead Source</span>
              <span className="font-semibold text-sm flex items-center">
                <Upload className="w-3.5 h-3.5 mr-1.5 text-primary" />
                CSV Upload
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">CSV Filename</span>
              <span className="font-semibold text-sm truncate max-w-[150px]">{fileName}</span>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Valid Leads</span>
              <span className="text-2xl font-bold text-foreground">238</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Template</span>
              <span className="font-semibold text-sm truncate max-w-[150px]">{selectedTemplate}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Daily Limit</span>
              <span className="font-semibold text-sm">{dailyLimit} / day</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Delay</span>
              <span className="font-semibold text-sm">{delayMin} – {delayMax} sec</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Retries</span>
              <span className={cn("font-semibold text-sm", retryFailed ? "text-emerald-500" : "text-muted-foreground")}>
                {retryFailed ? `Enabled (${maxRetries} max)` : "Disabled"}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Est. Completion</span>
              <span className="font-semibold text-sm">{etaString}</span>
            </div>
          </div>

        </div>

        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => setCurrentStep("settings")}>Back</Button>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
            onClick={() => {
              setCurrentStep("success");
              // Start creation animation sequence
              let step = 0;
              const intv = setInterval(() => {
                step++;
                setCreationStep(step);
                if (step >= 4) {
                  clearInterval(intv);
                  setTimeout(() => {
                    router.push('/outreach/queue');
                  }, 2500);
                }
              }, 600);
            }}
          >
            Create Queue
          </Button>
        </div>
      </motion.div>
    );
  };

  const renderSuccessStep = () => {
    return (
      <motion.div key="success" variants={slideVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-md mx-auto flex flex-col items-center justify-center mt-12"
      >
        <AnimatePresence mode="wait">
          {creationStep >= 4 ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-center">Queue Created Successfully</h1>
              <p className="text-muted-foreground text-sm text-center mb-6">Redirecting to queue...</p>
            </motion.div>
          ) : (
            <motion.div key="creating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight mb-8 text-center flex justify-center items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-primary/50 border-t-primary animate-spin" />
                Preparing outreach batch...
              </h1>
              
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-background shadow-sm">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", creationStep >= 1 ? "bg-emerald-500/10" : "bg-muted")}>
                    {creationStep >= 1 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                  </div>
                  <span className={cn("text-sm font-medium transition-colors", creationStep >= 1 ? "text-foreground" : "text-muted-foreground")}>Importing leads</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-background shadow-sm">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", creationStep >= 2 ? "bg-emerald-500/10" : "bg-muted")}>
                    {creationStep >= 2 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                  </div>
                  <span className={cn("text-sm font-medium transition-colors", creationStep >= 2 ? "text-foreground" : "text-muted-foreground")}>Applying template</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-background shadow-sm">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", creationStep >= 3 ? "bg-emerald-500/10" : "bg-muted")}>
                    {creationStep >= 3 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                  </div>
                  <span className={cn("text-sm font-medium transition-colors", creationStep >= 3 ? "text-foreground" : "text-muted-foreground")}>Creating message queue</span>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-background shadow-sm">
                  <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", creationStep >= 4 ? "bg-emerald-500/10" : "bg-muted")}>
                    {creationStep >= 4 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                  </div>
                  <span className={cn("text-sm font-medium transition-colors", creationStep >= 4 ? "text-foreground" : "text-muted-foreground")}>Scheduling outreach</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-8rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full relative">
      
      {/* ------------------------------------------------------------------
          SHARED HEADER (hidden on success)
      -------------------------------------------------------------------*/}
      {currentStep !== "success" && (
        <>
          <div className="absolute top-8 left-4 sm:left-6 lg:left-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                if (currentStep === "upload") router.back();
              }}
              className={cn("text-muted-foreground hover:text-foreground", currentStep !== "upload" && "opacity-0 pointer-events-none")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
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
            
            <div className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-center gap-1 max-w-[800px] mx-auto overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
              {/* Fake previous steps */}
              <span className="flex items-center gap-1.5 text-foreground opacity-60"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Platform</span>
              <span className="w-3 h-px bg-border/60 mx-1" />
              <span className="flex items-center gap-1.5 text-foreground opacity-60"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Source</span>
              <span className="w-3 h-px bg-border/60 mx-1" />
              
              {/* Dynamic current steps */}
              <span className={cn("flex items-center gap-1.5 transition-colors", stepNumber === 3 ? "text-primary font-bold" : stepNumber > 3 ? "text-foreground opacity-60" : "text-muted-foreground opacity-40")}>
                {stepNumber > 3 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />} Upload
              </span>
              <span className="w-3 h-px bg-border/60 mx-1" />
              <span className={cn("flex items-center gap-1.5 transition-colors", stepNumber === 4 ? "text-primary font-bold" : stepNumber > 4 ? "text-foreground opacity-60" : "text-muted-foreground opacity-40")}>
                {stepNumber > 4 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />} Mapping
              </span>
              <span className="w-3 h-px bg-border/60 mx-1" />
              <span className={cn("flex items-center gap-1.5 transition-colors", stepNumber === 5 ? "text-primary font-bold" : stepNumber > 5 ? "text-foreground opacity-60" : "text-muted-foreground opacity-40")}>
                {stepNumber > 5 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />} Preview
              </span>
              <span className="w-3 h-px bg-border/60 mx-1" />
              <span className={cn("flex items-center gap-1.5 transition-colors", stepNumber === 6 ? "text-primary font-bold" : stepNumber > 6 ? "text-foreground opacity-60" : "text-muted-foreground opacity-40")}>
                {stepNumber > 6 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />} Template
              </span>
              <span className="w-3 h-px bg-border/60 mx-1" />
              <span className={cn("flex items-center gap-1.5 transition-colors", stepNumber === 7 ? "text-primary font-bold" : stepNumber > 7 ? "text-foreground opacity-60" : "text-muted-foreground opacity-40")}>
                {stepNumber > 7 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />} Configure
              </span>
              <span className="w-3 h-px bg-border/60 mx-1" />
              <span className={cn("flex items-center gap-1.5 transition-colors", stepNumber === 8 ? "text-primary font-bold" : "text-muted-foreground opacity-40")}>
                Review
              </span>
            </div>
          </motion.div>
        </>
      )}

      {/* ------------------------------------------------------------------
          ANIMATED STEP RENDERER
      -------------------------------------------------------------------*/}
      <div className="w-full flex justify-center pb-20">
        <AnimatePresence mode="wait">
          {currentStep === "upload" && renderUploadStep()}
          {currentStep === "mapping" && renderMappingStep()}
          {currentStep === "preview" && renderPreviewStep()}
          {currentStep === "template" && renderTemplateStep()}
          {currentStep === "settings" && renderSettingsStep()}
          {currentStep === "review" && renderReviewStep()}
          {currentStep === "success" && renderSuccessStep()}
        </AnimatePresence>
      </div>

    </div>
  );
}

export default function CSVImportPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="animate-pulse w-8 h-8 rounded-full border-2 border-primary/50 border-t-transparent animate-spin" />
      </div>
    }>
      <CSVImportWizard />
    </Suspense>
  );
}
