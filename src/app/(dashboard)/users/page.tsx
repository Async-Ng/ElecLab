import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import UsersClient from "./UsersClient";
import { fetchUsersSSR } from "@/lib/api";

export default async function UsersPage() {
  // Fetch initial data on server
  const initialUsers = await fetchUsersSSR();

  return (
    <Suspense
      fallback={<LoadingSpinner tip="Đang tải danh sách giảng viên..." />}
    >
      <UsersClient initialUsers={initialUsers} />
    </Suspense>
  );
}
