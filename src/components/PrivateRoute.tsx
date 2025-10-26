"use client";

import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
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

  // Array các route cho phép giảng viên truy cập
  const allowedRoutes = user
    ? [`/timetables/${user._id}`, "/teaching-logs"]
    : ["/teaching-logs"];

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated && pathname !== "/login") {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && pathname === "/login") {
      router.replace(user ? `/timetables/${user._id}` : "/login");
      return;
    }

    if (isAuthenticated && user) {
      const isAdmin = user.roles.includes(UserRole.Admin);
      const isUser = user.roles.includes(UserRole.User);
      if (!isAdmin && isUser) {
        if (!allowedRoutes.some((route) => pathname.startsWith(route))) {
          router.replace(`/timetables/${user._id}`);
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
