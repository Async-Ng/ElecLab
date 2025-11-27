import { useEffect, useRef } from "react";
import { useTimetablesStore } from "@/stores/useTimetablesStore";

interface UseTimetablesOptions {
  userRole?: string;
  userId?: string;
  autoFetch?: boolean;
}

/**
 * Custom hook to manage timetables data with automatic fetching and caching
 * @param options - Configuration options for filtering and auto-fetching
 * @returns Timetables store state and actions
 */
export const useTimetables = (options: UseTimetablesOptions = {}) => {
  const { userRole, userId, autoFetch = true } = options;
  const store = useTimetablesStore();
  const hasFetched = useRef(false);
  const prevParams = useRef({ userRole, userId });

  useEffect(() => {
    if (!autoFetch) return;

    // Don't fetch if we don't have required parameters
    if (!userId || !userRole) return;

    const paramsChanged =
      prevParams.current.userRole !== userRole ||
      prevParams.current.userId !== userId;

    if (!hasFetched.current || paramsChanged) {
      hasFetched.current = true;
      prevParams.current = { userRole, userId };
      // Force refresh when parameters change to bypass cache
      store.fetchTimetables(userId, userRole, paramsChanged);
    }
  }, [userRole, userId, autoFetch, store]);

  return store;
};
