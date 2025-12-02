/**
 * Unified Request Types
 * Kết hợp cả RequestType và MaterialRequestType
 */

// ============== Enums ==============

export enum UnifiedRequestType {
  // Yêu cầu chung
  GENERAL_DOCUMENTS = "Tài liệu",
  GENERAL_ROOM = "Phòng học",
  GENERAL_TIMETABLE = "Lịch dạy",
  GENERAL_OTHER = "Khác",

  // Yêu cầu vật tư
  MATERIAL_ALLOCATION = "Cấp phát vật tư",
  MATERIAL_REPAIR = "Sửa chữa vật tư",
}

export enum UnifiedRequestPriority {
  LOW = "Thấp",
  MEDIUM = "Trung bình",
  HIGH = "Cao",
}

export enum UnifiedRequestStatus {
  PENDING = "Chờ duyệt", // Tạo mới
  APPROVED = "Chấp thuận", // Admin duyệt ✓
  REJECTED = "Từ chối", // Admin từ chối ✗
  PROCESSING = "Đang xử lý", // Chỉ cho vật tư
  COMPLETED = "Hoàn thành", // Chỉ cho vật tư
}

// ============== Helper: Group types ==============

export const GENERAL_REQUEST_TYPES = [
  UnifiedRequestType.GENERAL_DOCUMENTS,
  UnifiedRequestType.GENERAL_ROOM,
  UnifiedRequestType.GENERAL_TIMETABLE,
  UnifiedRequestType.GENERAL_OTHER,
];

export const MATERIAL_REQUEST_TYPES = [
  UnifiedRequestType.MATERIAL_ALLOCATION,
  UnifiedRequestType.MATERIAL_REPAIR,
];

export const ALL_REQUEST_TYPES = [
  ...GENERAL_REQUEST_TYPES,
  ...MATERIAL_REQUEST_TYPES,
];

// ============== Interfaces ==============

export interface Attachment {
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface MaterialItem {
  material: {
    _id: string;
    material_id: string;
    name: string;
  };
  quantity: number;
  reason: string;
}

export interface UserRef {
  _id: string;
  name: string;
  email?: string;
  staff_id?: string;
}

export interface RoomRef {
  _id: string;
  name: string;
  room_id: string;
}

/**
 * Unified Request Interface
 * Một interface duy nhất cho cả yêu cầu chung và yêu cầu vật tư
 */
export interface IUnifiedRequest {
  _id: string;

  // ============== Thông tin cơ bản ==============
  requester: UserRef;
  type: UnifiedRequestType;
  title: string;
  description: string;
  priority: UnifiedRequestPriority;
  status: UnifiedRequestStatus;

  // ============== Attachments (cho GENERAL_*) ==============
  attachments?: Attachment[];

  // ============== Materials (cho MATERIAL_*) ==============
  materials?: MaterialItem[];

  // ============== Room (cho MATERIAL_REPAIR) ==============
  room?: RoomRef | null;

  // ============== Workflow: Review ==============
  reviewedBy?: UserRef | null;
  reviewedAt?: Date | null;
  reviewNote?: string;

  // Legacy fields (compatibility)
  adminNote?: string;

  // ============== Workflow: Handle (MATERIAL_*) ==============
  handledBy?: UserRef | null;
  handledAt?: Date | null;

  // ============== Workflow: Complete (MATERIAL_*) ==============
  completedBy?: UserRef | null;
  completedAt?: Date | null;
  completionNote?: string;

  // ============== Metadata ==============
  createdAt: Date;
  updatedAt: Date;
}

// ============== Payload Interfaces ==============

export interface CreateGeneralRequestPayload {
  type: UnifiedRequestType;
  title: string;
  description: string;
  priority?: UnifiedRequestPriority;
  attachments?: Attachment[];
}

export interface CreateMaterialRequestPayload {
  type: UnifiedRequestType;
  title?: string; // Optional, sẽ generate từ description
  description: string;
  priority?: UnifiedRequestPriority;
  materials: Array<{
    materialId: string;
    quantity: number;
    reason: string;
  }>;
  roomId?: string;
}

export type CreateUnifiedRequestPayload =
  | CreateGeneralRequestPayload
  | CreateMaterialRequestPayload;

export interface ReviewUnifiedRequestPayload {
  status: UnifiedRequestStatus.APPROVED | UnifiedRequestStatus.REJECTED;
  reviewNote: string;
}

export interface HandleMaterialRequestPayload {
  status: UnifiedRequestStatus.PROCESSING;
}

export interface CompleteMaterialRequestPayload {
  status: UnifiedRequestStatus.COMPLETED;
  completionNote: string;
}

// ============== Type Guards ==============

export function isGeneralRequest(
  type: UnifiedRequestType
): type is Extract<
  UnifiedRequestType,
  "Tài liệu" | "Phòng học" | "Lịch dạy" | "Khác"
> {
  return GENERAL_REQUEST_TYPES.includes(type);
}

export function isMaterialRequest(
  type: UnifiedRequestType
): type is Extract<UnifiedRequestType, "Cấp phát vật tư" | "Sửa chữa vật tư"> {
  return MATERIAL_REQUEST_TYPES.includes(type);
}

export function isMaterialAllocation(
  type: UnifiedRequestType
): type is UnifiedRequestType.MATERIAL_ALLOCATION {
  return type === UnifiedRequestType.MATERIAL_ALLOCATION;
}

export function isMaterialRepair(
  type: UnifiedRequestType
): type is UnifiedRequestType.MATERIAL_REPAIR {
  return type === UnifiedRequestType.MATERIAL_REPAIR;
}

// ============== Status Helpers ==============

export function canReview(status: UnifiedRequestStatus): boolean {
  return status === UnifiedRequestStatus.PENDING;
}

export function canHandle(status: UnifiedRequestStatus): boolean {
  return status === UnifiedRequestStatus.APPROVED;
}

export function canComplete(status: UnifiedRequestStatus): boolean {
  return status === UnifiedRequestStatus.PROCESSING;
}

export function isTerminalStatus(status: UnifiedRequestStatus): boolean {
  return (
    status === UnifiedRequestStatus.REJECTED ||
    status === UnifiedRequestStatus.COMPLETED
  );
}

// ============== Type Labels ==============

export const UnifiedRequestTypeLabels: Record<UnifiedRequestType, string> = {
  [UnifiedRequestType.GENERAL_DOCUMENTS]: "Yêu cầu tài liệu",
  [UnifiedRequestType.GENERAL_ROOM]: "Yêu cầu phòng học",
  [UnifiedRequestType.GENERAL_TIMETABLE]: "Yêu cầu lịch dạy",
  [UnifiedRequestType.GENERAL_OTHER]: "Yêu cầu khác",
  [UnifiedRequestType.MATERIAL_ALLOCATION]: "Cấp phát vật tư",
  [UnifiedRequestType.MATERIAL_REPAIR]: "Sửa chữa vật tư",
};

export const UnifiedRequestPriorityLabels: Record<
  UnifiedRequestPriority,
  string
> = {
  [UnifiedRequestPriority.LOW]: "Thấp",
  [UnifiedRequestPriority.MEDIUM]: "Trung bình",
  [UnifiedRequestPriority.HIGH]: "Cao",
};

export const UnifiedRequestStatusLabels: Record<UnifiedRequestStatus, string> =
  {
    [UnifiedRequestStatus.PENDING]: "Chờ duyệt",
    [UnifiedRequestStatus.APPROVED]: "Chấp thuận",
    [UnifiedRequestStatus.REJECTED]: "Từ chối",
    [UnifiedRequestStatus.PROCESSING]: "Đang xử lý",
    [UnifiedRequestStatus.COMPLETED]: "Hoàn thành",
  };
