export enum UserRole {
  Head_of_deparment = "Trưởng bộ môn",
  Lecture = "Giảng viên",
}

export interface User {
  _id?: string;
  staff_id: string;
  name: string;
  email: string;
  password: string;
  roles: string[];
  rooms_manage: string[];
}

export interface UserFormData extends Omit<User, "_id"> {}
