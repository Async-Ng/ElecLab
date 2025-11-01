import { useEffect, useRef } from "react";
import { useTimetablesStore } from "@/stores/useTimetablesStore";
import { useAuth } from "@/hooks/useAuth";

interface UseTimetablesOptions {
  autoFetch?: boolean;
  forceUserEndpoint?: boolean; // Force dùng user endpoint ngay cả khi có admin role
}

/**
 * Custom hook to manage timetables data with automatic fetching and caching
 * @param options - Configuration options for auto-fetching
 * @returns Timetables store state and actions
 */
export const useTimetables = (options: UseTimetablesOptions = {}) => {
  const { autoFetch = true, forceUserEndpoint = false } = options;
  const { user } = useAuth();
  const store = useTimetablesStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (autoFetch && !hasFetched.current && user?._id && user?.roles) {
      hasFetched.current = true;
      store.fetchTimetables(user._id, user.roles, false, forceUserEndpoint);
    }
  }, [autoFetch, user?._id, user?.roles, store, forceUserEndpoint]);

  return store;
};
