"use client";

import React from "react";
import NotificationBell from "./NotificationBell";
import UserMenu from "./UserMenu";
import { MenuOutlined } from "@ant-design/icons";
import { cn } from "@/design-system/utilities";

interface HeaderProps {
  /**
   * Callback function to open mobile sidebar drawer
   */
  onMenuClick?: () => void;
}

/**
 * Global Header Component
 *
 * Sticky header that appears on all dashboard pages.
 *
 * Features:
 * - Mobile menu button (triggers sidebar drawer)
 * - Notification bell with badge
 * - User menu with profile/settings/logout
 *
 * Note: Breadcrumbs are now handled by PageHeader component
 * for better consistency and control at the page level.
 */
export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile Menu Button + Branding Space */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Mobile Menu Button - Only visible on mobile/tablet */}
          <button
            onClick={onMenuClick}
            className={cn(
              "md:hidden",
              "flex items-center justify-center",
              "w-10 h-10 rounded-lg",
              "hover:bg-gray-100 active:bg-gray-200",
              "transition-colors duration-200"
            )}
            aria-label="Open navigation menu"
          >
            <MenuOutlined className="text-xl text-gray-700" />
          </button>

          {/* Spacer for alignment - breadcrumbs now in PageHeader */}
          <div className="hidden md:block text-sm text-gray-500 font-medium">
            {/* Could add global search or other utilities here */}
          </div>
        </div>

        {/* Right: Action Items */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <NotificationBell />

          {/* User Profile Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
