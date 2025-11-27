import mongoose from "mongoose";

const MaterialRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestType: {
      type: String,
      enum: ["Cấp phát", "Sửa chữa"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Chờ duyệt", "Chấp thuận", "Từ chối", "Đang xử lý", "Hoàn thành"],
      default: "Chờ duyệt",
    },
    // Thông tin vật tư
    materials: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Material",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        reason: {
          type: String,
          required: true,
        },
      },
    ],
    // Thông tin phòng (nếu yêu cầu sửa chữa)
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },
    // Mô tả chi tiết
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Thấp", "Trung bình", "Cao"],
      default: "Trung bình",
    },
    // Thông tin duyệt
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
    // Thông tin xử lý
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    handledAt: {
      type: Date,
      default: null,
    },
    // Thông tin hoàn thành
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
  },
  {
    timestamps: true,
  }
);

// Indexes
MaterialRequestSchema.index({ requester: 1 });
MaterialRequestSchema.index({ status: 1 });
MaterialRequestSchema.index({ requestType: 1 });
MaterialRequestSchema.index({ room: 1 });
MaterialRequestSchema.index({ createdAt: -1 });
MaterialRequestSchema.index({ requester: 1, status: 1 });

export default mongoose.models.MaterialRequest ||
  mongoose.model("MaterialRequest", MaterialRequestSchema);
