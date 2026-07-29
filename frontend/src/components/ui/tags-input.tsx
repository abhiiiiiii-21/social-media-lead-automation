"use client";

import React, { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagsInput({ value = [], onChange, placeholder, className }: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // Remove last tag if backspace is pressed on empty input
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const tag = inputValue.trim().replace(/^,+|,+$/g, '');
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-2 p-1.5 border border-border/50 rounded-md bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-foreground min-h-10",
      className
    )}>
      {value.map((tag, index) => (
        <Badge key={index} variant="secondary" className="gap-1 bg-muted hover:bg-muted font-normal text-sm py-0.5 px-2">
          {tag}
          <div
            role="button"
            tabIndex={0}
            className="cursor-pointer rounded-full p-0.5 hover:bg-background/50 hover:text-foreground text-muted-foreground transition-colors"
            onClick={() => removeTag(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') removeTag(index);
            }}
          >
            <X className="h-3 w-3" />
          </div>
        </Badge>
      ))}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-1 py-0 h-7 min-w-[120px]"
      />
    </div>
  );
}
