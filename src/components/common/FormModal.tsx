import React, { useEffect, useRef } from "react";
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
  /** Size preset - overridden by width if provided */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Custom width - overrides size preset */
  width?: number;
  okText?: string;
  cancelText?: string;
  layout?: "horizontal" | "vertical" | "inline";
  twoColumns?: boolean;
  initialValues?: any; // Values to set when editing
  footer?: React.ReactNode; // Custom footer
  autoFocusFirstField?: boolean; // Auto-focus first input (default: true)
}

/**
 * FormModal - Standardized wrapper for all forms in modals
 *
 * Features:
 * - Auto-focus first field for keyboard accessibility
 * - Consistent spacing (24px gaps between fields)
 * - Automatic initial values handling
 * - Loading state management
 * - Standard footer with Cancel/Save buttons
 */
export default function FormModal({
  open,
  title,
  onCancel,
  onSubmit,
  loading = false,
  form,
  children,
  size = "md",
  width,
  okText = "Lưu",
  cancelText = "Hủy",
  layout = "vertical",
  twoColumns = false,
  initialValues,
  footer,
  autoFocusFirstField = true,
}: FormModalProps) {
  const formRef = useRef<HTMLDivElement>(null);

  // Set initial values when modal opens or initialValues changes
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }

      // Auto-focus first input field after modal opens
      if (autoFocusFirstField) {
        setTimeout(() => {
          const firstInput = formRef.current?.querySelector<HTMLInputElement>(
            'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
          );
          firstInput?.focus();
        }, 100);
      }
    }
  }, [open, initialValues, form, autoFocusFirstField]);

  return (
    <BaseModal
      open={open}
      title={title}
      onOk={onSubmit}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      loading={loading}
      size={size}
      width={width}
      customFooter={footer}
    >
      <div ref={formRef}>
        <Form
          form={form}
          layout={layout}
          // Increased spacing for better readability (24px between fields)
          className="form-modal-content"
          style={
            {
              "--form-item-margin-bottom": "24px",
            } as React.CSSProperties
          }
        >
          {twoColumns ? <Row gutter={16}>{children}</Row> : children}
        </Form>
      </div>
    </BaseModal>
  );
}
