import React from "react";
import { Descriptions, Tag, Row, Col, Divider } from "antd";
import { TeachingLog, TeachingLogStatus } from "../../../../types/teachingLog";
import {
  Timetable,
  Period,
  StudyTime,
  Semester,
} from "../../../../types/timetable";
import ImagePreviewGroup from "./ImagePreviewGroup";

interface TeachingLogDetailProps {
  log: TeachingLog;
}

const TeachingLogDetail: React.FC<TeachingLogDetailProps> = ({ log }) => {
  const timetable: Timetable | undefined =
    log?.timetable && typeof log.timetable === "object"
      ? log.timetable
      : undefined;

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={12}>
        <Descriptions
          title="Thông tin thời khóa biểu"
          bordered
          size="small"
          column={1}
        >
          <Descriptions.Item label="Môn học">
            {timetable?.subject}
          </Descriptions.Item>
          <Descriptions.Item label="Lớp">
            {timetable?.className}
          </Descriptions.Item>
          <Descriptions.Item label="Phòng học">
            {typeof timetable?.room === "object"
              ? timetable?.room?.name
              : timetable?.room}
          </Descriptions.Item>
          <Descriptions.Item label="Giảng viên">
            {typeof timetable?.lecturer === "object"
              ? timetable?.lecturer?.name
              : timetable?.lecturer}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày">{timetable?.date}</Descriptions.Item>
          <Descriptions.Item label="Ca học">
            {timetable?.period}
          </Descriptions.Item>
          <Descriptions.Item label="Thời gian">
            {timetable?.time}
          </Descriptions.Item>
          <Descriptions.Item label="Năm học">
            {timetable?.schoolYear}
          </Descriptions.Item>
          <Descriptions.Item label="Học kỳ">
            {timetable?.semester}
          </Descriptions.Item>
        </Descriptions>
      </Col>
      <Col xs={24} md={12}>
        <Descriptions
          title="Thông tin nhật ký ca dạy"
          bordered
          size="small"
          column={1}
        >
          <Descriptions.Item label="Ghi chú">{log?.note}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag
              color={log?.status === TeachingLogStatus.NORMAL ? "green" : "red"}
            >
              {log?.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ảnh minh họa">
            {log?.images?.length ? (
              <ImagePreviewGroup images={log.images} />
            ) : (
              "Không có ảnh"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {log?.createdAt}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {log?.updatedAt}
          </Descriptions.Item>
        </Descriptions>
      </Col>
    </Row>
  );
};

export default TeachingLogDetail;
