export enum MaterialCategory {
  EQUIPMENT = "Thiết bị cố định",
  CONSUMABLE = "Vật tư tiêu hao",
}

export enum MaterialStatus {
  AVAILABLE = "Có sẵn",
  IN_USE = "Đang sử dụng",
  BROKEN = "Hư hỏng",
}

import type { Room } from "./room";

export type Material = {
  _id?: string;
  material_id: string;
  name: string;
  category: MaterialCategory;
  status?: MaterialStatus;
  place_used?: string | Room;
};
