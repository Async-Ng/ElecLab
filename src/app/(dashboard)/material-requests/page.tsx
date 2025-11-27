import { Card } from "antd";
import { MyMaterialRequestsList } from "@/components/materialRequest/MyMaterialRequestsList";

export const metadata = {
  title: "Yêu Cầu Vật Tư Của Tôi",
};

export default function MaterialRequestsPage() {
  return (
    <Card>
      <MyMaterialRequestsList />
    </Card>
  );
}
