"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/user";

type Props = {
  onClose?: () => void;
};

export default function Sidebar({ onClose }: Props) {
  const { user, logout } = useAuth();
  // Định nghĩa các menu item với quyền truy cập
  const allMenuItems: Array<{
    href: string;
    label: string;
    icon: React.ReactNode;
    roles: UserRole[];
  }> = [
    {
      href: `/timetables/${user?._id}`,
      label: "TKB của tôi",
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
      roles: [UserRole.Head_of_deparment, UserRole.Lecture],
    },
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
      roles: [UserRole.Head_of_deparment],
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
      roles: [UserRole.Lecture],
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
      roles: [UserRole.Head_of_deparment],
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
      roles: [UserRole.Head_of_deparment],
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
      roles: [UserRole.Head_of_deparment],
    },
  ];

  // Lọc menu theo role (sau khi lấy user)

  let menuItems: typeof allMenuItems = [];
  if (user?.roles?.includes(UserRole.Head_of_deparment)) {
    // Trưởng bộ môn: thấy toàn bộ
    menuItems = allMenuItems;
  } else if (user?.roles?.includes(UserRole.Lecture)) {
    // Giảng viên: chỉ thấy các mục cho phép
    menuItems = allMenuItems.filter((item) =>
      item.roles.includes(UserRole.Lecture)
    );
  } else {
    // Nếu chưa đăng nhập hoặc không có roles hợp lệ, hiển thị toàn bộ (hoặc tuỳ chỉnh: có thể để [] nếu muốn ẩn hết)
    menuItems = allMenuItems;
  }

  const pathname = usePathname();
  const isActive = (path: string) => pathname?.startsWith(path);

  return (
    <aside className="relative h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 shadow-lg w-full md:w-64 p-0">
      {/* Close button for mobile */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded bg-slate-800/60 md:hidden"
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

      <div className="flex flex-col items-center py-8 gap-2 border-b border-slate-800">
        <Image
          src="/images/logo.png"
          alt="ElecLab logo"
          className="object-contain rounded-md bg-white/10 p-4 shadow"
          width={200}
          height={200}
        />
        <h1 className="text-xl font-bold tracking-wide mt-2">ElecLab</h1>
        <div className="mt-4 mb-2 text-center">
          <p className="text-base font-semibold text-white mt-1">
            {user?.name}
          </p>
          <p className="text-xs text-slate-400">
            {user?.roles
              .map((role) => UserRole[role as keyof typeof UserRole] || role)
              .join(", ")}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors font-medium text-base ${
                  isActive(item.href)
                    ? "bg-slate-700 text-white shadow"
                    : "hover:bg-slate-800 text-slate-300"
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

      <div className="mt-auto border-t border-slate-800 px-6 py-6 bg-slate-900/80">
        <button
          onClick={logout}
          className="w-full text-sm bg-slate-800 border border-slate-700 rounded px-3 py-2 hover:bg-slate-700 transition-colors font-semibold"
        >
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
