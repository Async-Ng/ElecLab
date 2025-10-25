import { User } from "./user";
export interface Room {
  _id?: string;
  room_id: string;
  name: string;
  location: string;
  users_manage: User[];
}
