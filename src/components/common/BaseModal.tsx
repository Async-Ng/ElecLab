import React from "react";
import Modal, { ModalProps as CustomModalProps } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { cn } from "@/design-system/utilities";

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
  /** Size preset - overridden by width if provided */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Custom width - overrides size preset */
  width?: number | string;
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
  width,
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

  // If width is provided, convert to className override
  const widthClassName = width
    ? typeof width === "number"
      ? `max-w-[${width}px]`
      : `max-w-[${width}]`
    : undefined;

  return (
    <Modal
      title={title}
      open={open}
      onClose={onCancel}
      footer={footer}
      size={width ? undefined : size} // Only use size if no width provided
      centered={centered}
      closable={closable}
      maskClosable={maskClosable}
      className={cn(widthClassName, className)}
    >
      {children}
    </Modal>
  );
}
