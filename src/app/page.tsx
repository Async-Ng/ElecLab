import Link from "next/link";
import { Button } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

export default function Home() {
  return (
    <div>
      abc
      <Link href="/timetable">
        <Button
          type="primary"
          icon={<CalendarOutlined />}
          size="large"
          className="rounded-xl"
        >
          Xem Thời khóa biểu
        </Button>
      </Link>
    </div>
  );
}
