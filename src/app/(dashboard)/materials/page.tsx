"use client";

import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import MaterialsClient from "./MaterialsClient";

export default function MaterialsPage() {
  return (
    <Suspense fallback={<LoadingSpinner tip="Đang tải vật tư..." />}>
      <MaterialsClient />
    </Suspense>
  );
}
