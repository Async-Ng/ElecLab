
export enum UserRole {
  User = "Người dùng",
  Admin = "Quản lý",
}


export interface User {
  _id?: string;
  staff_id: string;
  name: string;
  email: string;
  password: string;
  roles: UserRole[];
  rooms_manage: string[];
  avatar?: string;
  position?: string;
}

export interface UserFormData extends Omit<User, "_id"> {}
