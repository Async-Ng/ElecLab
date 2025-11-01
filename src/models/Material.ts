import { Schema, model, models } from "mongoose";
import { MaterialCategory, MaterialStatus } from "@/types/material";
const MaterialSchema = new Schema(
  {
    material_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: Object.values(MaterialCategory),
    },
    status: {
      type: String,
      default: Object.values(MaterialStatus)[0] as string,
      enum: Object.values(MaterialStatus),
    },
    place_used: { type: Schema.Types.ObjectId, ref: "Room" },
  },
  { timestamps: true }
);

// Tối ưu: Thêm indexes cho các trường thường query
// Note: material_id đã có unique:true nên tự động có index
MaterialSchema.index({ category: 1 });
MaterialSchema.index({ status: 1 });
MaterialSchema.index({ place_used: 1 });

export const Material = models.Material || model("Material", MaterialSchema);
