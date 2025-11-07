import { create } from "zustand";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import { getApiEndpoint, authFetch } from "@/lib/apiClient";

interface RoomsState {
  rooms: (Room & { users_manage?: User[] })[];
  loading: boolean;
  lastFetch: number | null;
  fetchRooms: (
    userId: string,
    userRole: string | string[],
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

  fetchRooms: async (
    userId: string,
    userRole: string | string[],
    force = false
  ) => {
    const { loading } = get();

    if (loading) return;

    set({ loading: true });
    try {
      const endpoint = getApiEndpoint("rooms", userRole);

      const response = await authFetch(endpoint, userId, userRole);
      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }
      const data = await response.json();

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
      set({ rooms: [], loading: false });
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
