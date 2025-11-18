export enum RequestCategory {
  Documents = "Tài liệu",
  Room = "Phòng học",
  Timetable = "Lịch dạy",
  Other = "Khác",
}

export enum RequestPriority {
  Low = "Thấp",
  Medium = "Trung bình",
  High = "Cao",
}

export enum RequestStatus {
  Pending = "Chờ duyệt",
  Approved = "Chấp thuận",
  Rejected = "Từ chối",
}

export interface Attachment {
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface IRequest {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    staff_id: string;
  };
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  attachments: Attachment[];
  adminNote: string;
  reviewedBy?: {
    _id: string;
    name: string;
  };
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
}

export interface ReviewRequestPayload {
  status: RequestStatus;
  adminNote: string;
}
