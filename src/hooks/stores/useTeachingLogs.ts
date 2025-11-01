import { useEffect, useRef } from "react";
import { useTeachingLogsStore } from "@/stores/useTeachingLogsStore";

interface UseTeachingLogsOptions {
  userId?: string;
  autoFetch?: boolean;
  isAdmin?: boolean;
}

/**
 * Custom hook to manage teaching logs data with automatic fetching and caching
 * @param options - Configuration options for filtering and auto-fetching
 * @returns Teaching logs store state and actions
 */
export const useTeachingLogs = (options: UseTeachingLogsOptions = {}) => {
  const { userId, autoFetch = true, isAdmin = false } = options;
  const store = useTeachingLogsStore();
  const hasFetched = useRef(false);
  const prevUserId = useRef(userId);
  const prevIsAdmin = useRef(isAdmin);

  useEffect(() => {
    if (!autoFetch) return;

    const userIdChanged = prevUserId.current !== userId;
    const isAdminChanged = prevIsAdmin.current !== isAdmin;

    if (!hasFetched.current || userIdChanged || isAdminChanged) {
      hasFetched.current = true;
      prevUserId.current = userId;
      prevIsAdmin.current = isAdmin;
      store.fetchTeachingLogs(userId, false, isAdmin);
    }
  }, [userId, autoFetch, isAdmin, store]);

  return store;
};
