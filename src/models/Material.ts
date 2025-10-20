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
    place_used: { type: String },
  },
  { timestamps: true }
);

export const Material = models.Material || model("Material", MaterialSchema);
