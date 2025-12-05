"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
import { brandColors } from "@/styles/theme";
import { cn } from "@/design-system/utilities";
import { colors } from "@/design-system/tokens";
import {
  CalendarOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  SettingOutlined,
  MenuOutlined,
  LeftOutlined,
  RightOutlined,
  SearchOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Input, Badge, Tooltip } from "antd";

type Props = {
  onClose?: () => void;
};

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badge?: number;
}

export default function ModernSidebar({ onClose }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize active role
  useEffect(() => {
    const stored = localStorage.getItem("activeRole");
    if (stored && user?.roles.includes(stored as UserRole)) {
      setActiveRole(stored as UserRole);
    } else if (user?.roles.length) {
      setActiveRole(user.roles[0]);
      localStorage.setItem("activeRole", user.roles[0]);
    }
  }, [user?.roles]);

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setCollapsed(savedState === "true");
    }
  }, []);

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  const allMenuItems: MenuItem[] = [
    {
      href: "/timetables",
      label: "Thời khóa biểu",
      icon: <CalendarOutlined className="text-lg" />,
      roles: [UserRole.User],
    },
    {
      href: "/admin/timetables",
      label: "Quản lý TKB",
      icon: <CalendarOutlined className="text-lg" />,
      roles: [UserRole.Admin],
    },
    {
      href: "/teaching-logs",
      label: "Nhật ký ca dạy",
      icon: <FileTextOutlined className="text-lg" />,
      roles: [UserRole.User],
    },
    {
      href: "/requests",
      label: "Yêu cầu của tôi",
      icon: <FileTextOutlined className="text-lg" />,
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
      href: "/users",
      label: "Giảng viên",
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
            d="M12 4a4 4 0 100 8 4 4 0 000-8zM16 20H8a2 2 0 01-2-2v-1a5 5 0 0110 0v1a2 2 0 01-2 2z"
          />
        </svg>
      ),
      roles: [UserRole.Admin],
    },
    {
      href: "/rooms",
      label: "Phòng thực hành",
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
            d="M3 21V8l9-5 9 5v13M9 21v-7h6v7"
          />
        </svg>
      ),
      roles: [UserRole.Admin],
    },
    {
      href: "/admin/requests",
      label: "Quản lý yêu cầu",
      icon: <UnorderedListOutlined className="text-lg" />,
      roles: [UserRole.Admin],
      badge: 3,
    },
  ];

  const currentRole = activeRole || user?.roles?.[0];
  const menuItems = currentRole
    ? allMenuItems.filter((item) => item.roles.includes(currentRole))
    : [];

  const filteredMenuItems = searchQuery
    ? menuItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menuItems;

  const isActive = (path: string) => pathname?.startsWith(path);

  const handleRoleSwitch = (role: UserRole) => {
    setActiveRole(role);
    localStorage.setItem("activeRole", role);
    if (role === UserRole.Admin) {
      router.push("/admin/timetables");
    } else {
      router.push("/timetables");
    }
  };

  return (
    <aside
      className={cn(
        "relative h-full flex flex-col bg-white shadow-xl transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64",
        "border-r border-gray-200"
      )}
    >
      {/* Header with Logo */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b border-gray-200",
          collapsed && "flex-col gap-2"
        )}
      >
        <div className={cn("flex items-center gap-3", collapsed && "flex-col")}>
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="ElecLab logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">ElecLab</h1>
              <p className="text-xs text-gray-500">Lab Management</p>
            </div>
          )}
        </div>

        {/* Collapse Toggle - Desktop only */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <RightOutlined className="text-gray-600" />
          ) : (
            <LeftOutlined className="text-gray-600" />
          )}
        </button>

        {/* Close button - Mobile only */}
        <button
          onClick={onClose}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100"
          aria-label="Close menu"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Search Bar - Only when expanded */}
      {!collapsed && (
        <div className="p-3 border-b border-gray-200">
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg"
            allowClear
          />
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const active = isActive(item.href);

          if (collapsed) {
            return (
              <Tooltip key={item.href} title={item.label} placement="right">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-center h-12 rounded-lg transition-all duration-200",
                    active
                      ? "bg-blue-50 text-blue-600 shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={onClose}
                >
                  <Badge count={item.badge} size="small" offset={[10, -5]}>
                    <span className="flex items-center justify-center">
                      {item.icon}
                    </span>
                  </Badge>
                </Link>
              </Tooltip>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                active
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
              onClick={onClose}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              <span className="flex-1 font-medium text-sm">{item.label}</span>
              {item.badge && <Badge count={item.badge} size="small" />}
              {active && (
                <div className="w-1 h-6 bg-blue-600 rounded-full absolute right-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Role Switcher - Only for dual-role users */}
      {user?.roles && user.roles.length > 1 && !collapsed && (
        <div className="px-3 py-2 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-500 mb-2 px-2">
            Chuyển vai trò
          </div>
          <div className="flex gap-2">
            {user.roles.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  activeRole === role
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {role === UserRole.Admin ? "Quản lý" : "Người dùng"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200">
        {collapsed ? (
          <Tooltip title="Đăng xuất" placement="right">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center h-12 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogoutOutlined className="text-lg" />
            </button>
          </Tooltip>
        ) : (
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <LogoutOutlined className="text-lg" />
            <span>Đăng xuất</span>
          </button>
        )}
      </div>
    </aside>
  );
}
