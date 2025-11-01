import { create } from "zustand";
import { User } from "@/types/user";
import { cachedFetch } from "@/lib/requestCache";

interface UsersState {
  users: User[];
  loading: boolean;
  lastFetch: number | null;
  fetchUsers: (force?: boolean) => Promise<void>;
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

  fetchUsers: async (force = false) => {
    const { loading } = get();

    // Prevent duplicate fetches
    if (loading) return;

    set({ loading: true });
    try {
      // Sử dụng cachedFetch để tự động deduplicate và cache
      const data = await cachedFetch("/api/users", {
        skipCache: force,
        cacheDuration: CACHE_DURATION,
      });

      set({
        users: Array.isArray(data) ? data : [],
        lastFetch: Date.now(),
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ loading: false });
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
