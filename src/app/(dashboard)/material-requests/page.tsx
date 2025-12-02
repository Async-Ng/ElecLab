"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

/**
 * DEPRECATED: Material requests have been consolidated into the unified requests system.
 * Redirecting to /requests instead.
 * This page will be removed in a future version.
 */
export default function MaterialRequestsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/requests");
  }, [router]);

  return <LoadingSpinner />;
}
