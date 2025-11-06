import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    staff_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      required: true,
      enum: ["User", "Admin"],
      validate: {
        validator: function (roles: string[]) {
          return roles.every((role) => ["User", "Admin"].includes(role));
        },
        message: 'Vai trò không hợp lệ. Vai trò phải là "User" hoặc "Admin"',
      },
    },
    rooms_manage: {
      type: [String],
      default: [],
    },
    avatar: {
      type: Buffer,
      default: null,
    },
    position: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Tối ưu: Thêm indexes cho các trường thường query
// Note: staff_id và email đã có unique:true nên tự động có index
userSchema.index({ roles: 1 });

// Middleware: Hash password trước khi save
userSchema.pre("save", async function (next) {
  // Chỉ hash nếu password được modify
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Kiểm tra password có phải đã là hash hay không (hash thường bắt đầu với $2)
    if (this.password && this.password.startsWith("$2")) {
      // Đã là hash rồi, không cần hash lại
      return next();
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
