"use client";

import React from "react";
import { ProfileInspector } from "@/components/instagram/inspector";

export default function ProfileInspectorPage() {
  return (
    <div className="flex flex-col gap-6 pb-12">
      <ProfileInspector showTitle={true} />
    </div>
  );
}
