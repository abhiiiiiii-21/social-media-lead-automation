"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  // UI-only for now as requested
  const [isDark, setIsDark] = React.useState(true);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full h-9 w-9 text-muted-foreground hover:text-foreground"
      onClick={() => setIsDark(!isDark)}
    >
      {isDark ? (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
