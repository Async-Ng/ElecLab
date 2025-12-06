"use client";

import React, { useState, useEffect } from "react";
import ModernSidebar from "@/components/layout/ModernSidebar";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { cn } from "@/design-system/utilities";

/**
 * ClientShell - Single Source of Truth for Dashboard Layout
 *
 * This component is the ONLY place where Sidebar and Header are rendered.
 * Individual pages should NEVER import these components directly.
 *
 * Features:
 * - Responsive sidebar (Mobile: Drawer overlay | Desktop: Fixed sidebar)
 * - Smooth state management for open/close/collapse
 * - Standardized content area with consistent spacing
 * - Mobile bottom navigation for quick access
 * - Gray background to highlight white content cards
 */
export default function ClientShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Mobile sidebar drawer state (true = open overlay)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on Escape key press
  useEffect(() => {
    function handleEscapeKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    }
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen flex bg-[#F3F4F6]">
      {/* Mobile Backdrop Overlay (darkens content when sidebar is open) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar Container
          Mobile: Fixed overlay that slides in from left
          Desktop: Static sidebar, always visible
      */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out",
          "md:static md:z-auto md:translate-x-0", // Desktop: always visible
          sidebarOpen ? "translate-x-0" : "-translate-x-full" // Mobile: slide animation
        )}
      >
        <ModernSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar (Sticky at top) */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content - Standardized Container
            This is where ALL page content lives.
            Pages should focus ONLY on their content, not layout.
        */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto" role="main">
          <div
            className={cn(
              "w-full max-w-[1920px] mx-auto", // Max width to prevent ultra-wide content
              "p-4 sm:p-6 lg:p-8", // Responsive padding (mobile: 16px, tablet: 24px, desktop: 32px)
              "pb-20 md:pb-8" // Extra bottom padding on mobile for bottom nav
            )}
          >
            {/* 
              Child pages render here.
              They receive consistent padding and background automatically.
              Pages should use white Cards/components on this gray background.
            */}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (hidden on desktop) */}
      <MobileBottomNav />
    </div>
  );
}
