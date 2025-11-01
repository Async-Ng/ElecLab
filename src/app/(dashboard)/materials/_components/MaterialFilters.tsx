"use client";

import React, { useCallback, useMemo } from "react";
import { Input, Select, Button } from "antd";
import { MaterialCategory, MaterialStatus } from "@/types/material";

const { Option } = Select;

type FilterState = { q: string; category: string; status: string };
type Props = {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
};

export default React.memo(function MaterialFilters({
  filters,
  setFilters,
}: Props) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((s: any) => ({ ...s, q: e.target.value }));
    },
    [setFilters]
  );

  const handleCategoryChange = useCallback(
    (val: string) => {
      setFilters((s: any) => ({ ...s, category: val || "" }));
    },
    [setFilters]
  );

  const handleStatusChange = useCallback(
    (val: string) => {
      setFilters((s: any) => ({ ...s, status: val || "" }));
    },
    [setFilters]
  );

  const categoryOptions = useMemo(
    () =>
      Object.values(MaterialCategory).map((v) => (
        <Option key={v} value={v}>
          {v}
        </Option>
      )),
    []
  );

  const statusOptions = useMemo(
    () =>
      Object.values(MaterialStatus).map((v) => (
        <Option key={v} value={v}>
          {v}
        </Option>
      )),
    []
  );

  return (
    <>
      <Input
        placeholder="Tìm theo mã hoặc tên"
        value={filters.q}
        onChange={handleSearchChange}
        style={{ maxWidth: 360 }}
        allowClear
      />

      <Select
        placeholder="Lọc theo danh mục"
        value={filters.category || undefined}
        onChange={handleCategoryChange}
        allowClear
        style={{ minWidth: 200 }}
      >
        {categoryOptions}
      </Select>

      <Select
        placeholder="Lọc theo tình trạng"
        value={filters.status || undefined}
        onChange={handleStatusChange}
        allowClear
        style={{ minWidth: 200 }}
      >
        {statusOptions}
      </Select>
    </>
  );
});
