"use client";
import React, { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import {
  DatePicker,
  Alert,
  Table,
  Input,
  Select,
  Button as AntButton,
  Tag,
  Space,
  Popconfirm,
  Switch,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Timetable, Semester, Period, StudyTime } from "@/types/timetable";
import { UserRole } from "@/types/user";
import { useAuth } from "@/hooks/useAuth";
import BaseModal from "@/components/common/BaseModal";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  isWeekValidForSemester,
  getWeekValidationError,
} from "@/shared/utils/semesterValidation";

interface ImportPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  data: Timetable[];
  onImport: (rows: Timetable[]) => void;
  rooms?: Array<{ room_id: string; _id: string; name: string }>;
  users?: Array<{
    email: string;
    _id: string;
    name: string;
    staff_id?: string;
    roles?: string[];
  }>;
}

function normalizeDate(val: any): string {
  let dateVal = String(val).trim();
  if (/^\d+$/.test(dateVal)) {
    // Excel serial
    const serial = Number(dateVal);
    const excelEpoch = new Date(1899, 11, 30);
    const dateObj = new Date(
      excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000
    );
    const d = dateObj.getDate().toString().padStart(2, "0");
    const m = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const y = dateObj.getFullYear();
    dateVal = `${d}/${m}/${y}`;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    // Convert YYYY-MM-DD to DD/MM/YYYY
    const [y, m, d] = dateVal.split("-");
    dateVal = `${d}/${m}/${y}`;
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateVal)) {
    dateVal = dateVal.replace(/-/g, "/");
  }
  return dateVal;
}

export default function ImportPreviewModal({
  visible,
  onClose,
  data,
  onImport,
  rooms = [],
  users = [],
}: ImportPreviewModalProps) {
  const { isAdmin } = useAuth();
  const isUserAdmin = isAdmin();

  const [rows, setRows] = useState<(Timetable & { key: string | number })[]>(
    []
  );
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);

  useEffect(() => {
    if (visible) {
      setRows((data || []).map((r, idx) => ({ ...r, key: idx })));
    }
  }, [visible, data]);

  function updateRow(key: string | number, patch: Partial<Timetable>) {
    setRows((d) => d.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }
  function removeRow(key: string | number) {
    setRows((d) => d.filter((r) => r.key !== key));
  }

  // Check if row is empty (all fields are empty or undefined)
  const isEmptyRow = (r: Timetable) => {
    return (
      !r.schoolYear &&
      !r.semester &&
      !r.date &&
      !r.week &&
      !r.period &&
      !r.time &&
      !r.subject &&
      !r.room &&
      !r.className &&
      !r.lecturer
    );
  };

  const isValid = (r: Timetable) =>
    !!(
      r.schoolYear &&
      r.semester &&
      r.date &&
      r.week &&
      r.period &&
      r.time &&
      r.subject &&
      r.room &&
      r.className &&
      r.lecturer
    );

  const getRowError = (record: Timetable): string | null => {
    // Skip validation for empty rows
    if (isEmptyRow(record)) return null;

    const dateVal = normalizeDate(record.date);

    if (!isValid(record)) return "Thiếu trường bắt buộc";
    if (!/^\d{4}-\d{4}$/.test(record.schoolYear))
      return "Năm học sai định dạng";
    if (
      !/^\d{2}\/\d{2}\/\d{4}$/.test(dateVal) ||
      !dayjs(dateVal, "DD/MM/YYYY", true).isValid()
    ) {
      return "Ngày sai định dạng";
    }
    if (record.week && record.semester) {
      if (!isWeekValidForSemester(record.semester, record.week)) {
        return getWeekValidationError(record.semester, record.week);
      }
    }
    if (
      rooms.length > 0 &&
      record.room &&
      !rooms.some((room) => room.room_id === record.room)
    ) {
      return "Mã phòng không hợp lệ";
    }
    if (
      users.length > 0 &&
      record.lecturer &&
      !users.some((u) => u.email === record.lecturer)
    ) {
      return "Giảng viên không hợp lệ";
    }
    return null;
  };

  const invalidRoomRows = rows.filter(
    (r) =>
      r.room &&
      rooms.length > 0 &&
      !rooms.some((room) => room.room_id === r.room)
  );
  const invalidLecturerRows = rows.filter(
    (r) =>
      r.lecturer &&
      users.length > 0 &&
      !users.some((u) => u.email === r.lecturer)
  );

  // Stats calculation
  const stats = useMemo(() => {
    const totalCount = rows.length;
    const validCount = rows.filter((r) => !getRowError(r)).length;
    const errorCount = totalCount - validCount;
    const invalidSchoolYearCount = rows.filter(
      (r) => !/^\d{4}-\d{4}$/.test(r.schoolYear)
    ).length;
    const invalidDateCount = rows.filter((r) => {
      const dateVal = normalizeDate(r.date);
      return (
        !/^\d{2}\/\d{2}\/\d{4}$/.test(dateVal) ||
        !dayjs(dateVal, "DD/MM/YYYY", true).isValid()
      );
    }).length;

    return {
      totalCount,
      validCount,
      errorCount,
      invalidSchoolYearCount,
      invalidDateCount,
    };
  }, [rows, rooms, users]);

  // Filter rows based on error toggle
  const displayRows = useMemo(() => {
    if (!showErrorsOnly) return rows;
    return rows.filter((r) => getRowError(r) !== null);
  }, [rows, showErrorsOnly]);
  const columns = [
    {
      title: "Năm học",
      dataIndex: "schoolYear",
      key: "schoolYear",
      render: (val: string, record: any) => (
        <Input
          value={val}
          style={{ width: 100 }}
          onChange={(e) =>
            updateRow(record.key, { schoolYear: e.target.value })
          }
        />
      ),
    },
    {
      title: "Học kỳ",
      dataIndex: "semester",
      key: "semester",
      render: (val: number, record: any) => (
        <Select
          value={val}
          style={{ width: 80 }}
          onChange={(v) => updateRow(record.key, { semester: v })}
        >
          <Select.Option value={Semester.First}>HK1</Select.Option>
          <Select.Option value={Semester.Second}>HK2</Select.Option>
          <Select.Option value={Semester.Third}>HK3</Select.Option>
        </Select>
      ),
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (val: string, record: any) => {
        const formatted = normalizeDate(val);
        const isValidDate = dayjs(formatted, "DD/MM/YYYY", true).isValid();
        return (
          <DatePicker
            format="DD/MM/YYYY"
            value={isValidDate ? dayjs(formatted, "DD/MM/YYYY", true) : null}
            style={{ width: 120 }}
            onChange={(date) => {
              if (date && date.isValid()) {
                updateRow(record.key, { date: date.format("DD/MM/YYYY") });
              } else {
                updateRow(record.key, { date: "" });
              }
            }}
            placeholder={isValidDate ? undefined : "Chọn ngày"}
            open={isValidDate ? undefined : false}
            allowClear
          />
        );
      },
    },
    {
      title: "Tuần",
      dataIndex: "week",
      key: "week",
      render: (val: number, record: any) => (
        <Input
          type="number"
          value={val}
          style={{ width: 60 }}
          min={1}
          max={52}
          onChange={(e) => {
            const num = e.target.value ? Number(e.target.value) : undefined;
            updateRow(record.key, { week: num });
          }}
          placeholder="1-52"
        />
      ),
    },
    {
      title: "Ca học",
      dataIndex: "period",
      key: "period",
      render: (val: number, record: any) => (
        <Select
          value={val}
          style={{ width: 80 }}
          onChange={(v) => updateRow(record.key, { period: v })}
        >
          <Select.Option value={Period.Period1}>Ca 1</Select.Option>
          <Select.Option value={Period.Period2}>Ca 2</Select.Option>
          <Select.Option value={Period.Period3}>Ca 3</Select.Option>
          <Select.Option value={Period.Period4}>Ca 4</Select.Option>
        </Select>
      ),
    },
    {
      title: "Giờ học",
      dataIndex: "time",
      key: "time",
      render: (val: string, record: any) => (
        <Select
          value={val as StudyTime}
          style={{ width: 120 }}
          onChange={(v) => updateRow(record.key, { time: v as StudyTime })}
        >
          {Object.values(StudyTime).map((t) => (
            <Select.Option key={t} value={t}>
              {t}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Môn học",
      dataIndex: "subject",
      key: "subject",
      render: (val: string, record: any) => (
        <Input
          value={val}
          style={{ width: 120 }}
          onChange={(e) => updateRow(record.key, { subject: e.target.value })}
        />
      ),
    },
    {
      title: "Phòng học",
      dataIndex: "room",
      key: "room",
      render: (val: string, record: any) => (
        <Select
          showSearch
          style={{ width: 150 }}
          value={val || undefined}
          placeholder="Chọn phòng theo mã phòng"
          optionFilterProp="children"
          onChange={(v) => updateRow(record.key, { room: v })}
          filterOption={(input, option) => {
            const label =
              typeof option?.children === "string" ? option.children : "";
            const value = typeof option?.value === "string" ? option.value : "";
            return (
              label.toLowerCase().includes(input.toLowerCase()) ||
              value.toLowerCase().includes(input.toLowerCase())
            );
          }}
        >
          {rooms.map((room) => (
            <Select.Option key={room.room_id} value={room.room_id}>
              {room.room_id} - {room.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "className",
      key: "className",
      render: (val: string, record: any) => (
        <Input
          value={val}
          style={{ width: 100 }}
          onChange={(e) => updateRow(record.key, { className: e.target.value })}
        />
      ),
    },
    ...(isUserAdmin
      ? [
          {
            title: "Giảng viên",
            dataIndex: "lecturer",
            key: "lecturer",
            render: (val: string, record: any) => (
              <Select
                showSearch
                style={{ width: 150 }}
                value={val || undefined}
                placeholder="Chọn giảng viên theo email"
                optionFilterProp="children"
                onChange={(v: string) => updateRow(record.key, { lecturer: v })}
                filterOption={(input: string, option: any) => {
                  const label =
                    typeof option?.children === "string" ? option.children : "";
                  const value =
                    typeof option?.value === "string" ? option.value : "";
                  return (
                    label.toLowerCase().includes(input.toLowerCase()) ||
                    value.toLowerCase().includes(input.toLowerCase())
                  );
                }}
              >
                {users
                  .filter(
                    (u: any) => u.roles && u.roles.includes(UserRole.User)
                  )
                  .map((u) => (
                    <Select.Option
                      key={u.email}
                      value={`${u.name} (${u.staff_id})`}
                    >
                      {u.name} - {u.staff_id}
                    </Select.Option>
                  ))}
              </Select>
            ),
          },
        ]
      : []),
    {
      title: "Trạng thái",
      key: "valid",
      render: (_: any, record: Timetable) => {
        const error = getRowError(record);
        if (error) {
          return (
            <Tag color="red" icon={<CloseCircleOutlined />}>
              {error}
            </Tag>
          );
        }
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Hợp lệ
          </Tag>
        );
      },
    },
  ];

  return (
    <BaseModal
      open={visible}
      onCancel={onClose}
      title="Kiểm tra dữ liệu Import"
      size="full"
      showFooter={false}
    >
      {/* Stats Dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng số dòng</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalCount}
              </p>
            </div>
            <InfoCircleOutlined className="text-4xl text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hợp lệ</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.validCount}
              </p>
            </div>
            <CheckCircleOutlined className="text-4xl text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Lỗi/Cảnh báo</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.errorCount}
              </p>
            </div>
            <ExclamationCircleOutlined className="text-4xl text-red-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Error Alerts */}
      {stats.invalidSchoolYearCount > 0 && (
        <Alert
          type="warning"
          showIcon
          className="mb-3"
          message={`Có ${stats.invalidSchoolYearCount} bản ghi có năm học không đúng định dạng (YYYY-YYYY). Vui lòng chọn lại năm học.`}
        />
      )}
      {stats.invalidDateCount > 0 && (
        <Alert
          type="warning"
          showIcon
          className="mb-3"
          message={`Có ${stats.invalidDateCount} bản ghi có ngày không đúng định dạng (DD/MM/YYYY). Vui lòng chọn lại ngày.`}
        />
      )}
      {invalidRoomRows.length > 0 && (
        <Alert
          type="warning"
          showIcon
          className="mb-3"
          message={`Có ${invalidRoomRows.length} bản ghi có mã phòng không hợp lệ. Các bản ghi này sẽ không được liên kết phòng.`}
        />
      )}
      {invalidLecturerRows.length > 0 && (
        <Alert
          type="warning"
          showIcon
          className="mb-3"
          message={`Có ${invalidLecturerRows.length} bản ghi có email giảng viên không hợp lệ. Các bản ghi này sẽ không được liên kết giảng viên.`}
        />
      )}

      {/* Filter Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={showErrorsOnly}
            onChange={setShowErrorsOnly}
            checkedChildren="Chỉ hiện lỗi"
            unCheckedChildren="Hiện tất cả"
          />
          <span className="text-sm text-gray-600">
            {showErrorsOnly
              ? `Đang hiển thị ${displayRows.length} dòng lỗi`
              : `Đang hiển thị ${displayRows.length} dòng`}
          </span>
        </div>
      </div>

      {/* Data Table with Sticky Header */}
      <Table
        rowKey={(r) => r.key}
        dataSource={displayRows}
        columns={columns}
        scroll={{ x: "max-content", y: 500 }}
        pagination={{ pageSize: 10 }}
        rowClassName={(record) =>
          getRowError(record) ? "bg-red-50 hover:bg-red-100" : ""
        }
        sticky
      />

      {/* Action Footer */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
        <Button onClick={onClose} size="large">
          Hủy
        </Button>
        <Popconfirm
          title="Xác nhận Import"
          description={
            stats.errorCount > 0
              ? `Có ${stats.errorCount} dòng lỗi sẽ bị bỏ qua. Tiếp tục import ${stats.validCount} bản ghi hợp lệ?`
              : `Import ${stats.validCount} bản ghi?`
          }
          onConfirm={() =>
            onImport(rows.filter((r) => !isEmptyRow(r) && !getRowError(r)))
          }
          okText="Import"
          cancelText="Hủy"
          disabled={stats.validCount === 0}
          getPopupContainer={(trigger) =>
            trigger.parentElement || document.body
          }
        >
          <AntButton
            type="primary"
            size="large"
            disabled={stats.validCount === 0}
            icon={<CheckCircleOutlined />}
          >
            Import {stats.validCount} bản ghi
          </AntButton>
        </Popconfirm>
      </div>
    </BaseModal>
  );
}
