"use client";

import { Card } from "antd";
import { MaterialRequestsManagementList } from "@/components/materialRequest/MaterialRequestsManagementList";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin, Empty } from "antd";

export default function AdminMaterialRequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.roles?.includes("Admin"))) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <Spin />;
  }

  if (!user || !user.roles?.includes("Admin")) {
    return <Empty description="Không được phép truy cập" />;
  }

  return (
    <Card>
      <MaterialRequestsManagementList />
    </Card>
  );
}
