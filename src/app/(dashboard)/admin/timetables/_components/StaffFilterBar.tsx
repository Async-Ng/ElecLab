"use client";

import React from "react";
import Button from "@/components/ui/Button";

interface StaffFilterBarProps {
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export default function StaffFilterBar({
  onPrevWeek,
  onNextWeek,
}: StaffFilterBarProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px",
        backgroundColor: "#fafafa",
        borderRadius: "4px",
      }}
    >
      <div style={{ flex: 1 }} />
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrevWeek}>
          ← Tuần trước
        </Button>
        <Button variant="outline" onClick={onNextWeek}>
          Tuần sau →
        </Button>
      </div>
    </div>
  );
}
