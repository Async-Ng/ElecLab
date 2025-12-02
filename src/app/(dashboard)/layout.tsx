import React from "react";
import ClientShell from "./_components/ClientShell";
import PrivateRoute from "@/components/PrivateRoute";

/**
 * Dashboard Layout - Single Source of Truth
 *
 * This layout wraps ALL dashboard pages (/timetables, /materials, /users, etc.)
 *
 * Architecture:
 * 1. PrivateRoute - Ensures user is authenticated
 * 2. ClientShell - Renders Sidebar + Header + Content Area
 * 3. children - Individual page content
 *
 * IMPORTANT RULES:
 * - Pages should NEVER import ModernSidebar or Header directly
 * - Pages should NEVER add their own wrapping divs for layout
 * - Pages should focus ONLY on their content (tables, forms, cards)
 * - Use PageHeader component at the top of each page for consistency
 *
 * Content Structure for Pages:
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <>
 *       <PageHeader
 *         title="Page Title"
 *         description="Simple description"
 *         extra={<Button>Action</Button>}
 *       />
 *       <Card>Your content here</Card>
 *     </>
 *   );
 * }
 * ```
 */
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PrivateRoute>
      <ClientShell>{children}</ClientShell>
    </PrivateRoute>
  );
}
