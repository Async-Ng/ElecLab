import { Modal, Button } from "antd";
import { Timetable } from "@/types/timetable";

interface LessonModalProps {
  modal: { open: boolean; record?: Timetable };
  onClose: () => void;
}

export default function LessonModal({ modal, onClose }: LessonModalProps) {
  return (
    <Modal
      title="Chi tiết tiết học"
      open={modal.open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      {modal.record && (
        <div>
          <div>
            <b>Môn học:</b> {modal.record.subject}
          </div>
          <div>
            <b>Giảng viên:</b>{" "}
            {typeof modal.record.lecturer === "string"
              ? modal.record.lecturer
              : modal.record.lecturer?.name}
          </div>
          <div>
            <b>Phòng học:</b>{" "}
            {typeof modal.record.room === "string"
              ? modal.record.room
              : modal.record.room?.name}
          </div>
          <div>
            <b>Thời gian:</b> {modal.record.time}
          </div>
          <div>
            <b>Ngày:</b> {modal.record.date}
          </div>
          <div>
            <b>Lớp:</b> {modal.record.className}
          </div>
          <Button
            type="primary"
            style={{ marginTop: 12 }}
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("edit-timetable", { detail: modal.record })
              )
            }
          >
            Sửa
          </Button>
        </div>
      )}
    </Modal>
  );
}
