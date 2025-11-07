import React from "react";
import { Descriptions, Tag, Row, Col, Divider, Card } from "antd";
import { TeachingLog, TeachingLogStatus } from "../../../../types/teachingLog";
import {
  Timetable,
  Period,
  StudyTime,
  Semester,
} from "../../../../types/timetable";
import ImagePreviewGroup from "./ImagePreviewGroup";
import { formatDateVN } from "@/shared/utils/date";
import { PictureOutlined } from "@ant-design/icons";

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
          <Descriptions.Item label="Ngày">
            {formatDateVN(timetable?.date)}
          </Descriptions.Item>
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
          <Descriptions.Item label="Ghi chú">
            {log?.note || (
              <span style={{ color: "#999", fontStyle: "italic" }}>
                Không có ghi chú
              </span>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag
              color={log?.status === TeachingLogStatus.NORMAL ? "green" : "red"}
            >
              {log?.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {formatDateVN(log?.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày cập nhật">
            {formatDateVN(log?.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Col>

      {/* Ảnh minh họa section - Full width */}
      <Col xs={24}>
        <Card
          title={
            <span>
              <PictureOutlined style={{ marginRight: 8, color: "#1890ff" }} />
              Ảnh minh họa
              {log?.images?.length > 0 && (
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 14,
                    color: "#999",
                    fontWeight: "normal",
                  }}
                >
                  ({log.images.length} ảnh)
                </span>
              )}
            </span>
          }
          bordered={false}
          style={{
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: 8,
          }}
          styles={{
            header: {
              borderBottom: "1px solid #f0f0f0",
              background: "#fafafa",
            },
            body: {
              padding: log?.images?.length > 0 ? 24 : 20,
            },
          }}
        >
          {log?.images?.length > 0 ? (
            <ImagePreviewGroup images={log.images} />
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#999",
                fontSize: 14,
              }}
            >
              <PictureOutlined
                style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}
              />
              <div>Chưa có ảnh minh họa</div>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default TeachingLogDetail;
