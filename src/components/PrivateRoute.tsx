"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PrivateRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    // Only redirect to /login if not authenticated and not already on /login
    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login");
    }
    // If authenticated and on /login, redirect to /timetable
    if (isAuthenticated && pathname === "/login") {
      router.replace("/timetable");
    }
  }, [isAuthenticated, router, pathname, loading]);

  if (loading) {
    // You can return a spinner here if you want
    return null;
  }
  // Always render children on /login page
  if (pathname === "/login") {
    return children;
  }
  // If not authenticated, block access to protected routes
  if (!isAuthenticated) {
    return null;
  }
  return children;
}
