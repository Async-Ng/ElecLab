import mongoose from 'mongoose';
import { Room } from '@/types/room';

const roomSchema = new mongoose.Schema<Room>(
  {
    id: {
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
    users_manage: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const RoomModel = mongoose.models.Room || mongoose.model<Room>('Room', roomSchema);
