"use client";

import React from "react";
import Sidebar from "./Sidebar";

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
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
