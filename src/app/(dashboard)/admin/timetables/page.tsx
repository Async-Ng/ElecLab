"use client";

import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import AdminTimetablesClient from "./AdminTimetablesClient";
import PrivateRoute from "@/components/PrivateRoute";

export default function AdminTimetablesPage() {
  return (
    <PrivateRoute requireAdmin>
      <Suspense fallback={<LoadingSpinner tip="Đang tải thời khóa biểu..." />}>
        <AdminTimetablesClient />
      </Suspense>
    </PrivateRoute>
  );
}
