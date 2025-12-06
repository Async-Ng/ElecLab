"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      router.replace("/timetables");
    }
  }, [isAuthenticated, router]);
  // Không render gì ở trang chủ, chỉ chuyển hướng
  return null;
}
