"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HomeOutlined } from "@ant-design/icons";
import { cn } from "@/design-system/utilities";

interface BreadcrumbItem {
  title: string;
  href?: string;
}

const routeMap: Record<string, string> = {
  timetables: "Thời khóa biểu",
  "admin-timetables": "Quản lý TKB",
  "teaching-logs": "Nhật ký ca dạy",
  requests: "Yêu cầu",
  materials: "Vật tư",
  users: "Giảng viên",
  rooms: "Phòng thực hành",
  admin: "Quản trị",
  "material-requests": "Yêu cầu vật tư",
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname || pathname === "/") {
      return [{ title: "Trang chủ" }];
    }

    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ title: "Trang chủ", href: "/" }];

    let currentPath = "";
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;

      breadcrumbs.push({
        title:
          routeMap[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-gray-400 mx-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}

              {index === 0 ? (
                <Link
                  href="/"
                  className={cn(
                    "flex items-center gap-1 text-sm transition-colors",
                    isLast
                      ? "text-gray-900 font-medium"
                      : "text-gray-600 hover:text-blue-600"
                  )}
                >
                  <HomeOutlined />
                </Link>
              ) : item.href ? (
                <Link
                  href={item.href}
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {item.title}
                </Link>
              ) : (
                <span className="text-sm text-gray-900 font-medium">
                  {item.title}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
