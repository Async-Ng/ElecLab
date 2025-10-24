import { DatePicker, Select, Button, Space } from "antd";
import { Dayjs } from "dayjs";

interface FilterBarProps {
  weekStart: Dayjs;
  setWeekStart: (d: Dayjs) => void;
  className: string;
  setClassName: (v: string) => void;
  roomFilter: string;
  setRoomFilter: (v: string) => void;
  classOptions: string[];
  roomOptions: string[];
}

export default function FilterBar({
  weekStart,
  setWeekStart,
  className,
  setClassName,
  roomFilter,
  setRoomFilter,
  classOptions,
  roomOptions,
}: FilterBarProps) {
  return (
    <Space wrap style={{ marginBottom: 16 }}>
      <DatePicker
        picker="week"
        value={weekStart}
        onChange={(d) => d && setWeekStart(d.startOf("week"))}
        style={{ width: 120 }}
        placeholder="Chọn tuần"
      />
      <Select
        value={className}
        onChange={setClassName}
        style={{ width: 140 }}
        placeholder="Chọn lớp"
        options={classOptions.map((c) => ({ value: c, label: c }))}
        allowClear
      />
      <Select
        value={roomFilter}
        onChange={setRoomFilter}
        style={{ width: 140 }}
        placeholder="Lọc phòng học"
        options={roomOptions.map((r) => ({ value: r, label: r }))}
        allowClear
      />
      <Button onClick={() => setWeekStart(weekStart.subtract(1, "week"))}>
        Tuần trước
      </Button>
      <Button onClick={() => setWeekStart(weekStart.add(1, "week"))}>
        Tuần sau
      </Button>
    </Space>
  );
}
