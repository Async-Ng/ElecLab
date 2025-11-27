import { create } from "zustand";
import {
  IRequest,
  CreateRequestPayload,
  ReviewRequestPayload,
} from "@/types/request";

interface RequestStore {
  requests: IRequest[];
  loading: boolean;
  error: string | null;

  // User actions
  fetchMyRequests: () => Promise<void>;
  createRequest: (payload: CreateRequestPayload) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;

  // Admin actions
  fetchAllRequests: () => Promise<void>;
  reviewRequest: (id: string, payload: ReviewRequestPayload) => Promise<void>;
  fetchPendingRequests: () => Promise<void>;

  // UI state
  setError: (error: string | null) => void;
}

export const useRequestsStore = create<RequestStore>((set, get) => ({
  requests: [],
  loading: false,
  error: null,

  setError: (error) => set({ error }),

  fetchMyRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/requests/my-requests");
      if (!response.ok) throw new Error("Không thể tải yêu cầu của bạn");
      const data = await response.json();
      set({ requests: data, loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      set({ error: message, loading: false });
    }
  },

  createRequest: async (payload) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Không thể tạo yêu cầu");
      const newRequest = await response.json();
      set((state) => ({
        requests: [newRequest, ...state.requests],
        loading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      set({ error: message, loading: false });
    }
  },

  deleteRequest: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Không thể xóa yêu cầu");
      set((state) => ({
        requests: state.requests.filter((r) => r._id !== id),
        loading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      set({ error: message, loading: false });
    }
  },

  fetchAllRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/requests?admin=true");
      if (!response.ok) throw new Error("Không thể tải danh sách yêu cầu");
      const data = await response.json();
      set({ requests: data, loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      set({ error: message, loading: false });
    }
  },

  fetchPendingRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/requests?status=pending");
      if (!response.ok) throw new Error("Không thể tải yêu cầu chờ duyệt");
      const data = await response.json();
      set({ requests: data, loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      set({ error: message, loading: false });
    }
  },

  reviewRequest: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/requests/${id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Không thể duyệt yêu cầu");
      const updatedRequest = await response.json();
      set((state) => ({
        requests: state.requests.map((r) =>
          r._id === id ? updatedRequest : r
        ),
        loading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      set({ error: message, loading: false });
    }
  },
}));
