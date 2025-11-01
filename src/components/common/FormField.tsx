import React from "react";
import { Form, Input, Select, DatePicker, InputNumber, Col } from "antd";
import { FormItemProps } from "antd/es/form";
import { Rule } from "antd/es/form";

type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "select"
  | "multiselect"
  | "date"
  | "textarea";

interface FormFieldProps extends Omit<FormItemProps, "children"> {
  type?: FieldType;
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  rows?: number;
  showSearch?: boolean;
  span?: number;
  disabled?: boolean;
  format?: string;
  min?: number;
  max?: number;
}

export default function FormField({
  type = "text",
  options = [],
  placeholder,
  rows = 4,
  showSearch = false,
  span,
  disabled = false,
  format = "DD/MM/YYYY",
  min,
  max,
  ...formItemProps
}: FormFieldProps) {
  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <Input.TextArea
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
          />
        );

      case "password":
        return <Input.Password placeholder={placeholder} disabled={disabled} />;

      case "email":
        return (
          <Input type="email" placeholder={placeholder} disabled={disabled} />
        );

      case "number":
        return (
          <InputNumber
            style={{ width: "100%" }}
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
          />
        );

      case "select":
        return (
          <Select
            placeholder={placeholder}
            showSearch={showSearch}
            optionFilterProp="children"
            disabled={disabled}
            options={options}
          />
        );

      case "multiselect":
        return (
          <Select
            mode="multiple"
            placeholder={placeholder}
            showSearch={showSearch}
            optionFilterProp="children"
            disabled={disabled}
            allowClear
            options={options}
          />
        );

      case "date":
        return (
          <DatePicker
            format={format}
            placeholder={placeholder}
            style={{ width: "100%" }}
            disabled={disabled}
          />
        );

      default:
        return <Input placeholder={placeholder} disabled={disabled} />;
    }
  };

  const field = <Form.Item {...formItemProps}>{renderInput()}</Form.Item>;

  return span ? <Col span={span}>{field}</Col> : field;
}
