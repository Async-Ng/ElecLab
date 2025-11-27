"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spin, Empty } from "antd";
import { Card } from "antd";
import { RequestsManagementList } from "@/components/request/RequestsManagementList";

export default function AdminRequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !user.roles?.includes("Admin"))) {
      router.push("/timetables");
    }
  }, [user, loading, router]);

  if (loading) {
    return <Spin />;
  }

  if (!user || !user.roles?.includes("Admin")) {
    return <Empty description="Không được phép truy cập" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quản Lý Yêu Cầu</h1>

      <Card>
        <RequestsManagementList />
      </Card>
    </div>
  );
}
