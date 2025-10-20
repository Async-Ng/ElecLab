"use client";

import { DatePicker, Button } from "antd";
import dayjs from "@/shared/utils/date";
import { useState } from "react";

const { RangePicker } = DatePicker;

interface TimetableFilterProps {
  onChange: (range: [string, string]) => void;
}

export const TimetableFilter: React.FC<TimetableFilterProps> = ({ onChange }) => {
  const startOfWeek = dayjs().startOf("isoWeek");
  const endOfWeek = startOfWeek.add(6, "day");

  const [dates, setDates] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    startOfWeek,
    endOfWeek,
  ]);

  const handleChange = (value: any) => {
    if (!value) return;
    setDates(value);
    const formatted: [string, string] = [
      value[0].format("YYYY-MM-DD"),
      value[1].format("YYYY-MM-DD"),
    ];
    onChange(formatted);
  };

  const handleReset = () => {
    setDates([startOfWeek, endOfWeek]);
    onChange([
      startOfWeek.format("YYYY-MM-DD"),
      endOfWeek.format("YYYY-MM-DD"),
    ]);
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      <RangePicker
        format="DD/MM/YYYY"
        value={dates}
        onChange={handleChange}
        allowClear={false}
        className="border border-gray-300 rounded-lg"
      />
      <Button onClick={handleReset}>Đặt lại</Button>
    </div>
  );
};
