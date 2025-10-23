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
    // Nếu chưa đăng nhập, chuyển về /login
    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login");
      return;
    }
    // Nếu đã đăng nhập và đang ở /login, chuyển về /timetable
    if (isAuthenticated && pathname === "/login") {
      router.replace("/timetable");
      return;
    }
    // Nếu là Lecture (không phải Head), chỉ cho phép truy cập /timetable
    if (isAuthenticated && user) {
      const isHead = user.roles.includes("Trưởng bộ môn");
      const isLecture = user.roles.includes("Giảng viên");
      if (!isHead && isLecture) {
        // Nếu không phải Head, chỉ cho phép truy cập /timetable
        if (!pathname.startsWith("/timetable")) {
          router.replace("/timetable");
        }
      }
    }
  }, [isAuthenticated, router, pathname, loading, user]);

  if (loading) {
    return null;
  }
  // Luôn render children ở trang /login
  if (pathname === "/login") {
    return children;
  }
  // Nếu chưa đăng nhập, chặn truy cập
  if (!isAuthenticated) {
    return null;
  }
  // Nếu là Lecture (không phải Head), chỉ render ở /timetable
  if (user) {
    const isHead = user.roles.includes("Trưởng bộ môn");
    const isLecture = user.roles.includes("Giảng viên");
    if (!isHead && isLecture && !pathname.startsWith("/timetable")) {
      return null;
    }
  }
  return children;
}
