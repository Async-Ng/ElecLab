import { create } from "zustand";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import { cachedFetch } from "@/lib/requestCache";

interface RoomsState {
  rooms: (Room & { users_manage?: User[] })[];
  loading: boolean;
  lastFetch: number | null;
  fetchRooms: (
    userRole?: string,
    userId?: string,
    force?: boolean
  ) => Promise<void>;
  addRoom: (room: Room & { users_manage?: User[] }) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useRoomsStore = create<RoomsState>((set, get) => ({
  rooms: [],
  loading: false,
  lastFetch: null,

  fetchRooms: async (userRole?: string, userId?: string, force = false) => {
    const { loading } = get();

    if (loading) return;

    set({ loading: true });
    try {
      const params = new URLSearchParams();
      if (userRole) params.append("userRole", userRole);
      if (userId) params.append("userId", userId);

      // Sử dụng cachedFetch để tự động deduplicate và cache
      const data = await cachedFetch(`/api/rooms?${params.toString()}`, {
        skipCache: force,
        cacheDuration: CACHE_DURATION,
      });

      const roomsData = Array.isArray(data.rooms) ? data.rooms : [];
      const roomsWithUsers = roomsData.map((room: any) => ({
        ...room,
        users_manage: Array.isArray(room.users_manage)
          ? room.users_manage.filter((u: any) => typeof u === "object")
          : [],
      }));

      set({
        rooms: roomsWithUsers,
        lastFetch: Date.now(),
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching rooms:", error);
      set({ loading: false });
    }
  },

  addRoom: (room) => {
    set((state) => ({
      rooms: [...state.rooms, room],
    }));
  },

  updateRoom: (id, updatedRoom) => {
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room._id === id ? { ...room, ...updatedRoom } : room
      ),
    }));
  },

  deleteRoom: (id) => {
    set((state) => ({
      rooms: state.rooms.filter((room) => room._id !== id),
    }));
  },

  reset: () => {
    set({
      rooms: [],
      loading: false,
      lastFetch: null,
    });
  },
}));
