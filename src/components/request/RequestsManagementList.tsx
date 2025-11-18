"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  message,
  Drawer,
  Descriptions,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useRequestsStore } from "@/stores/useRequestsStore";
import { IRequest, RequestStatus } from "@/types/request";
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

export function RequestsManagementList() {
  const { requests, loading, fetchAllRequests, reviewRequest } =
    useRequestsStore();
  const [selectedRequest, setSelectedRequest] = useState<IRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    requestId: string | null;
    status: RequestStatus | null;
  }>({
    open: false,
    requestId: null,
    status: null,
  });
  const [reviewForm] = Form.useForm();
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const handleViewDetail = (record: IRequest) => {
    setSelectedRequest(record);
    setIsDrawerOpen(true);
  };

  const handleOpenReviewModal = (requestId: string, status: RequestStatus) => {
    setReviewModal({
      open: true,
      requestId,
      status,
    });
    reviewForm.resetFields();
  };

  const handleSubmitReview = async (values: Record<string, string>) => {
    if (!reviewModal.requestId || !reviewModal.status) return;

    setReviewing(true);
    try {
      await reviewRequest(reviewModal.requestId, {
        status: reviewModal.status,
        adminNote: values.adminNote || "",
      });
      message.success("Yêu cầu đã được duyệt thành công");
      setReviewModal({ open: false, requestId: null, status: null });
    } catch {
      message.error("Không thể duyệt yêu cầu");
    } finally {
      setReviewing(false);
    }
  };

  const columns = [
    {
      title: "Người gửi",
      dataIndex: ["user", "name"],
      key: "user",
      width: 150,
      render: (text: string, record: IRequest) => (
        <div>
          <div>{record.user.name}</div>
          <div className="text-xs text-gray-500">{record.user.email}</div>
        </div>
      ),
    },
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
      width: 180,
      render: (_: Record<string, unknown>, record: IRequest) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            title="Xem chi tiết"
          />
          {record.status === "Chờ duyệt" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() =>
                  handleOpenReviewModal(record._id, RequestStatus.Approved)
                }
                title="Chấp thuận"
              >
                Duyệt
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() =>
                  handleOpenReviewModal(record._id, RequestStatus.Rejected)
                }
                title="Từ chối"
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quản Lý Yêu Cầu</h2>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchAllRequests()}
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
            scroll={{ x: 1200 }}
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
            <Descriptions.Item label="Người gửi">
              {selectedRequest.user.name} ({selectedRequest.user.email})
            </Descriptions.Item>
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

      <Modal
        title={`${
          reviewModal.status === "Chấp thuận" ? "Chấp thuận" : "Từ chối"
        } Yêu Cầu`}
        open={reviewModal.open}
        onCancel={() =>
          setReviewModal({ open: false, requestId: null, status: null })
        }
        onOk={() => reviewForm.submit()}
        confirmLoading={reviewing}
      >
        <Form form={reviewForm} layout="vertical" onFinish={handleSubmitReview}>
          <Form.Item
            label="Ghi chú"
            name="adminNote"
            rules={[{ min: 5, message: "Ghi chú phải có ít nhất 5 ký tự" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú (không bắt buộc)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
