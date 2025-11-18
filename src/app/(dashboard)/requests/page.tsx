"use client";

import { useState } from "react";
import { Button, Card } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { RequestModal } from "@/components/request/RequestModal";
import { MyRequestsList } from "@/components/request/MyRequestsList";

export default function RequestsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRequestSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Yêu Cầu Của Tôi</h1>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Gửi Yêu Cầu
        </Button>
      </div>

      <Card>
        <MyRequestsList key={refreshTrigger} />
      </Card>

      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRequestSuccess}
      />
    </div>
  );
}
