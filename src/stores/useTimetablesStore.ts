import { create } from "zustand";
import { Timetable } from "@/types/timetable";

interface TimetablesState {
  timetables: Timetable[];
  loading: boolean;
  lastFetch: number | null;
  fetchTimetables: (userRole?: string, userId?: string) => Promise<void>;
  addTimetable: (timetable: Timetable) => void;
  updateTimetable: (id: string, timetable: Partial<Timetable>) => void;
  deleteTimetable: (id: string) => void;
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useTimetablesStore = create<TimetablesState>((set, get) => ({
  timetables: [],
  loading: false,
  lastFetch: null,

  fetchTimetables: async (userRole?: string, userId?: string) => {
    const { lastFetch, loading } = get();
    const now = Date.now();

    if (lastFetch && now - lastFetch < CACHE_DURATION && !loading) {
      return;
    }

    if (loading) return;

    set({ loading: true });
    try {
      let url = "/api/timetables";
      const params = new URLSearchParams();
      if (userRole) params.append("userRole", userRole);
      if (userId) params.append("userId", userId);
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch timetables");
      const data = await response.json();

      const processedData = Array.isArray(data)
        ? data.map((timetable) => ({
            ...timetable,
            users_taught: Array.isArray(timetable.users_taught)
              ? timetable.users_taught.filter(
                  (user: unknown) => typeof user === "object" && user !== null
                )
              : [],
          }))
        : [];

      set({
        timetables: processedData,
        lastFetch: now,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching timetables:", error);
      set({ loading: false });
    }
  },

  addTimetable: (timetable) => {
    set((state) => ({
      timetables: [...state.timetables, timetable],
    }));
  },

  updateTimetable: (id, updatedTimetable) => {
    set((state) => ({
      timetables: state.timetables.map((timetable) =>
        timetable._id === id ? { ...timetable, ...updatedTimetable } : timetable
      ),
    }));
  },

  deleteTimetable: (id) => {
    set((state) => ({
      timetables: state.timetables.filter((timetable) => timetable._id !== id),
    }));
  },

  reset: () => {
    set({
      timetables: [],
      loading: false,
      lastFetch: null,
    });
  },
}));
