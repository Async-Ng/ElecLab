export enum MaterialRequestType {
  Allocation = "Cấp phát",
  Repair = "Sửa chữa",
}

export enum MaterialRequestStatus {
  Pending = "Chờ duyệt",
  Approved = "Chấp thuận",
  Rejected = "Từ chối",
  Processing = "Đang xử lý",
  Completed = "Hoàn thành",
}

export enum MaterialRequestPriority {
  Low = "Thấp",
  Medium = "Trung bình",
  High = "Cao",
}

export interface MaterialItem {
  material: {
    _id: string;
    material_id: string;
    name: string;
    quantity: number;
  };
  quantity: number;
  reason: string;
}

export interface IMaterialRequest {
  _id: string;
  requester: {
    _id: string;
    name: string;
    email: string;
    staff_id: string;
  };
  requestType: MaterialRequestType;
  status: MaterialRequestStatus;
  materials: MaterialItem[];
  room?: {
    _id: string;
    name: string;
    room_id: string;
  };
  description: string;
  priority: MaterialRequestPriority;
  reviewedBy?: {
    _id: string;
    name: string;
  };
  reviewedAt?: Date;
  reviewNote: string;
  handledBy?: {
    _id: string;
    name: string;
  };
  handledAt?: Date;
  completedBy?: {
    _id: string;
    name: string;
  };
  completedAt?: Date;
  completionNote: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMaterialRequestPayload {
  requestType: MaterialRequestType;
  materials: Array<{
    materialId: string;
    quantity: number;
    reason: string;
  }>;
  roomId?: string;
  description: string;
  priority?: MaterialRequestPriority;
}

export interface ReviewMaterialRequestPayload {
  status: MaterialRequestStatus;
  reviewNote: string;
}

export interface HandleMaterialRequestPayload {
  status: MaterialRequestStatus;
}

export interface CompleteMaterialRequestPayload {
  completionNote: string;
}
