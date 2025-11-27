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
import { DeleteOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useRequestsStore } from "@/stores/useRequestsStore";
import { IRequest } from "@/types/request";
import dayjs from "dayjs";

const statusColors: Record<string, string> = {
  "Chờ duyệt": "processing",
  "Chấp thuận": "success",
  "Từ chối": "error",
};

const priorityColors: Record<string, string> = {
  Thấp: "blue",
  "Trung bình": "orange",
  Cao: "red",
};

export function MyRequestsList() {
  const { requests, loading, fetchMyRequests, deleteRequest } =
    useRequestsStore();
  const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

  const handleViewDetail = (record: IRequest) => {
    setSelectedRequest(record);
    setIsDrawerOpen(true);
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 120,
    },
    {
      title: "Mức độ ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      render: (priority: string) => (
        <Tag color={priorityColors[priority]}>{priority}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={statusColors[status]}>{status}</Tag>
      ),
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      render: (_: Record<string, unknown>, record: IRequest) => (
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
        <h2 className="text-xl font-semibold">Danh Sách Yêu Cầu Của Tôi</h2>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchMyRequests()}
          loading={loading}
        >
          Làm mới
        </Button>
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
            <Descriptions.Item label="Tiêu đề">
              {selectedRequest.title}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {selectedRequest.description}
            </Descriptions.Item>
            <Descriptions.Item label="Danh mục">
              {selectedRequest.category}
            </Descriptions.Item>
            <Descriptions.Item label="Mức độ ưu tiên">
              <Tag color={priorityColors[selectedRequest.priority]}>
                {selectedRequest.priority}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={statusColors[selectedRequest.status]}>
                {selectedRequest.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày gửi">
              {dayjs(selectedRequest.createdAt).format("DD/MM/YYYY HH:mm")}
            </Descriptions.Item>
            {selectedRequest.reviewedAt && (
              <Descriptions.Item label="Ngày duyệt">
                {dayjs(selectedRequest.reviewedAt).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
            )}
            {selectedRequest.reviewedBy && (
              <Descriptions.Item label="Được duyệt bởi">
                {selectedRequest.reviewedBy.name}
              </Descriptions.Item>
            )}
            {selectedRequest.adminNote && (
              <Descriptions.Item label="Ghi chú">
                {selectedRequest.adminNote}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </>
  );
}
