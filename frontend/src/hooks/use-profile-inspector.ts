import { useState, useCallback, useMemo } from "react";
import {
  ExtractionOptions,
  DEFAULT_EXTRACTION_OPTIONS,
  InspectionStep,
  InspectionErrorType,
  InspectionLogEntry,
  ProfileInspectResponsePayload,
} from "@/lib/types/inspector";
import { ProfileSummaryData } from "@/lib/types/instagram";
import { normalizeProfileInput } from "@/lib/utils/normalize-profile-url";
import { toast } from "sonner";

export function useProfileInspector() {
  const [urlInput, setUrlInput] = useState<string>("");
  const [options, setOptions] = useState<ExtractionOptions>(DEFAULT_EXTRACTION_OPTIONS);
  const [currentStep, setCurrentStep] = useState<InspectionStep>("idle");
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [liveLogs, setLiveLogs] = useState<InspectionLogEntry[]>([]);
  const [rawLogs, setRawLogs] = useState<InspectionLogEntry[]>([]);
  const [profileResult, setProfileResult] = useState<ProfileSummaryData | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ message: string; type: InspectionErrorType } | null>(null);

  // Normalized input details
  const normalized = useMemo(() => normalizeProfileInput(urlInput), [urlInput]);

  const toggleOption = useCallback((key: keyof ExtractionOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setAllOptions = useCallback((val: boolean) => {
    setOptions({
      basicProfile: val,
      contactInfo: val,
      businessInfo: val,
      followers: val,
      following: val,
      posts: val,
      externalLinks: val,
      highlights: val,
      recentPosts: val,
    });
  }, []);

  const addLog = (
    message: string,
    type: "info" | "success" | "warning" | "error" | "playwright" = "info",
    isRaw: boolean = false
  ) => {
    const entry: InspectionLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      message,
      type,
    };
    if (isRaw) {
      setRawLogs((prev) => [...prev, entry]);
    } else {
      setLiveLogs((prev) => [...prev, entry]);
    }
  };

  const startInspection = useCallback(async () => {
    if (!normalized.isValid || !normalized.username) {
      toast.error("Please enter a valid Instagram profile URL or username.");
      return;
    }

    setIsInspecting(true);
    setErrorDetails(null);
    setProfileResult(null);
    setLiveLogs([]);
    setRawLogs([]);
    setCurrentStep("opening");

    const username = normalized.username;
    const profileUrl = normalized.profileUrl;

    try {
      addLog(`Initializing inspection for @${username}...`, "info");
      addLog(`Target: ${profileUrl}`, "playwright", true);

      setCurrentStep("loading");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
      
      const res = await fetch(`${baseUrl}/scraper/inspect-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url_or_username: profileUrl,
          options: {
            basic_profile: options.basicProfile,
            contact_info: options.contactInfo,
            business_info: options.businessInfo,
            followers: options.followers,
            following: options.following,
            posts: options.posts,
            external_links: options.externalLinks,
            highlights: options.highlights,
            recent_posts: options.recentPosts,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const apiData: ProfileInspectResponsePayload = await res.json();

      // Check if backend returned an error
      if (!apiData.success || !apiData.profile) {
        const errorMsg = apiData.error || `Failed to extract profile @${username}`;
        setCurrentStep("error");
        setErrorDetails({
          message: errorMsg,
          type: apiData.error_type || "UNKNOWN",
        });
        addLog(errorMsg, "error");
        if (apiData.raw_logs) {
          apiData.raw_logs.forEach((log) => addLog(log, "playwright", true));
        }
        setIsInspecting(false);
        return;
      }

      // Sync rich step logs from backend
      if (apiData.live_logs && apiData.live_logs.length > 0) {
        setLiveLogs(
          apiData.live_logs.map((msg, idx) => ({
            id: `live-${idx}-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            message: msg,
            type: msg.startsWith("✓") ? "success" : "info",
          }))
        );
      }
      if (apiData.raw_logs && apiData.raw_logs.length > 0) {
        setRawLogs(
          apiData.raw_logs.map((msg, idx) => ({
            id: `raw-${idx}-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            message: msg,
            type: "playwright",
          }))
        );
      }

      // Completed with real backend data
      setCurrentStep("completed");
      setProfileResult(apiData.profile);
      toast.success(`Profile @${username} inspected successfully!`);
    } catch (err: any) {
      console.error("Inspection error", err);
      const isConnectionError = err.message === "Failed to fetch" || err.name === "TypeError";
      const errorMsg = isConnectionError
        ? "Unable to connect to backend server. Make sure the backend is running at http://localhost:8000."
        : (err.message || "An unexpected error occurred during profile inspection.");
      setCurrentStep("error");
      setErrorDetails({
        message: errorMsg,
        type: "SCRAPE_ERROR",
      });
      addLog(errorMsg, "error");
      toast.error(errorMsg);
    } finally {
      setIsInspecting(false);
    }
  }, [normalized, options]);

  const resetInspection = useCallback(() => {
    setUrlInput("");
    setCurrentStep("idle");
    setIsInspecting(false);
    setProfileResult(null);
    setErrorDetails(null);
    setLiveLogs([]);
    setRawLogs([]);
  }, []);

  return {
    urlInput,
    setUrlInput,
    normalized,
    options,
    toggleOption,
    setAllOptions,
    currentStep,
    isInspecting,
    liveLogs,
    rawLogs,
    profileResult,
    errorDetails,
    startInspection,
    resetInspection,
  };
}
