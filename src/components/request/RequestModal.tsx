"use client";

import { useState } from "react";
import { Modal, Form, Input, Select, Button, Space, message } from "antd";
import { useRequestsStore } from "@/stores/useRequestsStore";
import { RequestCategory, RequestPriority } from "@/types/request";

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RequestModal({
  isOpen,
  onClose,
  onSuccess,
}: RequestModalProps) {
  const [form] = Form.useForm();
  const { createRequest, loading } = useRequestsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: Record<string, string>) => {
    try {
      setIsSubmitting(true);
      await createRequest({
        title: values.title,
        description: values.description,
        category:
          values.category as unknown as (typeof RequestCategory)[keyof typeof RequestCategory],
        priority: (values.priority ||
          RequestPriority.Medium) as unknown as (typeof RequestPriority)[keyof typeof RequestPriority],
      });
      message.success("Yêu cầu đã được gửi thành công");
      form.resetFields();
      onClose();
      onSuccess?.();
    } catch {
      message.error("Không thể gửi yêu cầu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Gửi Yêu Cầu"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[
            { required: true, message: "Vui lòng nhập tiêu đề" },
            { min: 5, message: "Tiêu đề phải có ít nhất 5 ký tự" },
          ]}
        >
          <Input placeholder="Nhập tiêu đề yêu cầu" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả" },
            { min: 10, message: "Mô tả phải có ít nhất 10 ký tự" },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="Mô tả chi tiết yêu cầu của bạn"
          />
        </Form.Item>

        <Form.Item
          label="Danh mục"
          name="category"
          rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
        >
          <Select placeholder="Chọn danh mục">
            <Select.Option value={RequestCategory.Documents}>
              {RequestCategory.Documents}
            </Select.Option>
            <Select.Option value={RequestCategory.Room}>
              {RequestCategory.Room}
            </Select.Option>
            <Select.Option value={RequestCategory.Timetable}>
              {RequestCategory.Timetable}
            </Select.Option>
            <Select.Option value={RequestCategory.Other}>
              {RequestCategory.Other}
            </Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Mức độ ưu tiên"
          name="priority"
          initialValue={RequestPriority.Medium}
        >
          <Select>
            <Select.Option value={RequestPriority.Low}>
              {RequestPriority.Low}
            </Select.Option>
            <Select.Option value={RequestPriority.Medium}>
              {RequestPriority.Medium}
            </Select.Option>
            <Select.Option value={RequestPriority.High}>
              {RequestPriority.High}
            </Select.Option>
          </Select>
        </Form.Item>

        <Space style={{ width: "100%" }} className="justify-end">
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting || loading}
          >
            Gửi Yêu Cầu
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}
