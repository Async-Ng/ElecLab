"use client";
import React, { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

// Lazy load components
const TeachingLogsTable = lazy(() => import("./_components/TeachingLogsTable"));

const TeachingLogsPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner tip="Đang tải nhật ký giảng dạy..." />}>
      <TeachingLogsTable />
    </Suspense>
  );
};

export default TeachingLogsPage;
