"use client";

import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import RoomsClient from "./RoomsClient";

export default function RoomsPage() {
  return (
    <Suspense fallback={<LoadingSpinner tip="Đang tải danh sách phòng..." />}>
      <RoomsClient />
    </Suspense>
  );
}
