"use client";
import React, { useState } from "react";
import { Upload, Button, Table, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { readExcelFile } from "@/features/timetable/services/excelReader";
import { timetableApi } from "@/features/timetable/services/timetableAPI";
import { useTimetable } from "@/features/timetable/hooks/useTimetable";
import { Timetable } from "@/features/timetable/services/types";

export default function Page() {
  const { data, loading, fetchData } = useTimetable();
  const [uploading, setUploading] = useState(false);

  const handleImport = async (file: File) => {
    try {
      setUploading(true);

      // 1️⃣ Đọc file Excel người dùng chọn
      const records = await readExcelFile(file);

      if (!records.length) {
        Swal.fire("Lỗi", "Không có dữ liệu hợp lệ trong file Excel", "error");
        return false;
      }

      // 2️⃣ Push dữ liệu lên MockAPI
      await timetableApi.createMany(records);

      // 3️⃣ Gọi lại API để load dữ liệu mới
      await fetchData();

      Swal.fire("Thành công!", "Dữ liệu đã được import lên MockAPI", "success");
    } catch (error) {
      Swal.fire("Lỗi", "Không thể đọc hoặc push dữ liệu!", "error");
      console.error(error);
    } finally {
      setUploading(false);
    }

    return false; // chặn upload mặc định của antd
  };

  const columns = [
    { title: "Ngày", dataIndex: "date", key: "date" },
    { title: "Buổi", dataIndex: "session", key: "session" },
    { title: "Giờ học", dataIndex: "time", key: "time" },
    { title: "Môn học", dataIndex: "subject", key: "subject" },
    { title: "Phòng", dataIndex: "room", key: "room" },
    { title: "Lớp", dataIndex: "className", key: "className" },
    { title: "Giảng viên", dataIndex: "teacher", key: "teacher" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6 text-blue-600">
        📘 Quản lý thời khóa biểu
      </h1>

      <div className="flex gap-4 mb-6">
        <Upload
          accept=".xlsx"
          showUploadList={false}
          beforeUpload={handleImport}
        >
          <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
            Import Excel
          </Button>
        </Upload>

        <Button onClick={fetchData}>Làm mới</Button>
      </div>

      <Spin spinning={loading}>
        <Table<Timetable>
          bordered
          dataSource={data}
          columns={columns}
          rowKey={(record) => record.id || record.index}
          pagination={{ pageSize: 8 }}
        />
      </Spin>
    </div>
  );
}
