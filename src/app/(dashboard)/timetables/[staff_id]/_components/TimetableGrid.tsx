import { Row, Col, Typography } from "antd";
import LessonCard from "./LessonCard";
import { Timetable } from "@/types/timetable";
import { Dayjs } from "dayjs";

interface TimetableGridProps {
  items: Timetable[];
  days: Dayjs[];
  allPeriods: number[];
  statusInfo: (row: Timetable) => any;
  onDetail: (lesson: Timetable) => void;
}

export default function TimetableGrid({
  items,
  days,
  allPeriods,
  statusInfo,
  onDetail,
}: TimetableGridProps) {
  return (
    <div style={{ minWidth: 1200 }}>
      <Row gutter={[16, 16]}>
        <Col span={3}></Col>
        {days.map((d) => (
          <Col key={d.toString()} span={3} style={{ minWidth: 160 }}>
            <div style={{ textAlign: "center", fontWeight: 500 }}>
              {d.format("DD/MM/YYYY")}
            </div>
          </Col>
        ))}
      </Row>
      {allPeriods.map((s) => (
        <Row key={s} gutter={[16, 16]} align="top">
          <Col
            span={3}
            style={{
              textAlign: "right",
              paddingRight: 8,
              fontWeight: 500,
              minWidth: 120,
            }}
          >
            Ca {s}
          </Col>
          {days.map((d) => {
            const cell = items.filter((it) => {
              // Chuẩn hóa ngày về YYYY-MM-DD để so sánh
              let itemDate = it.date;
              if (/^\d{2}\/\d{2}\/\d{4}$/.test(itemDate)) {
                // DD/MM/YYYY -> YYYY-MM-DD
                const [dd, mm, yyyy] = itemDate.split("/");
                itemDate = `${yyyy}-${mm}-${dd}`;
              }
              return (
                itemDate === d.format("YYYY-MM-DD") && Number(it.period) === s
              );
            });
            return (
              <Col key={d.toString() + s} span={3} style={{ minWidth: 160 }}>
                {cell.length === 0 ? (
                  <div
                    style={{
                      minHeight: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography.Text type="secondary" style={{ fontSize: 16 }}>
                      —
                    </Typography.Text>
                  </div>
                ) : (
                  cell.map((it) => (
                    <LessonCard
                      key={it.className + it.date + it.period}
                      lesson={it}
                      statusInfo={statusInfo(it)}
                      onDetail={() => onDetail(it)}
                      style={{ minWidth: 150 }}
                    />
                  ))
                )}
              </Col>
            );
          })}
        </Row>
      ))}
    </div>
  );
}
