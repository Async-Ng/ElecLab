import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import TimetablesClient from "./TimetablesClient";
import { fetchTimetablesSSR } from "@/lib/api";

export default async function TimetablePage() {
  // Fetch initial data on server
  const initialData = await fetchTimetablesSSR();

  return (
    <Suspense fallback={<LoadingSpinner tip="Đang tải thời khóa biểu..." />}>
      <TimetablesClient initialData={initialData} />
    </Suspense>
  );
}
