"use client";
import { Form, Select, DatePicker, Button, Space } from "antd";
import { Semester, Period, StudyTime } from "@/types/timetable";
import { useState } from "react";

const { Option } = Select;

export interface TimetableFilterValues {
  schoolYear?: string;
  semester?: Semester;
  date?: string;
  period?: Period;
  subject?: string;
  room?: string;
  className?: string;
  lecturer?: string;
}

interface TimetableFiltersProps {
  onFilter: (values: TimetableFilterValues) => void;
}

export default function TimetableFilters({ onFilter }: TimetableFiltersProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    if (values.date) values.date = values.date.format("YYYY-MM-DD");
    onFilter(values);
  };

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={handleFinish}
      style={{ marginBottom: 16 }}
    >
      <Form.Item name="schoolYear" label="Năm học">
        <Select allowClear style={{ width: 120 }}>
          <Option value="2024-2025">2024-2025</Option>
          <Option value="2025-2026">2025-2026</Option>
        </Select>
      </Form.Item>
      <Form.Item name="semester" label="Học kỳ">
        <Select allowClear style={{ width: 100 }}>
          <Option value={Semester.First}>HK1</Option>
          <Option value={Semester.Second}>HK2</Option>
          <Option value={Semester.Third}>HK3</Option>
        </Select>
      </Form.Item>
      <Form.Item name="date" label="Ngày">
        <DatePicker format="YYYY-MM-DD" allowClear style={{ width: 130 }} />
      </Form.Item>
      <Form.Item name="period" label="Ca học">
        <Select allowClear style={{ width: 100 }}>
          <Option value={Period.Period1}>Ca 1</Option>
          <Option value={Period.Period2}>Ca 2</Option>
          <Option value={Period.Period3}>Ca 3</Option>
          <Option value={Period.Period4}>Ca 4</Option>
        </Select>
      </Form.Item>
      <Form.Item name="subject" label="Môn học">
        <Select allowClear style={{ width: 150 }}>
          {/* Có thể map từ danh sách môn học thực tế */}
        </Select>
      </Form.Item>
      <Form.Item name="room" label="Phòng học">
        <Select allowClear style={{ width: 150 }}>
          {/* Có thể map từ danh sách phòng thực tế */}
        </Select>
      </Form.Item>
      <Form.Item name="className" label="Lớp">
        <Select allowClear style={{ width: 120 }}>
          {/* Có thể map từ danh sách lớp thực tế */}
        </Select>
      </Form.Item>
      <Form.Item name="lecturer" label="Giảng viên">
        <Select allowClear style={{ width: 150 }}>
          {/* Có thể map từ danh sách giảng viên thực tế */}
        </Select>
      </Form.Item>
      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Lọc
          </Button>
          <Button htmlType="reset" onClick={() => form.resetFields()}>
            Xóa lọc
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
