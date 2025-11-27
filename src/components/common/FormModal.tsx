import React, { useEffect } from "react";
import { Form, FormInstance, Row, Col } from "antd";
import BaseModal from "./BaseModal";

interface FormModalProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  onSubmit: () => void;
  loading?: boolean;
  form: FormInstance;
  children: React.ReactNode;
  width?: number;
  okText?: string;
  cancelText?: string;
  layout?: "horizontal" | "vertical" | "inline";
  twoColumns?: boolean;
  initialValues?: any; // Values to set when editing
  footer?: React.ReactNode; // Custom footer
}

export default function FormModal({
  open,
  title,
  onCancel,
  onSubmit,
  loading = false,
  form,
  children,
  width = 600,
  okText = "Lưu",
  cancelText = "Hủy",
  layout = "vertical",
  twoColumns = false,
  initialValues,
  footer,
}: FormModalProps) {
  // Set initial values when modal opens or initialValues changes
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  return (
    <BaseModal
      open={open}
      title={title}
      onOk={onSubmit}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      loading={loading}
      width={width}
      customFooter={footer}
    >
      <Form form={form} layout={layout}>
        {twoColumns ? <Row gutter={16}>{children}</Row> : children}
      </Form>
    </BaseModal>
  );
}
