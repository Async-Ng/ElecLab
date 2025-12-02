"use client";

import React, { useCallback, useMemo } from "react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { MaterialCategory, MaterialStatus } from "@/types/material";

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
      Object.values(MaterialCategory).map((v) => ({
        value: v,
        label: v,
      })),
    []
  );

  const statusOptions = useMemo(
    () =>
      Object.values(MaterialStatus).map((v) => ({
        value: v,
        label: v,
      })),
    []
  );

  return (
    <div className="flex flex-wrap gap-4 items-center mb-8">
      <Input
        placeholder="Tìm theo mã hoặc tên"
        value={filters.q}
        onChange={handleSearchChange}
        className="max-w-[360px]"
      />

      <Select
        placeholder="Lọc theo danh mục"
        value={filters.category || ""}
        onChange={handleCategoryChange}
        options={[{ value: "", label: "Tất cả" }, ...categoryOptions]}
        className="min-w-[200px]"
      />

      <Select
        placeholder="Lọc theo tình trạng"
        value={filters.status || ""}
        onChange={handleStatusChange}
        options={[{ value: "", label: "Tất cả" }, ...statusOptions]}
        className="min-w-[200px]"
      />
    </div>
  );
});
