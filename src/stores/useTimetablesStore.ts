import { create } from "zustand";
import { Timetable } from "@/types/timetable";
import { getApiEndpoint, authFetch } from "@/lib/apiClient";

interface TimetablesState {
  timetables: Timetable[];
  loading: boolean;
  lastFetch: number | null;
  fetchTimetables: (
    userId: string,
    userRole: string | string[],
    force?: boolean,
    forceUserEndpoint?: boolean
  ) => Promise<void>;
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

  fetchTimetables: async (
    userId: string,
    userRole: string | string[],
    force = false,
    forceUserEndpoint = false
  ) => {
    const { loading } = get();

    if (loading) return;

    set({ loading: true });
    try {
      const endpoint = getApiEndpoint(
        "timetables",
        userRole,
        forceUserEndpoint
      );

      console.log("Fetching timetables:", {
        userId,
        userRole,
        endpoint,
        forceUserEndpoint,
      });

      const response = await authFetch(endpoint, userId, userRole);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch timetables:", {
          status: response.status,
          statusText: response.statusText,
          endpoint,
          error: errorData,
        });
        throw new Error(
          errorData.message || `Failed to fetch timetables: ${response.status}`
        );
      }
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
        lastFetch: Date.now(),
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
