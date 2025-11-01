import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import RoomsClient from "./RoomsClient";
import { fetchRoomsSSR } from "@/lib/api";

export default async function RoomsPage() {
  // Fetch initial data on server
  const data = await fetchRoomsSSR();
  const roomsData = Array.isArray(data.rooms) ? data.rooms : [];
  const usersData = Array.isArray(data.users) ? data.users : [];

  const roomsWithUsers = roomsData.map((room: any) => ({
    ...room,
    users_manage: Array.isArray(room.users_manage)
      ? room.users_manage.filter((u: any) => typeof u === "object")
      : [],
  }));

  return (
    <Suspense fallback={<LoadingSpinner tip="Đang tải danh sách phòng..." />}>
      <RoomsClient initialRooms={roomsWithUsers} initialUsers={usersData} />
    </Suspense>
  );
}
