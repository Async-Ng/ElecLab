import React from "react";
import { Modal, Button, ModalProps } from "antd";

interface BaseModalProps extends Omit<ModalProps, "footer"> {
  onOk?: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
  showFooter?: boolean;
  customFooter?: React.ReactNode;
  children: React.ReactNode;
}

export default function BaseModal({
  title,
  open,
  onOk,
  onCancel,
  okText = "Lưu",
  cancelText = "Hủy",
  loading = false,
  showFooter = true,
  customFooter,
  width = 600,
  destroyOnClose = true,
  children,
  ...restProps
}: BaseModalProps) {
  const defaultFooter = showFooter
    ? [
        <Button key="cancel" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={onOk}>
          {okText}
        </Button>,
      ]
    : null;

  const footer = customFooter || defaultFooter;

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      footer={footer}
      width={width}
      destroyOnHidden={destroyOnClose}
      {...restProps}
    >
      {children}
    </Modal>
  );
}
