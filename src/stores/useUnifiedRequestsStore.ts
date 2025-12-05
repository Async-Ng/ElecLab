/**
 * Unified Requests Store (Zustand)
 * Kết hợp cả useRequestsStore + useMaterialRequestStore
 *
 * Features:
 * - Auto-fetch with caching (5 minutes)
 * - Support type filtering
 * - Status filtering
 * - Role-based API endpoint selection
 * - CRUD operations
 */

import { create } from "zustand";
import {
  IUnifiedRequest,
  UnifiedRequestType,
  UnifiedRequestStatus,
  GENERAL_REQUEST_TYPES,
  MATERIAL_REQUEST_TYPES,
} from "@/types/unifiedRequest";
import { getApiEndpoint, authFetch } from "@/lib/apiClient";

interface UnifiedRequestsState {
  requests: IUnifiedRequest[];
  loading: boolean;
  lastFetch: number | null;
  error: string | null;

  // Fetch all requests
  fetchRequests: (
    userId: string,
    userRole: string | string[],
    force?: boolean
  ) => Promise<void>;

  // Fetch with filters
  fetchRequestsByType: (
    type: UnifiedRequestType,
    userId: string,
    userRole: string | string[]
  ) => Promise<void>;

  fetchRequestsByStatus: (
    status: UnifiedRequestStatus,
    userId: string,
    userRole: string | string[]
  ) => Promise<void>;

  // Mutations
  addRequest: (request: IUnifiedRequest) => void;
  updateRequest: (id: string, request: Partial<IUnifiedRequest>) => void;
  deleteRequest: (id: string) => void;
  setRequests: (requests: IUnifiedRequest[]) => void;

  // Selectors
  getGeneralRequests: () => IUnifiedRequest[];
  getMaterialRequests: () => IUnifiedRequest[];
  getRequestsByType: (type: UnifiedRequestType) => IUnifiedRequest[];
  getRequestsByStatus: (status: UnifiedRequestStatus) => IUnifiedRequest[];
  getPendingRequests: () => IUnifiedRequest[];
  getMyRequests: (userId: string) => IUnifiedRequest[];

  // Reset
  reset: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUnifiedRequestsStore = create<UnifiedRequestsState>(
  (set, get) => ({
    requests: [],
    loading: false,
    lastFetch: null,
    error: null,

    // ============== Fetch Methods ==============

    fetchRequests: async (
      userId: string,
      userRole: string | string[],
      force = false
    ) => {
      const { lastFetch, loading } = get();
      const now = Date.now();

      // Check cache
      if (!force && lastFetch && now - lastFetch < CACHE_DURATION && !loading) {
        return;
      }

      if (loading) return;

      set({ loading: true, error: null });
      try {
        // Try unified API first, fall back to old APIs if needed
        const endpoint = "/api/unified-requests";
        const response = await authFetch(endpoint, userId, userRoles);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to fetch requests: ${response.status}`
          );
        }

        const data = await response.json();
        const requests = Array.isArray(data.data) ? data.data : [];

        set({
          requests,
          lastFetch: now,
          loading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        set({ loading: false, error: errorMessage });
      }
    },

    fetchRequestsByType: async (
      type: UnifiedRequestType,
      userId: string,
      userRole: string | string[]
    ) => {
      set({ loading: true, error: null });
      try {
        const endpoint = `/api/unified-requests?type=${encodeURIComponent(
          type
        )}`;
        const response = await authFetch(endpoint, userId, userRole);

        if (!response.ok) {
          throw new Error("Failed to fetch requests by type");
        }

        const data = await response.json();
        const requests = Array.isArray(data.data) ? data.data : [];

        set({
          requests,
          loading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        set({ loading: false, error: errorMessage });
      }
    },

    fetchRequestsByStatus: async (
      status: UnifiedRequestStatus,
      userId: string,
      userRole: string | string[]
    ) => {
      set({ loading: true, error: null });
      try {
        const endpoint = `/api/unified-requests?status=${encodeURIComponent(
          status
        )}`;
        const response = await authFetch(endpoint, userId, userRole);

        if (!response.ok) {
          throw new Error("Failed to fetch requests by status");
        }

        const data = await response.json();
        const requests = Array.isArray(data.data) ? data.data : [];

        set({
          requests,
          loading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        set({ loading: false, error: errorMessage });
      }
    },

    // ============== Mutations ==============

    addRequest: (request) => {
      set((state) => ({
        requests: [request, ...state.requests],
      }));
    },

    updateRequest: (id, updatedData) => {
      set((state) => ({
        requests: state.requests.map((req) =>
          req._id === id ? { ...req, ...updatedData } : req
        ),
      }));
    },

    deleteRequest: (id) => {
      set((state) => ({
        requests: state.requests.filter((req) => req._id !== id),
      }));
    },

    setRequests: (requests) => {
      set({ requests });
    },

    // ============== Selectors ==============

    getGeneralRequests: () => {
      const { requests } = get();
      return requests.filter((req) => GENERAL_REQUEST_TYPES.includes(req.type));
    },

    getMaterialRequests: () => {
      const { requests } = get();
      return requests.filter((req) =>
        MATERIAL_REQUEST_TYPES.includes(req.type)
      );
    },

    getRequestsByType: (type) => {
      const { requests } = get();
      return requests.filter((req) => req.type === type);
    },

    getRequestsByStatus: (status) => {
      const { requests } = get();
      return requests.filter((req) => req.status === status);
    },

    getPendingRequests: () => {
      const { requests } = get();
      return requests.filter((req) => req.status === "Chờ duyệt");
    },

    getMyRequests: (userId) => {
      const { requests } = get();
      return requests.filter(
        (req) => req.requester._id === userId || req.requester._id === userId
      );
    },

    // ============== Reset ==============

    reset: () => {
      set({
        requests: [],
        loading: false,
        lastFetch: null,
        error: null,
      });
    },
  })
);

// ============== Export helpful constants ==============

export const useUnifiedRequestsActions = () => {
  const store = useUnifiedRequestsStore();
  return {
    fetch: store.fetchRequests,
    fetchByType: store.fetchRequestsByType,
    fetchByStatus: store.fetchRequestsByStatus,
    add: store.addRequest,
    update: store.updateRequest,
    delete: store.deleteRequest,
    reset: store.reset,
  };
};

export const useUnifiedRequestsSelectors = () => {
  const store = useUnifiedRequestsStore();
  return {
    all: () => store.requests,
    general: store.getGeneralRequests,
    material: store.getMaterialRequests,
    byType: store.getRequestsByType,
    byStatus: store.getRequestsByStatus,
    pending: store.getPendingRequests,
    myRequests: store.getMyRequests,
    isLoading: () => store.loading,
    error: () => store.error,
  };
};
