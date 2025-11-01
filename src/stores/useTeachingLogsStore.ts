import { create } from "zustand";
import { TeachingLog } from "@/types/teachingLog";

interface TeachingLogsState {
  teachingLogs: TeachingLog[];
  loading: boolean;
  lastFetch: number | null;
  fetchTeachingLogs: (
    userId?: string,
    force?: boolean,
    isAdmin?: boolean
  ) => Promise<void>;
  addTeachingLog: (teachingLog: TeachingLog) => void;
  updateTeachingLog: (id: string, teachingLog: Partial<TeachingLog>) => void;
  deleteTeachingLog: (id: string) => void;
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useTeachingLogsStore = create<TeachingLogsState>((set, get) => ({
  teachingLogs: [],
  loading: false,
  lastFetch: null,

  fetchTeachingLogs: async (
    userId?: string,
    force = false,
    isAdmin = false
  ) => {
    const { lastFetch, loading } = get();
    const now = Date.now();

    if (!force && lastFetch && now - lastFetch < CACHE_DURATION && !loading) {
      return;
    }

    if (loading) return;

    set({ loading: true });
    try {
      let url = "/api/teaching-logs";
      const params = new URLSearchParams();

      // Nếu là Admin thì không truyền userId để lấy toàn bộ logs
      if (!isAdmin && userId) {
        params.append("userId", userId);
        params.append("userRole", "User");
      } else if (isAdmin) {
        params.append("userRole", "Admin");
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch teaching logs");
      const data = await response.json();

      const processedData = Array.isArray(data)
        ? data.map((log) => ({
            ...log,
            user:
              typeof log.user === "object" && log.user !== null
                ? log.user
                : undefined,
            timetable:
              typeof log.timetable === "object" && log.timetable !== null
                ? log.timetable
                : undefined,
          }))
        : [];

      set({
        teachingLogs: processedData,
        lastFetch: now,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching teaching logs:", error);
      set({ loading: false });
    }
  },

  addTeachingLog: (teachingLog) => {
    set((state) => ({
      teachingLogs: [...state.teachingLogs, teachingLog],
    }));
  },

  updateTeachingLog: (id, updatedTeachingLog) => {
    set((state) => ({
      teachingLogs: state.teachingLogs.map((log) =>
        log._id === id ? { ...log, ...updatedTeachingLog } : log
      ),
    }));
  },

  deleteTeachingLog: (id) => {
    set((state) => ({
      teachingLogs: state.teachingLogs.filter((log) => log._id !== id),
    }));
  },

  reset: () => {
    set({
      teachingLogs: [],
      loading: false,
      lastFetch: null,
    });
  },
}));
