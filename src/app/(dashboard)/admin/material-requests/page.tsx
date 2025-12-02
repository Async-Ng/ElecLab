"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

/**
 * DEPRECATED: Material requests have been consolidated into the unified requests system.
 * Redirecting to /admin/requests instead.
 * This page will be removed in a future version.
 */
export default function AdminMaterialRequestsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/requests");
  }, [router]);

  return <LoadingSpinner tip="Đang chuyển hướng..." />;
}
