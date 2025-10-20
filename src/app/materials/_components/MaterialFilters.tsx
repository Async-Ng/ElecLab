"use client";

import React from "react";
import { Input, Select, Button } from "antd";
import { MaterialCategory, MaterialStatus } from "@/types/material";

const { Option } = Select;

type FilterState = { q: string; category: string; status: string };
type Props = {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
};

export default function MaterialFilters({ filters, setFilters }: Props) {
  return (
    <>
      <Input
        placeholder="Tìm theo mã hoặc tên"
        value={filters.q}
        onChange={(e) => setFilters((s: any) => ({ ...s, q: e.target.value }))}
        style={{ maxWidth: 360 }}
      />

      <Select
        placeholder="Lọc theo danh mục"
        value={filters.category || undefined}
        onChange={(val) =>
          setFilters((s: any) => ({ ...s, category: val || "" }))
        }
        allowClear
        style={{ minWidth: 200 }}
      >
        {Object.values(MaterialCategory).map((v) => (
          <Option key={v} value={v}>
            {v}
          </Option>
        ))}
      </Select>

      <Select
        placeholder="Lọc theo tình trạng"
        value={filters.status || undefined}
        onChange={(val) =>
          setFilters((s: any) => ({ ...s, status: val || "" }))
        }
        allowClear
        style={{ minWidth: 200 }}
      >
        {Object.values(MaterialStatus).map((v) => (
          <Option key={v} value={v}>
            {v}
          </Option>
        ))}
      </Select>

      <div className="ml-auto">
        <Button
          type="default"
          onClick={() => setFilters({ q: "", category: "", status: "" })}
        >
          Đặt lại
        </Button>
      </div>
    </>
  );
}
