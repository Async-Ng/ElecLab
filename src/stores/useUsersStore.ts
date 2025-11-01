import { create } from 'zustand';
import { User } from '@/types/user';

interface UsersState {
  users: User[];
  loading: boolean;
  lastFetch: number | null;
  fetchUsers: () => Promise<void>;
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

  fetchUsers: async () => {
    const { lastFetch, loading } = get();
    const now = Date.now();

    // Check if cache is still valid
    if (lastFetch && now - lastFetch < CACHE_DURATION && !loading) {
      return; // Use cached data
    }

    // Prevent duplicate fetches
    if (loading) return;

    set({ loading: true });
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      set({
        users: Array.isArray(data) ? data : [],
        lastFetch: now,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
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
