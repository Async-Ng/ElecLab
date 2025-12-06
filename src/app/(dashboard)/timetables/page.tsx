"use client";

import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import UserTimetablesClient from "./UserTimetablesClient";
import PrivateRoute from "@/components/PrivateRoute";

export default function UserTimetablesPage() {
  return (
    <PrivateRoute>
      <Suspense fallback={<LoadingSpinner tip="Đang tải thời khóa biểu..." />}>
        <UserTimetablesClient />
      </Suspense>
    </PrivateRoute>
  );
}
