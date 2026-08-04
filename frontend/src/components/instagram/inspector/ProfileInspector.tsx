import React from "react";
import { useProfileInspector } from "@/hooks/use-profile-inspector";
import { ProfileInputCard } from "./ProfileInputCard";
import { ExtractionOptionsCard } from "./ExtractionOptionsCard";
import { InspectProfileButton } from "./InspectProfileButton";
import { LiveProfilePreviewCard } from "./LiveProfilePreviewCard";
import { ExpectedFieldsCard } from "./ExpectedFieldsCard";
import { InspectionProgressView } from "./InspectionProgressView";
import { ProfileInspectionResultView } from "./ProfileInspectionResultView";

interface ProfileInspectorProps {
  showTitle?: boolean;
}

export function ProfileInspector({ showTitle = true }: ProfileInspectorProps) {
  const {
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
  } = useProfileInspector();

  const isFormValid = normalized.isValid && Boolean(normalized.username);
  const showResult = Boolean(profileResult && currentStep === "completed");
  const showProgress = isInspecting || (currentStep !== "idle" && !showResult);

  return (
    <div className="space-y-8">
      {showTitle && (
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Instagram Profile Inspector
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Inspect a public Instagram profile and extract all publicly available information.
          </p>
        </div>
      )}

      {showResult && profileResult ? (
        <ProfileInspectionResultView
          profile={profileResult}
          rawLogs={rawLogs}
          onInspectAnother={resetInspection}
          onReinspect={startInspection}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input, Extraction Options, Start Button */}
          <div className="lg:col-span-7 space-y-6">
            <ProfileInputCard
              urlInput={urlInput}
              setUrlInput={setUrlInput}
              normalized={normalized}
              disabled={isInspecting}
            />

            <ExtractionOptionsCard
              options={options}
              toggleOption={toggleOption}
              setAllOptions={setAllOptions}
              disabled={isInspecting}
            />

            <InspectProfileButton
              onInspect={startInspection}
              isInspecting={isInspecting}
              disabled={!isFormValid}
            />
          </div>

          {/* Right Column: Live Preview & Expected Fields OR Progress Stream */}
          <div className="lg:col-span-5 space-y-6">
            {showProgress ? (
              <InspectionProgressView
                currentStep={currentStep}
                isInspecting={isInspecting}
                liveLogs={liveLogs}
                rawLogs={rawLogs}
                errorDetails={errorDetails}
                onRetry={startInspection}
              />
            ) : (
              <>
                <LiveProfilePreviewCard
                  normalized={normalized}
                  urlInput={urlInput}
                />
                <ExpectedFieldsCard options={options} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
