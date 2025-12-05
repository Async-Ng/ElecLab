"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
import { cn } from "@/design-system/utilities";
import {
  CalendarOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { Badge } from "antd";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badge?: number;
}

export default function MobileBottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  const allNavItems: NavItem[] = [
    {
      href: "/timetables",
      label: "TKB",
      icon: <CalendarOutlined className="text-xl" />,
      roles: [UserRole.User],
    },
    {
      href: "/admin/timetables",
      label: "TKB",
      icon: <CalendarOutlined className="text-xl" />,
      roles: [UserRole.Admin],
    },
    {
      href: "/teaching-logs",
      label: "Nhật ký",
      icon: <FileTextOutlined className="text-xl" />,
      roles: [UserRole.User],
    },
    {
      href: "/requests",
      label: "Yêu cầu",
      icon: <FileTextOutlined className="text-xl" />,
      roles: [UserRole.User],
    },
    {
      href: "/materials",
      label: "Vật tư",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7h18M3 12h18M3 17h18"
          />
        </svg>
      ),
      roles: [UserRole.Admin],
    },
    {
      href: "/admin/requests",
      label: "Quản lý",
      icon: <UnorderedListOutlined className="text-xl" />,
      roles: [UserRole.Admin],
      badge: 3,
    },
  ];

  const activeRole = user?.roles?.[0];
  const navItems = activeRole
    ? allNavItems.filter((item) => item.roles.includes(activeRole)).slice(0, 4)
    : [];

  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                active
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Badge count={item.badge} size="small" offset={[8, -4]}>
                <span className="flex items-center justify-center">
                  {item.icon}
                </span>
              </Badge>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
