"use client";

import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import UsersClient from "./UsersClient";

export default function UsersPage() {
  return (
    <Suspense
      fallback={<LoadingSpinner tip="Đang tải danh sách giảng viên..." />}
    >
      <UsersClient initialUsers={[]} />
    </Suspense>
  );
}
