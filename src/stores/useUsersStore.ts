import { create } from "zustand";
import { User } from "@/types/user";
import { getApiEndpoint, authFetch, isAdmin } from "@/lib/apiClient";

interface UsersState {
  users: User[];
  loading: boolean;
  lastFetch: number | null;
  fetchUsers: (
    userId: string,
    userRole: string | string[],
    force?: boolean
  ) => Promise<void>;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  lastFetch: null,

  fetchUsers: async (
    userId: string,
    userRole: string | string[],
    force = false
  ) => {
    const { loading } = get();

    // Prevent duplicate fetches
    if (loading) return;

    // Chỉ admin mới có quyền fetch danh sách users
    // User thường không có endpoint /api/user/users
    if (!isAdmin(userRole)) {
      console.log("User is not admin, skipping users fetch");
      set({ users: [], loading: false, lastFetch: null });
      return;
    }

    set({ loading: true });
    try {
      const endpoint = getApiEndpoint("users", userRole);

      const response = await authFetch(endpoint, userId, userRole);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();

      set({
        users: Array.isArray(data) ? data : [],
        lastFetch: Date.now(),
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ users: [], loading: false });
    }
  },

  addUser: (user) => {
    set((state) => ({
      users: [...state.users, user],
    }));
  },

  updateUser: (id, updatedUser) => {
    set((state) => ({
      users: state.users.map((user) =>
        user._id === id ? { ...user, ...updatedUser } : user
      ),
    }));
  },

  deleteUser: (id) => {
    set((state) => ({
      users: state.users.filter((user) => user._id !== id),
    }));
  },

  reset: () => {
    set({
      users: [],
      loading: false,
      lastFetch: null,
    });
  },
}));
