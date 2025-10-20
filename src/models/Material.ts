import { Schema, model, models } from "mongoose";

const MaterialSchema = new Schema(
  {
    material_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, default: "available" },
    place_used: { type: String },
  },
  { timestamps: true }
);

export const Material = models.Material || model("Material", MaterialSchema);
