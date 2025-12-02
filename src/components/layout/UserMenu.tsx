"use client";

import React, { useState } from "react";
import { Dropdown, Avatar as AntAvatar } from "antd";
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { cn } from "@/design-system/utilities";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => {
        // TODO: Navigate to profile page
        console.log("Navigate to profile");
        setOpen(false);
      },
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => {
        // TODO: Navigate to settings page
        console.log("Navigate to settings");
        setOpen(false);
      },
    },
    {
      type: "divider" as const,
      key: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: () => {
        logout();
        setOpen(false);
      },
      danger: true,
    },
  ];

  const dropdownContent = (
    <div className="w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
      {/* User Info Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map((item) => {
          if (item.type === "divider") {
            return (
              <div key={item.key} className="my-1 border-t border-gray-100" />
            );
          }

          return (
            <button
              key={item.key}
              onClick={item.onClick}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <button
        className={cn(
          "flex items-center gap-2 p-1 rounded-lg transition-colors",
          "hover:bg-gray-100",
          open && "bg-gray-100"
        )}
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 leading-tight">
            {user.name.split(" ").slice(-1)[0]}
          </p>
        </div>
      </button>
    </Dropdown>
  );
}
