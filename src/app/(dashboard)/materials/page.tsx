import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import MaterialsClient from "./MaterialsClient";
import { fetchMaterialsSSR } from "@/lib/api";

export default async function MaterialsPage() {
  // Fetch initial data on server
  const initialMaterials = await fetchMaterialsSSR();

  return (
    <Suspense fallback={<LoadingSpinner tip="Đang tải vật tư..." />}>
      <MaterialsClient initialMaterials={initialMaterials} />
    </Suspense>
  );
}
