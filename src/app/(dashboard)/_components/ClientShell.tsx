"use client";

import React from "react";
import Sidebar from "./Sidebar";
import { Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { brandColors } from "@/styles/theme";

export default function ClientShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar wrapper: full-screen overlay on mobile, static on md+ */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-full md:w-64 md:static transform transition-transform duration-200 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Mobile header with menu button */}
        <header
          className="md:hidden sticky top-0 z-20 bg-white shadow-sm px-4 py-3 flex items-center justify-between"
          style={{ borderBottom: `2px solid ${brandColors.primary}` }}
        >
          <h1
            className="text-lg font-bold"
            style={{ color: brandColors.primary }}
          >
            ElecLab
          </h1>
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={() => setOpen(true)}
            size="large"
          >
            Menu
          </Button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
