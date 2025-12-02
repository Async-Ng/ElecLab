"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";
import { brandColors } from "@/styles/theme";
import Select from "@/components/ui/Select";
import { FileTextOutlined, UnorderedListOutlined } from "@ant-design/icons";

type Props = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);

  // Initialize active role from localStorage or default to first role
  useEffect(() => {
    const stored = localStorage.getItem("activeRole");
    if (stored && user?.roles.includes(stored as UserRole)) {
      setActiveRole(stored as UserRole);
    } else if (user?.roles.length) {
      setActiveRole(user.roles[0]);
      localStorage.setItem("activeRole", user.roles[0]);
    }
  }, [user?.roles]);
  // Định nghĩa các menu item với quyền truy cập
  const allMenuItems: Array<{
    href: string;
    label: string;
    icon: React.ReactNode;
    roles: UserRole[];
  }> = [
    {
      href: "/timetables",
      label: "Thời khóa biểu",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 2v4M8 2v4"
          />
        </svg>
      ),
      roles: [UserRole.User],
    },

    {
      href: "/admin-timetables",
      label: "Quản lý TKB",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 2v4M8 2v4M3 10h18"
          />
        </svg>
      ),
      roles: [UserRole.Admin],
    },

    {
      href: "/teaching-logs",
      label: "Nhật ký ca dạy",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 2v4M16 2v4"
          />
          <circle cx="12" cy="14" r="3" />
        </svg>
      ),
      roles: [UserRole.User],
    },

    {
      href: "/requests",
      label: "Yêu cầu của tôi",
      icon: <FileTextOutlined className="w-5 h-5" />,
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
      icon: <UnorderedListOutlined className="w-5 h-5" />,
      roles: [UserRole.Admin],
    },
  ];

  // Lọc menu theo role (sau khi lấy user)

  let menuItems: typeof allMenuItems = [];

  // If user has selected a specific role, use that; otherwise use their primary role
  const currentRole = activeRole || user?.roles?.[0];

  if (currentRole === UserRole.Admin) {
    // Quản lý: chỉ thấy admin items (items that have Admin in their roles)
    menuItems = allMenuItems.filter((item) =>
      item.roles.includes(UserRole.Admin)
    );
  } else if (currentRole === UserRole.User) {
    // Người dùng: chỉ thấy các mục cho phép User
    menuItems = allMenuItems.filter((item) =>
      item.roles.includes(UserRole.User)
    );
  } else {
    // Nếu chưa đăng nhập hoặc không có roles hợp lệ, hiển thị toàn bộ (hoặc tuỳ chỉnh: có thể để [] nếu muốn ẩn hết)
    menuItems = allMenuItems;
  }

  const pathname = usePathname();
  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <aside
      className="relative h-full flex flex-col text-white shadow-xl w-full md:w-64 p-0"
      style={{
        background: `linear-gradient(180deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
      }}
    >
      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded md:hidden"
        style={{ background: "rgba(255, 255, 255, 0.15)" }}
        aria-label="Đóng menu"
      >
        <svg
          className="w-5 h-5 text-white"
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

      <div
        className="flex flex-col items-center py-8 gap-2"
        style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.15)" }}
      >
        <div className="rounded-md bg-white p-4 shadow-lg">
          <Image
            src="/images/logo.png"
            alt="ElecLab logo"
            className="object-contain"
            width={200}
            height={200}
            priority
          />
        </div>
        <h1 className="text-xl font-bold tracking-wide mt-2">ElecLab</h1>
        <div className="mt-4 mb-2 text-center">
          <p className="text-base font-semibold text-white mt-1">
            {user?.name}
          </p>
          <p className="text-xs" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
            {user?.roles
              .map((role) =>
                role === UserRole.Admin ? "Quản lý" : "Người dùng"
              )
              .join(", ")}
          </p>

          {/* Role switcher for dual-role users */}
          {user?.roles && user.roles.length > 1 && (
            <div className="mt-3">
              <Select
                value={activeRole}
                onChange={(value) => {
                  setActiveRole(value as UserRole);
                  localStorage.setItem("activeRole", value);
                  // Navigate to appropriate page based on role
                  if (value === UserRole.Admin) {
                    router.push("/admin-timetables");
                  } else {
                    router.push("/timetables");
                  }
                }}
                options={user.roles.map((role) => ({
                  label: role === UserRole.Admin ? "Quản lý" : "Người dùng",
                  value: role,
                }))}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all font-medium text-base ${
                  isActive(item.href)
                    ? "bg-white/20 text-white shadow-md"
                    : "hover:bg-white/10 text-white/90"
                }`}
                onClick={onClose}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className="mt-auto px-6 py-6"
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          background: "rgba(0, 0, 0, 0.15)",
        }}
      >
        <button
          onClick={logout}
          className="w-full text-sm rounded px-3 py-2 transition-all font-semibold"
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
          }}
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
