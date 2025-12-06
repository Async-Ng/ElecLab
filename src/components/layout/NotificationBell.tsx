"use client";

import React, { useState } from "react";
import { Badge, Dropdown, Empty, Button as AntButton } from "antd";
import { BellOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import { cn } from "@/design-system/utilities";
import { colors } from "@/design-system/tokens";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

// Mock notifications - Replace with real data
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Yêu cầu mới",
    message: "Bạn có 1 yêu cầu vật tư mới cần xử lý",
    time: "5 phút trước",
    read: false,
    type: "info",
  },
  {
    id: "2",
    title: "Yêu cầu được duyệt",
    message: "Yêu cầu #1234 đã được phê duyệt",
    time: "1 giờ trước",
    read: false,
    type: "success",
  },
  {
    id: "3",
    title: "Nhắc nhở",
    message: "Bạn có lớp học vào lúc 14:00 hôm nay",
    time: "2 giờ trước",
    read: true,
    type: "warning",
  },
];

export default function NotificationBell() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-700";
      case "warning":
        return "bg-amber-100 text-amber-700";
      case "error":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "✓";
      case "warning":
        return "⚠";
      case "error":
        return "✕";
      default:
        return "ℹ";
    }
  };

  const dropdownContent = (
    <div className="w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Thông báo</h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Đánh dấu đã đọc
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12">
            <Empty
              description="Không có thông báo"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 transition-colors hover:bg-gray-50",
                  !notification.read && "bg-blue-50/50"
                )}
              >
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
                      getTypeColor(notification.type)
                    )}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={cn(
                          "text-sm font-medium",
                          notification.read ? "text-gray-700" : "text-gray-900"
                        )}
                      >
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {notification.time}
                      </span>
                      <div className="flex gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            <CheckOutlined />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleClearAll}
            className="w-full text-center text-sm text-red-600 hover:text-red-700 font-medium py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      menu={{ items: [] }}
      popupRender={() => dropdownContent}
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <button
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          "hover:bg-gray-100",
          open && "bg-gray-100"
        )}
        aria-label="Notifications"
      >
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <BellOutlined className="text-xl text-gray-700" />
        </Badge>
      </button>
    </Dropdown>
  );
}
