import React from "react";
import ClientShell from "./_components/ClientShell";
import PrivateRoute from "@/components/PrivateRoute";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <PrivateRoute>
      <ClientShell>{children}</ClientShell>
    </PrivateRoute>
  );
}
