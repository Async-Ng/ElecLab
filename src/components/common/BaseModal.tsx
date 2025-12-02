import React from "react";
import Modal, { ModalProps as CustomModalProps } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface BaseModalProps {
  title?: React.ReactNode;
  open: boolean;
  onOk?: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
  showFooter?: boolean;
  customFooter?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  centered?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  className?: string;
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
  size = "md",
  centered = true,
  closable = true,
  maskClosable = true,
  className,
  children,
}: BaseModalProps) {
  const defaultFooter = showFooter ? (
    <>
      <Button variant="outline" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button onClick={onOk} loading={loading}>
        {okText}
      </Button>
    </>
  ) : undefined;

  const footer = customFooter || defaultFooter;

  return (
    <Modal
      title={title}
      open={open}
      onClose={onCancel}
      footer={footer}
      size={size}
      centered={centered}
      closable={closable}
      maskClosable={maskClosable}
      className={className}
    >
      {children}
    </Modal>
  );
}
