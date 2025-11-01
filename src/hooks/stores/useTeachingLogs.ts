import { useEffect, useRef } from "react";
import { useTeachingLogsStore } from "@/stores/useTeachingLogsStore";

interface UseTeachingLogsOptions {
  userId?: string;
  autoFetch?: boolean;
}

/**
 * Custom hook to manage teaching logs data with automatic fetching and caching
 * @param options - Configuration options for filtering and auto-fetching
 * @returns Teaching logs store state and actions
 */
export const useTeachingLogs = (options: UseTeachingLogsOptions = {}) => {
  const { userId, autoFetch = true } = options;
  const store = useTeachingLogsStore();
  const hasFetched = useRef(false);
  const prevUserId = useRef(userId);

  useEffect(() => {
    if (!autoFetch) return;

    const userIdChanged = prevUserId.current !== userId;

    if (!hasFetched.current || userIdChanged) {
      hasFetched.current = true;
      prevUserId.current = userId;
      store.fetchTeachingLogs(userId);
    }
  }, [userId, autoFetch, store]);

  return store;
};
