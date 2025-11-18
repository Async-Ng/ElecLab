import { Card } from "antd";
import { MaterialRequestsManagementList } from "@/components/materialRequest/MaterialRequestsManagementList";

export const metadata = {
  title: "Quản Lý Yêu Cầu Vật Tư",
};

export default function AdminMaterialRequestsPage() {
  return (
    <Card>
      <MaterialRequestsManagementList />
    </Card>
  );
}
