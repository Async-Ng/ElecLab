"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PrivateRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState<string | null>(null);

  // Load active role from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("activeRole");
      setActiveRole(stored);
    }
  }, []);

  // Array các route cho phép giảng viên truy cập
  const allowedRoutes = [
    "/timetables",
    "/teaching-logs",
    "/requests",
    "/material-requests",
  ];

  // Array các route chỉ Admin được truy cập
  const adminRoutes = ["/materials", "/users", "/rooms", "/admin"];

  useEffect(() => {
    if (loading || activeRole === null) return;

    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && pathname === "/login") {
      router.replace("/timetables");
      return;
    }

    if (isAuthenticated && user) {
      // Check if current active role is User
      const isCurrentRoleUser = activeRole === UserRole.User;

      // If active role is User, prevent access to admin routes
      if (
        isCurrentRoleUser &&
        adminRoutes.some((route) => pathname.startsWith(route))
      ) {
        router.replace("/timetables");
        return;
      }

      // If not admin and is user, only allow user routes
      const isAdmin = user.roles.includes(UserRole.Admin);
      const isUser = user.roles.includes(UserRole.User);
      if (!isAdmin && isUser) {
        if (!allowedRoutes.some((route) => pathname.startsWith(route))) {
          router.replace("/timetables");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router, pathname, loading, user, activeRole]);

  if (loading || activeRole === null) {
    return null;
  }

  if (pathname === "/login") {
    return children;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (user) {
    const isCurrentRoleUser = activeRole === UserRole.User;

    // Block admin routes if current role is User
    if (
      isCurrentRoleUser &&
      adminRoutes.some((route) => pathname.startsWith(route))
    ) {
      return null;
    }

    const isAdmin = user.roles.includes(UserRole.Admin);
    const isUser = user.roles.includes(UserRole.User);
    if (
      !isAdmin &&
      isUser &&
      !allowedRoutes.some((route) => pathname.startsWith(route))
    ) {
      return null;
    }
  }
  return children;
}
