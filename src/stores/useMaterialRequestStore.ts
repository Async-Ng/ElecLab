import { create } from "zustand";
import {
  IMaterialRequest,
  CreateMaterialRequestPayload,
  ReviewMaterialRequestPayload,
  HandleMaterialRequestPayload,
  CompleteMaterialRequestPayload,
} from "@/types/materialRequest";

interface MaterialRequestStore {
  requests: IMaterialRequest[];
  loading: boolean;
  error: string | null;

  // User actions
  fetchMyRequests: () => Promise<void>;
  createRequest: (payload: CreateMaterialRequestPayload) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;

  // Admin/Staff actions
  fetchAllRequests: () => Promise<void>;
  fetchPendingRequests: () => Promise<void>;
  fetchByStatus: (status: string) => Promise<void>;
  reviewRequest: (
    id: string,
    payload: ReviewMaterialRequestPayload
  ) => Promise<void>;
  handleRequest: (
    id: string,
    payload: HandleMaterialRequestPayload
  ) => Promise<void>;
  completeRequest: (
    id: string,
    payload: CompleteMaterialRequestPayload
  ) => Promise<void>;

  // UI state
  setError: (error: string | null) => void;
}

export const useMaterialRequestStore = create<MaterialRequestStore>((set) => ({
  requests: [],
  loading: false,
  error: null,

  setError: (error) => set({ error }),

  fetchMyRequests: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/material-requests/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/material-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      throw error;
    }
  },

  deleteRequest: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/material-requests/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
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
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/material-requests?admin=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/material-requests?status=pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Không thể tải yêu cầu chờ duyệt");
      const data = await response.json();
      set({ requests: data, loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Lỗi không xác định";
      set({ error: message, loading: false });
    }
  },

  fetchByStatus: async (status) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/material-requests?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Không thể tải yêu cầu");
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
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/material-requests/${id}/review`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
      throw error;
    }
  },

  handleRequest: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/material-requests/${id}/handle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Không thể cập nhật yêu cầu");
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
      throw error;
    }
  },

  completeRequest: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/material-requests/${id}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Không thể hoàn thành yêu cầu");
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
      throw error;
    }
  },
}));
