import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Tài liệu", "Phòng học", "Lịch dạy", "Khác"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["Thấp", "Trung bình", "Cao"],
      default: "Trung bình",
    },
    status: {
      type: String,
      enum: ["Chờ duyệt", "Chấp thuận", "Từ chối"],
      default: "Chờ duyệt",
    },
    attachments: [
      {
        fileName: String,
        fileSize: Number,
        fileType: String,
      },
    ],
    adminNote: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RequestSchema.index({ user: 1 });
RequestSchema.index({ status: 1 });
RequestSchema.index({ createdAt: -1 });
RequestSchema.index({ user: 1, status: 1 });

export default mongoose.models.Request ||
  mongoose.model("Request", RequestSchema);
