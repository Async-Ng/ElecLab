import mongoose from "mongoose";

/**
 * Unified Request Model
 * Kết hợp cả Request (yêu cầu chung) và MaterialRequest (yêu cầu vật tư)
 *
 * Type discriminator để phân biệt:
 * - GENERAL_* : Yêu cầu chung (Tài liệu, Phòng học, Lịch dạy, Khác)
 * - MATERIAL_ALLOCATION: Yêu cầu cấp phát vật tư
 * - MATERIAL_REPAIR: Yêu cầu sửa chữa vật tư
 */

const UnifiedRequestSchema = new mongoose.Schema(
  {
    // ============== Người tạo yêu cầu ==============
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ============== Phân loại yêu cầu ==============
    type: {
      type: String,
      enum: [
        // Yêu cầu chung
        "Tài liệu",
        "Phòng học",
        "Lịch dạy",
        "Khác",
        // Yêu cầu vật tư
        "Cấp phát vật tư",
        "Sửa chữa vật tư",
      ],
      required: true,
    },

    // ============== Thông tin cơ bản ==============
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["Thấp", "Trung bình", "Cao"],
      default: "Trung bình",
    },

    // ============== Trạng thái yêu cầu ==============
    status: {
      type: String,
      enum: [
        "Chờ duyệt", // Tạo mới
        "Chấp thuận", // Admin duyệt ✓
        "Từ chối", // Admin từ chối ✗
        "Đang xử lý", // Chỉ dùng cho yêu cầu vật tư
        "Hoàn thành", // Chỉ dùng cho yêu cầu vật tư
      ],
      default: "Chờ duyệt",
    },

    // ============== Attachment (cho yêu cầu chung) ==============
    attachments: [
      {
        fileName: String,
        fileSize: Number,
        fileType: String,
      },
    ],

    // ============== Thông tin vật tư (cho MATERIAL_*) ==============
    materials: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Material",
        },
        quantity: {
          type: Number,
          min: 1,
        },
        reason: {
          type: String,
        },
      },
    ],

    // ============== Phòng (cho MATERIAL_REPAIR) ==============
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },

    // ============== Workflow: Review step ==============
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewNote: {
      type: String,
      default: "",
    },

    // Legacy: adminNote (cho compatibility với Request cũ)
    adminNote: {
      type: String,
      default: "",
    },

    // ============== Workflow: Handle step (chỉ cho MATERIAL_*) ==============
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    handledAt: {
      type: Date,
      default: null,
    },

    // ============== Workflow: Complete step (chỉ cho MATERIAL_*) ==============
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    completionNote: {
      type: String,
      default: "",
    },

    // ============== Metadata ==============
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "requests_unified", // Tách ra collection riêng để migrate dần
  }
);

// ============== Indexes ==============
UnifiedRequestSchema.index({ requester: 1 });
UnifiedRequestSchema.index({ status: 1 });
UnifiedRequestSchema.index({ type: 1 });
UnifiedRequestSchema.index({ createdAt: -1 });
UnifiedRequestSchema.index({ requester: 1, status: 1 });
UnifiedRequestSchema.index({ type: 1, status: 1 });
UnifiedRequestSchema.index({ type: 1, createdAt: -1 });

/**
 * Helper methods cho dễ sử dụng
 */

// Check xem có phải material request không
UnifiedRequestSchema.methods.isMaterialRequest = function () {
  return this.type === "Cấp phát vật tư" || this.type === "Sửa chữa vật tư";
};

// Check xem có phải general request không
UnifiedRequestSchema.methods.isGeneralRequest = function () {
  return !this.isMaterialRequest();
};

// Check xem có thể handle không (chỉ material request & approved)
UnifiedRequestSchema.methods.canHandle = function () {
  return this.isMaterialRequest() && this.status === "Chấp thuận";
};

// Check xem có thể complete không (chỉ material request & handling)
UnifiedRequestSchema.methods.canComplete = function () {
  return this.isMaterialRequest() && this.status === "Đang xử lý";
};

export const RequestUnified =
  mongoose.models.RequestUnified ||
  mongoose.model("RequestUnified", UnifiedRequestSchema);
