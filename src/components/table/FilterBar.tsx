"use client";

import React, { useState } from "react";
import { Input, Select, DatePicker, Button as AntButton } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Button } from "@/components/ui";
import { cn } from "@/design-system/utilities";
import dayjs, { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

export interface FilterConfig {
  key: string;
  label: string;
  type: "search" | "select" | "multiselect" | "daterange" | "custom";
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  render?: () => React.ReactNode;
}

export interface FilterValues {
  [key: string]: any;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset?: () => void;
  extra?: React.ReactNode;
  className?: string;
}

export default function FilterBar({
  filters,
  values,
  onChange,
  onReset,
  extra,
  className,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  const handleReset = () => {
    const resetValues: FilterValues = {};
    filters.forEach((filter) => {
      resetValues[filter.key] = undefined;
    });
    onChange(resetValues);
    onReset?.();
  };

  const hasActiveFilters = Object.values(values).some(
    (value) => value !== undefined && value !== "" && value !== null
  );

  const activeFilterCount = Object.values(values).filter(
    (value) =>
      value !== undefined &&
      value !== "" &&
      value !== null &&
      (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.key];

    switch (filter.type) {
      case "search":
        return (
          <Input
            placeholder={filter.placeholder || `Tìm kiếm ${filter.label}`}
            prefix={<SearchOutlined className="text-gray-400" />}
            value={value || ""}
            onChange={(e) => handleChange(filter.key, e.target.value)}
            allowClear
            className="w-full"
          />
        );

      case "select":
        return (
          <Select
            placeholder={filter.placeholder || `Chọn ${filter.label}`}
            options={filter.options}
            value={value}
            onChange={(val) => handleChange(filter.key, val)}
            allowClear
            className="w-full min-w-[150px]"
          />
        );

      case "multiselect":
        return (
          <Select
            mode="multiple"
            placeholder={filter.placeholder || `Chọn ${filter.label}`}
            options={filter.options}
            value={value || []}
            onChange={(val) => handleChange(filter.key, val)}
            allowClear
            maxTagCount="responsive"
            className="w-full min-w-[200px]"
          />
        );

      case "daterange":
        return (
          <RangePicker
            placeholder={["Từ ngày", "Đến ngày"]}
            value={value}
            onChange={(dates) => handleChange(filter.key, dates)}
            className="w-full"
          />
        );

      case "custom":
        return filter.render?.();

      default:
        return null;
    }
  };

  const visibleFilters = expanded ? filters : filters.slice(0, 3);
  const hasMore = filters.length > 3;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {visibleFilters.map((filter) => (
          <div key={filter.key} className="flex-shrink-0">
            {renderFilter(filter)}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FilterOutlined />}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Ẩn bớt" : `Thêm bộ lọc (${filters.length - 3})`}
            </Button>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<CloseCircleOutlined />}
              onClick={handleReset}
            >
              Xóa bộ lọc {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
          )}

          {extra}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Đang lọc:</span>
          {filters.map((filter) => {
            const value = values[filter.key];
            if (!value || (Array.isArray(value) && value.length === 0))
              return null;

            let displayValue = "";
            if (Array.isArray(value)) {
              displayValue = `${value.length} mục`;
            } else if (filter.type === "daterange" && Array.isArray(value)) {
              displayValue = `${value[0]?.format(
                "DD/MM/YYYY"
              )} - ${value[1]?.format("DD/MM/YYYY")}`;
            } else if (filter.type === "select" && filter.options) {
              const option = filter.options.find((opt) => opt.value === value);
              displayValue = option?.label || value;
            } else {
              displayValue = value?.toString() || "";
            }

            return (
              <span
                key={filter.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-200"
              >
                <span className="font-medium">{filter.label}:</span>
                <span>{displayValue}</span>
                <button
                  onClick={() => handleChange(filter.key, undefined)}
                  className="hover:text-blue-900"
                >
                  <CloseCircleOutlined className="text-xs" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
