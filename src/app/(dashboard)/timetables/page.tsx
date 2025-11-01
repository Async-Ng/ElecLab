"use client";

import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import TimetablesClient from "./TimetablesClient";

export default function TimetablePage() {
  return (
    <Suspense fallback={<LoadingSpinner tip="Đang tải thời khóa biểu..." />}>
      <TimetablesClient initialData={[]} />
    </Suspense>
  );
}
