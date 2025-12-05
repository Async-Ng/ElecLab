"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { UnifiedRequestModal } from "@/components/requests";
import { MyRequestsList } from "@/components/requests/MyRequestsList";

export default function RequestsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRequestSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Yêu Cầu Của Tôi</h1>
        <Button onClick={() => setIsModalOpen(true)} size="lg">
          Tạo Yêu Cầu
        </Button>
      </div>

      <Card>
        <MyRequestsList
          key={refreshTrigger}
          onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </Card>

      <UnifiedRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRequestSuccess}
      />
    </div>
  );
}
