import React from "react";
import { Form, Button, Row, Col, Space } from "antd";
import { FilterOutlined, ClearOutlined } from "@ant-design/icons";

interface FilterBarProps {
  onFilter?: () => void;
  onClear?: () => void;
  children: React.ReactNode;
  filterText?: string;
  clearText?: string;
  loading?: boolean;
}

export default function FilterBar({
  onFilter,
  onClear,
  children,
  filterText = "Lọc",
  clearText = "Xóa bộ lọc",
  loading = false,
}: FilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <Form layout="vertical">
        <Row gutter={16}>{children}</Row>
        <Row>
          <Col span={24}>
            <Space className="mt-2">
              {onFilter && (
                <Button
                  type="primary"
                  icon={<FilterOutlined />}
                  onClick={onFilter}
                  loading={loading}
                >
                  {filterText}
                </Button>
              )}
              {onClear && (
                <Button icon={<ClearOutlined />} onClick={onClear}>
                  {clearText}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
