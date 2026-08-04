import React from "react";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Sparkles } from "lucide-react";

interface InspectProfileButtonProps {
  onInspect: () => void;
  isInspecting: boolean;
  disabled: boolean;
}

export function InspectProfileButton({
  onInspect,
  isInspecting,
  disabled,
}: InspectProfileButtonProps) {
  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        onClick={onInspect}
        disabled={disabled || isInspecting}
        className="w-full h-12 text-sm font-semibold rounded-xl tracking-tight shadow-sm hover:shadow transition-all"
      >
        {isInspecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Inspecting Profile...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Inspect Profile
          </>
        )}
      </Button>
      {!disabled && !isInspecting && (
        <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3 text-muted-foreground/70" />
          Direct single-profile inspection runs live without queue delays.
        </p>
      )}
    </div>
  );
}
