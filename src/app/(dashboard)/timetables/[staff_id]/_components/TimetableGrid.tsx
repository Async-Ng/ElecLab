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
    <div className="min-w-[900px]">
      <Row gutter={[12, 12]}>
        <Col span={3}></Col>
        {days.map((d) => (
          <Col key={d.toString()} span={3}>
            <div style={{ textAlign: "center", fontWeight: 500 }}>
              {d.format("DD/MM/YYYY")}
            </div>
          </Col>
        ))}
      </Row>
      {allPeriods.map((s) => (
        <Row key={s} gutter={[12, 12]} align="top">
          <Col
            span={3}
            style={{ textAlign: "right", paddingRight: 8, fontWeight: 500 }}
          >
            Ca {s}
          </Col>
          {days.map((d) => {
            const cell = items.filter(
              (it) =>
                it.date === d.format("YYYY-MM-DD") && Number(it.period) === s
            );
            return (
              <Col key={d.toString() + s} span={3}>
                {cell.length === 0 ? (
                  <div
                    style={{
                      minHeight: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography.Text type="secondary" style={{ fontSize: 14 }}>
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
