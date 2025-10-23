"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function PrivateRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && pathname === "/login") {
      router.replace("/timetable");
      return;
    }

    if (isAuthenticated && user) {
      const isHead = user.roles.includes("Trưởng bộ môn");
      const isLecture = user.roles.includes("Giảng viên");
      if (!isHead && isLecture) {
        if (!pathname.startsWith("/timetable")) {
          router.replace("/timetable");
        }
      }
    }
  }, [isAuthenticated, router, pathname, loading, user]);

  if (loading) {
    return null;
  }

  if (pathname === "/login") {
    return children;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user) {
    const isHead = user.roles.includes("Trưởng bộ môn");
    const isLecture = user.roles.includes("Giảng viên");
    if (!isHead && isLecture && !pathname.startsWith("/timetable")) {
      return null;
    }
  }
  return children;
}
