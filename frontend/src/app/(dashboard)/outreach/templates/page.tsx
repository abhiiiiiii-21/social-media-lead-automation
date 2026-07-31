"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Search, Plus, LayoutTemplate, MoreVertical, Copy, 
  Trash2, Save, ArrowLeft, Filter, 
  User, Briefcase, MapPin, Users, CheckCircle2, Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate } from "@/hooks/use-templates";
import { MessageTemplate } from "@/lib/api/templates";

// ------------------------------------------------------------------
// MOCK DATA & TYPES (Leads Mock kept for Live Preview)
// ------------------------------------------------------------------
type Platform = "All" | "Instagram" | "LinkedIn";
type Category = "All" | "Cold Outreach" | "Follow Up" | "Website Audit" | "SEO" | "Custom";



const MOCK_LEADS = [
  {
    id: "l1",
    name: "Jane Doe",
    first_name: "Jane",
    last_name: "Doe",
    business: "Jane Doe Real Estate",
    city: "Miami",
    website: "janedoe.com",
    industry: "Real Estate",
    followers: "12.5k",
    bio: "Luxury homes in South Florida"
  },
  {
    id: "l2",
    name: "John Smith",
    first_name: "John",
    last_name: "Smith",
    business: "TechFlow Solutions",
    city: "San Francisco",
    website: "techflow.io",
    industry: "B2B SaaS",
    followers: "4,200",
    bio: "Scaling startups with custom software"
  }
];

const VARIABLE_GROUPS = [
  {
    title: "Personal",
    icon: User,
    vars: ["{{first_name}}", "{{last_name}}", "{{bio}}"]
  },
  {
    title: "Business",
    icon: Briefcase,
    vars: ["{{business}}", "{{industry}}", "{{website}}"]
  },
  {
    title: "Location",
    icon: MapPin,
    vars: ["{{city}}"]
  },
  {
    title: "Social",
    icon: Users,
    vars: ["{{followers}}"]
  }
];

// ------------------------------------------------------------------
// ------------------------------------------------------------------
const TemplateCard = React.memo(({ template, onClick }: { template: MessageTemplate, onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col p-5 rounded-xl border border-border/40 bg-background hover:border-border hover:shadow-sm hover:scale-[1.01] cursor-pointer transition-all duration-150"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            {template.platform?.toLowerCase() === "instagram" ? (
              <div className="text-pink-500"><FaInstagram className="w-4 h-4" /></div>
            ) : (
              <div className="text-[#0077b5]"><FaLinkedin className="w-4 h-4" /></div>
            )}
            <span className={cn(
              "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border",
              "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            )}>
              Active
            </span>
          </div>
          <h3 className="font-semibold text-base line-clamp-1">{template.name}</h3>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto">
        <span className="font-medium bg-muted/50 px-2 py-0.5 rounded text-foreground/80">{template.category}</span>
        <span className="flex items-center gap-1 font-medium"><Users className="w-3.5 h-3.5" /> 0 uses</span>
        <span className="ml-auto">{new Date(template.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
});
TemplateCard.displayName = "TemplateCard";

// ------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------
export default function TemplatesPage() {
  const [view, setView] = useState<"list" | "editor">("list");
  
  // Queries & Mutations
  const { data: templatesData, isLoading } = useTemplates({ limit: 100 });
  const templates = templatesData?.items || [];
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  // List State
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform>("All");
  const [categoryFilter, setCategoryFilter] = useState<Category>("All");
  
  // Editor State
  const [editingTemplate, setEditingTemplate] = useState<Partial<MessageTemplate> | null>(null);
  const [testLeadId, setTestLeadId] = useState("l1");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Compute Unsaved Changes
  const originalTemplate = useMemo(() => {
    return templates.find(t => t.id === editingTemplate?.id);
  }, [editingTemplate?.id, templates]);

  const hasUnsavedChanges = useMemo(() => {
    if (!editingTemplate) return false;
    if (!originalTemplate) return true; // new template
    return (
      editingTemplate.name !== originalTemplate.name ||
      editingTemplate.platform !== originalTemplate.platform ||
      editingTemplate.category !== originalTemplate.category ||
      editingTemplate.template_body !== originalTemplate.template_body
    );
  }, [editingTemplate, originalTemplate]);

  // Filtered Templates
  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === "All" || (t.platform?.toLowerCase() === platformFilter.toLowerCase());
    const matchesCategory = categoryFilter === "All" || (t.category?.toLowerCase() === categoryFilter.toLowerCase());
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (view === "editor") {
      adjustTextareaHeight();
    }
  }, [editingTemplate?.template_body, view]);

  const handleCreateNew = () => {
    setEditingTemplate({
      name: "New Template",
      platform: "instagram",
      category: "Cold Outreach",
      template_body: ""
    });
    setView("editor");
  };

  const handleEdit = (t: MessageTemplate) => {
    setEditingTemplate({ ...t });
    setView("editor");
  };

  const handleSave = () => {
    if (!editingTemplate) return;
    
    if (editingTemplate.id) {
      updateTemplate.mutate({ id: editingTemplate.id, data: {
        name: editingTemplate.name,
        platform: editingTemplate.platform,
        category: editingTemplate.category,
        template_body: editingTemplate.template_body
      }});
    } else {
      createTemplate.mutate({
        name: editingTemplate.name || "New Template",
        platform: editingTemplate.platform || "instagram",
        category: editingTemplate.category || "Cold Outreach",
        template_body: editingTemplate.template_body || ""
      }, {
        onSuccess: (data) => {
          setEditingTemplate(data);
        }
      });
    }
  };

  const handleDelete = () => {
    if (editingTemplate?.id) {
      deleteTemplate.mutate(editingTemplate.id, {
        onSuccess: () => {
          handleBack();
        }
      });
    }
  };

  const handleBack = () => {
    setView("list");
    setEditingTemplate(null);
  };

  const insertVariable = (variable: string) => {
    if (!editingTemplate || !textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = editingTemplate.template_body || "";
    
    const newBody = text.substring(0, start) + variable + text.substring(end);
    
    setEditingTemplate({ ...editingTemplate, template_body: newBody });
    
    // Focus and restore cursor position after render
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + variable.length, start + variable.length);
      }
    }, 0);
  };

  const renderPreview = (text: string, lead: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => {
    let result = text;
    Object.keys(lead).forEach(key => {
      if (key === 'id' || key === 'name') return;
      const regex = new RegExp(`{{${key}}}`, 'g');
      // Simple bold replace to prioritize speed and usability
      result = result.replace(regex, `<strong class="text-foreground">${lead[key]}</strong>`);
    });
    return result;
  };

  // ------------------------------------------------------------------
  // LIST VIEW
  // ------------------------------------------------------------------
  if (view === "list") {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your outreach messaging templates.</p>
          </div>
          <Button onClick={handleCreateNew} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
            <Plus className="w-4 h-4 mr-2" /> New Template
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center p-3 rounded-lg border border-border/40 bg-muted/10">
          
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search templates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 bg-background/50 border-border/50 text-sm"
            />
          </div>
          
          <div className="h-6 w-px bg-border/50 hidden md:block" />
          
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto scrollbar-hide">
            {(["All", "Instagram", "LinkedIn"] as Platform[]).map(p => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors duration-150",
                  platformFilter === p ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border/50 hidden md:block mx-1" />

          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto scrollbar-hide">
            <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0 mr-2" />
            {(["All", "Cold Outreach", "Follow Up", "Website Audit", "SEO", "Custom"] as Category[]).map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap border transition-colors duration-150 shrink-0",
                  categoryFilter === c ? "bg-foreground text-background border-foreground" : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/50"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTemplates.map(template => (
              <TemplateCard key={template.id} template={template} onClick={() => handleEdit(template)} />
            ))}

            {filteredTemplates.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-muted/5 rounded-xl border border-dashed border-border/60">
                <LayoutTemplate className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <h3 className="text-base font-semibold mb-1">No templates found</h3>
                <p className="text-sm text-muted-foreground">Adjust your filters or create a new template.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ------------------------------------------------------------------
  // EDITOR VIEW
  // ------------------------------------------------------------------
  if (view === "editor" && editingTemplate) {
    const testLead = MOCK_LEADS.find(l => l.id === testLeadId) || MOCK_LEADS[0];

    return (
      <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto w-full relative">
        
        {/* Editor Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 px-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              {editingTemplate.name === "New Template" ? "Create Template" : "Edit Template"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Save Status Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-medium">
              {hasUnsavedChanges ? (
                <>
                  <Circle className="w-2 h-2 text-amber-500 fill-amber-500" />
                  <span className="text-muted-foreground">Unsaved Changes</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Saved</span>
                </>
              )}
            </div>

            <div className="h-5 w-px bg-border" />

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className="h-9 w-9 p-0 flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted focus:outline-none transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="text-xs cursor-pointer">
                    <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs text-red-500 cursor-pointer focus:bg-red-500/10 focus:text-red-500" onClick={handleDelete} disabled={deleteTemplate.isPending || !editingTemplate.id}>
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                onClick={handleSave} 
                disabled={!hasUnsavedChanges || updateTemplate.isPending || createTemplate.isPending}
                size="sm" 
                className="h-9 px-4 font-medium"
              >
                <Save className="w-4 h-4 mr-2" /> {updateTemplate.isPending || createTemplate.isPending ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* LEFT COLUMN: Editor & Variables (60%) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Editor Card */}
            <div className="flex flex-col p-6 rounded-xl border border-border/40 bg-background shadow-sm gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-muted-foreground">Template Name</label>
                <Input 
                  value={editingTemplate.name}
                  onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                  className="h-9 font-medium max-w-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground">Platform</label>
                  <select 
                    value={editingTemplate.platform}
                    onChange={(e) => setEditingTemplate({...editingTemplate, platform: e.target.value as any})}
                    className="h-9 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <select 
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({...editingTemplate, category: e.target.value as any})}
                    className="h-9 bg-background border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="Cold Outreach">Cold Outreach</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Website Audit">Website Audit</option>
                    <option value="SEO">SEO</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>



              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">Message Body</label>
                </div>
                <textarea 
                  ref={textareaRef}
                  value={editingTemplate.template_body}
                  onChange={e => setEditingTemplate({...editingTemplate, template_body: e.target.value})}
                  className="w-full p-4 rounded-md border border-input bg-background text-[15px] leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-ring min-h-[220px] max-h-[500px] overflow-y-auto"
                  placeholder="Start composing your message..."
                />
                <div className="flex justify-end mt-1">
                  <span className={cn("text-xs font-medium", (editingTemplate.template_body?.length || 0) > 1000 ? "text-red-500" : "text-muted-foreground")}>
                    {editingTemplate.template_body?.length || 0} / 1000 chars
                  </span>
                </div>
              </div>
            </div>

            {/* Variables Card */}
            <div className="flex flex-col p-6 rounded-xl border border-border/40 bg-background shadow-sm gap-5">
              <div>
                <h3 className="text-sm font-semibold">Quick Variables</h3>
                <p className="text-xs text-muted-foreground mt-1">Click a variable to insert it at the current cursor position.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {VARIABLE_GROUPS.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div key={group.title} className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Icon className="w-3.5 h-3.5" />
                        {group.title}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.vars.map(v => (
                          <button 
                            key={v}
                            title="Click to insert"
                            onClick={() => insertVariable(v)}
                            className="px-2 py-1 rounded bg-muted/50 border border-border/60 text-xs font-mono text-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors duration-150"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Preview (40%) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex flex-col p-6 rounded-xl border border-border/40 bg-background shadow-sm gap-5 sticky top-6">
              
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h3 className="text-sm font-semibold">Live Preview</h3>
                <select 
                  value={testLeadId}
                  onChange={e => setTestLeadId(e.target.value)}
                  className="h-7 bg-background border border-input rounded text-xs px-2 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {MOCK_LEADS.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              {/* Message Simulation */}
              <div className="flex flex-col gap-4 py-2">
                
                <div className="flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today 9:41 AM</span>
                </div>

                {(!editingTemplate.template_body || editingTemplate.template_body.trim() === "") ? (
                  <div className="py-12 flex items-center justify-center text-center">
                     <p className="text-sm text-muted-foreground italic">Start typing to see the preview.</p>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border shadow-sm">
                      <span className="text-xs font-bold text-muted-foreground">{testLead.name.charAt(0)}</span>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center gap-1.5 ml-1">
                        <span className="text-[13px] font-medium text-muted-foreground">{testLead.name}</span>
                        {editingTemplate.platform?.toLowerCase() === "instagram" && <FaInstagram className="w-3 h-3 text-pink-500/80" />}
                        {editingTemplate.platform?.toLowerCase() === "linkedin" && <FaLinkedin className="w-3 h-3 text-[#0077b5]/80" />}
                      </div>
                      <div 
                        className="px-4 py-3 bg-muted/40 border border-border/40 rounded-2xl rounded-tl-sm text-[14px] leading-relaxed whitespace-pre-wrap text-foreground/90 w-fit max-w-[95%] shadow-sm"
                        dangerouslySetInnerHTML={{ __html: renderPreview(editingTemplate.template_body || "", testLead) }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          </div>

        </div>
      </div>
    );
  }

  return null;
}
