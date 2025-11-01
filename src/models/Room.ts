import mongoose from "mongoose";
import { Room } from "@/types/room";

const roomSchema = new mongoose.Schema<Room>(
  {
    room_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    users_manage: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Tối ưu: Thêm indexes cho các trường thường query
// Note: room_id đã có unique:true nên tự động có index
roomSchema.index({ users_manage: 1 });

export const RoomModel =
  mongoose.models.Room || mongoose.model<Room>("Room", roomSchema);
