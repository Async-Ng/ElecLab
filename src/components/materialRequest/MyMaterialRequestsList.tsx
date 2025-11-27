"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Empty,
  Spin,
  Popconfirm,
  message,
  Drawer,
  Descriptions,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMaterialRequestStore } from "@/stores/useMaterialRequestStore";
import { IMaterialRequest } from "@/types/materialRequest";
import { CreateMaterialRequestModal } from "./CreateMaterialRequestModal";
import dayjs from "dayjs";

const statusColors: Record<string, string> = {
  "Chờ duyệt": "processing",
  "Chấp thuận": "success",
  "Từ chối": "error",
  "Đang xử lý": "orange",
  "Hoàn thành": "blue",
};

const priorityColors: Record<string, string> = {
  Thấp: "blue",
  "Trung bình": "orange",
  Cao: "red",
};

export function MyMaterialRequestsList() {
  const { requests, loading, fetchMyRequests, deleteRequest } =
    useMaterialRequestStore();
  const [selectedRequest, setSelectedRequest] =
    useState<IMaterialRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteRequest(id);
      message.success("Yêu cầu đã được xóa");
    } catch {
      message.error("Không thể xóa yêu cầu");
    } finally {
      setDeleting(null);
    }
  };

  const handleViewDetail = (record: IMaterialRequest) => {
    setSelectedRequest(record);
    setIsDrawerOpen(true);
  };

  const columns = [
    {
      title: "Loại",
      dataIndex: "requestType",
      key: "requestType",
      width: 100,
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Ưu Tiên",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority: string) => (
        <Tag color={priorityColors[priority]}>{priority}</Tag>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{status}</Tag>
      ),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành Động",
      key: "actions",
      width: 120,
      render: (_: Record<string, unknown>, record: IMaterialRequest) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            title="Xem chi tiết"
          />
          <Popconfirm
            title="Xóa yêu cầu"
            description="Bạn chắc chắn muốn xóa yêu cầu này?"
            onConfirm={() => handleDelete(record._id)}
            disabled={record.status !== "Chờ duyệt" || deleting === record._id}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={
                record.status !== "Chờ duyệt" || deleting === record._id
              }
              loading={deleting === record._id}
              title="Xóa yêu cầu"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Yêu Cầu Vật Tư Của Tôi</h2>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowModal(true)}
          >
            Tạo Yêu Cầu
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchMyRequests()}
            loading={loading}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        {requests.length === 0 ? (
          <Empty
            description="Chưa có yêu cầu nào"
            style={{ marginTop: 50, marginBottom: 50 }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={requests}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            size="small"
            scroll={{ x: 1000 }}
          />
        )}
      </Spin>

      <Drawer
        title="Chi Tiết Yêu Cầu"
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={500}
      >
        {selectedRequest && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Loại Yêu Cầu">
              {selectedRequest.requestType}
            </Descriptions.Item>
            <Descriptions.Item label="Mô Tả">
              {selectedRequest.description}
            </Descriptions.Item>
            {selectedRequest.room && (
              <Descriptions.Item label="Phòng">
                {selectedRequest.room.name} ({selectedRequest.room.room_id})
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ưu Tiên">
              <Tag color={priorityColors[selectedRequest.priority]}>
                {selectedRequest.priority}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">
              <Tag color={statusColors[selectedRequest.status]}>
                {selectedRequest.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Vật Tư">
              {selectedRequest.materials.map((m, i) => (
                <div key={i}>
                  {m.material.name} x {m.quantity} ({m.reason})
                </div>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Tạo">
              {dayjs(selectedRequest.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            {selectedRequest.reviewedAt && (
              <Descriptions.Item label="Ngày Duyệt">
                {dayjs(selectedRequest.reviewedAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            )}
            {selectedRequest.reviewedBy && (
              <Descriptions.Item label="Được Duyệt Bởi">
                {selectedRequest.reviewedBy.name}
              </Descriptions.Item>
            )}
            {selectedRequest.reviewNote && (
              <Descriptions.Item label="Ghi Chú">
                {selectedRequest.reviewNote}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>

      <CreateMaterialRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        materials={[]}
        rooms={[]}
        onSuccess={() => {
          setShowModal(false);
          fetchMyRequests();
        }}
      />
    </>
  );
}
