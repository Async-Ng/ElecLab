export enum UserRole {
  User = "User",
  Admin = "Admin",
}

// Display names for roles (UI)
export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.User]: "Người dùng",
  [UserRole.Admin]: "Quản lý",
};

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
