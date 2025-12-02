"use client";

import React from "react";
import Breadcrumbs from "./Breadcrumbs";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";
import { MenuOutlined } from "@ant-design/icons";
import { cn } from "@/design-system/utilities";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Mobile Menu Button + Breadcrumbs */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <MenuOutlined className="text-xl text-gray-700" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden sm:block">
            <Breadcrumbs />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
