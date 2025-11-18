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
  Steps,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ReloadOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useMaterialRequestStore } from "@/stores/useMaterialRequestStore";
import {
  IMaterialRequest,
  MaterialRequestStatus,
} from "@/types/materialRequest";
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

export function MaterialRequestsManagementList() {
  const {
    requests,
    loading,
    fetchAllRequests,
    reviewRequest,
    handleRequest,
    completeRequest,
  } = useMaterialRequestStore();
  const [selectedRequest, setSelectedRequest] =
    useState<IMaterialRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    requestId: string | null;
    status: MaterialRequestStatus | null;
  }>({ open: false, requestId: null, status: null });
  const [handleModal, setHandleModal] = useState<{
    open: boolean;
    requestId: string | null;
  }>({ open: false, requestId: null });
  const [completeModal, setCompleteModal] = useState<{
    open: boolean;
    requestId: string | null;
  }>({ open: false, requestId: null });
  const [reviewForm] = Form.useForm();
  const [completeForm] = Form.useForm();
  const [reviewing, setReviewing] = useState(false);
  const [handling, setHandling] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const handleViewDetail = (record: IMaterialRequest) => {
    setSelectedRequest(record);
    setIsDrawerOpen(true);
  };

  const handleOpenReviewModal = (
    requestId: string,
    status: MaterialRequestStatus
  ) => {
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
        reviewNote: values.reviewNote || "",
      });
      message.success("Yêu cầu đã được duyệt thành công");
      setReviewModal({ open: false, requestId: null, status: null });
    } catch {
      message.error("Không thể duyệt yêu cầu");
    } finally {
      setReviewing(false);
    }
  };

  const handleOpenHandleModal = (requestId: string) => {
    setHandleModal({
      open: true,
      requestId,
    });
  };

  const handleSubmitHandle = async () => {
    if (!handleModal.requestId) return;

    setHandling(true);
    try {
      await handleRequest(handleModal.requestId, {
        status: "Đang xử lý" as MaterialRequestStatus,
      });
      message.success("Yêu cầu đã được cập nhật thành công");
      setHandleModal({ open: false, requestId: null });
    } catch {
      message.error("Không thể cập nhật yêu cầu");
    } finally {
      setHandling(false);
    }
  };

  const handleOpenCompleteModal = (requestId: string) => {
    setCompleteModal({
      open: true,
      requestId,
    });
    completeForm.resetFields();
  };

  const handleSubmitComplete = async (values: Record<string, string>) => {
    if (!completeModal.requestId) return;

    setCompleting(true);
    try {
      await completeRequest(completeModal.requestId, {
        completionNote: values.completionNote || "",
      });
      message.success("Yêu cầu đã được hoàn thành");
      setCompleteModal({ open: false, requestId: null });
    } catch {
      message.error("Không thể hoàn thành yêu cầu");
    } finally {
      setCompleting(false);
    }
  };

  const columns = [
    {
      title: "Người Gửi",
      dataIndex: ["requester", "name"],
      key: "requester",
      width: 150,
      render: (text: string, record: IMaterialRequest) => (
        <div>
          <div>{record.requester.name}</div>
          <div className="text-xs text-gray-500">{record.requester.email}</div>
        </div>
      ),
    },
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
      width: 150,
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
      title: "Ngày Gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành Động",
      key: "actions",
      width: 240,
      render: (_: Record<string, unknown>, record: IMaterialRequest) => (
        <Space size="small" wrap>
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
                  handleOpenReviewModal(
                    record._id,
                    MaterialRequestStatus.Approved
                  )
                }
              >
                Duyệt
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() =>
                  handleOpenReviewModal(
                    record._id,
                    MaterialRequestStatus.Rejected
                  )
                }
              >
                Từ chối
              </Button>
            </>
          )}
          {record.status === "Chấp thuận" && (
            <Button
              type="primary"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleOpenHandleModal(record._id)}
            >
              Xử lý
            </Button>
          )}
          {record.status === "Đang xử lý" && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleOpenCompleteModal(record._id)}
            >
              Hoàn thành
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Quản Lý Yêu Cầu Vật Tư</h2>
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
            scroll={{ x: 1400 }}
          />
        )}
      </Spin>

      <Drawer
        title="Chi Tiết Yêu Cầu"
        placement="right"
        onClose={() => setIsDrawerOpen(false)}
        open={isDrawerOpen}
        width={600}
      >
        {selectedRequest && (
          <div>
            <Steps
              current={
                {
                  "Chờ duyệt": 0,
                  "Chấp thuận": 1,
                  "Từ chối": -1,
                  "Đang xử lý": 2,
                  "Hoàn thành": 3,
                }[selectedRequest.status] || 0
              }
              items={[
                { title: "Chờ duyệt", description: "Gửi yêu cầu" },
                { title: "Chấp thuận", description: "Được duyệt" },
                { title: "Xử lý", description: "Đang xử lý" },
                { title: "Hoàn thành", description: "Xong" },
              ]}
              className="mb-6"
            />

            <Descriptions column={1} bordered className="mb-6">
              <Descriptions.Item label="Người Gửi">
                {selectedRequest.requester.name} (
                {selectedRequest.requester.email})
              </Descriptions.Item>
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
            </Descriptions>

            <h4 className="font-semibold mb-2">Vật Tư Yêu Cầu:</h4>
            <Table
              columns={[
                { title: "Vật Tư", dataIndex: ["material", "name"] },
                { title: "Số Lượng", dataIndex: "quantity" },
                { title: "Lý Do", dataIndex: "reason" },
              ]}
              dataSource={selectedRequest.materials}
              pagination={false}
              rowKey={(_, index) => index?.toString() ?? ""}
              size="small"
              className="mb-6"
            />

            {selectedRequest.reviewedAt && (
              <Descriptions column={1} bordered className="mb-6">
                <Descriptions.Item label="Duyệt Bởi">
                  {selectedRequest.reviewedBy?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày Duyệt">
                  {dayjs(selectedRequest.reviewedAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                {selectedRequest.reviewNote && (
                  <Descriptions.Item label="Ghi Chú">
                    {selectedRequest.reviewNote}
                  </Descriptions.Item>
                )}
              </Descriptions>
            )}

            {selectedRequest.completedAt && (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Hoàn Thành Bởi">
                  {selectedRequest.completedBy?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày Hoàn Thành">
                  {dayjs(selectedRequest.completedAt).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Descriptions.Item>
                {selectedRequest.completionNote && (
                  <Descriptions.Item label="Ghi Chú">
                    {selectedRequest.completionNote}
                  </Descriptions.Item>
                )}
              </Descriptions>
            )}
          </div>
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
            label="Ghi Chú"
            name="reviewNote"
            rules={[{ min: 5, message: "Ghi chú phải có ít nhất 5 ký tự" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú (không bắt buộc)"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xử Lý Yêu Cầu"
        open={handleModal.open}
        onCancel={() => setHandleModal({ open: false, requestId: null })}
        onOk={handleSubmitHandle}
        confirmLoading={handling}
      >
        <p>Bạn chắc chắn muốn bắt đầu xử lý yêu cầu này?</p>
      </Modal>

      <Modal
        title="Hoàn Thành Yêu Cầu"
        open={completeModal.open}
        onCancel={() => setCompleteModal({ open: false, requestId: null })}
        onOk={() => completeForm.submit()}
        confirmLoading={completing}
      >
        <Form
          form={completeForm}
          layout="vertical"
          onFinish={handleSubmitComplete}
        >
          <Form.Item
            label="Ghi Chú Hoàn Thành"
            name="completionNote"
            rules={[{ min: 5, message: "Ghi chú phải có ít nhất 5 ký tự" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập ghi chú hoàn thành" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
