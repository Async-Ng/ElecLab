import { useEffect, useRef } from "react";
import { useRoomsStore } from "@/stores/useRoomsStore";

interface UseRoomsOptions {
  userRole?: string;
  userId?: string;
  autoFetch?: boolean;
}

/**
 * Custom hook to manage rooms data with automatic fetching and caching
 * @param options - Configuration options for filtering and auto-fetching
 * @returns Rooms store state and actions
 */
export const useRooms = (options: UseRoomsOptions = {}) => {
  const { userRole, userId, autoFetch = true } = options;
  const store = useRoomsStore();
  const hasFetched = useRef(false);
  const prevParams = useRef({ userRole, userId });

  useEffect(() => {
    if (!autoFetch) return;

    const paramsChanged =
      prevParams.current.userRole !== userRole ||
      prevParams.current.userId !== userId;

    if (!hasFetched.current || paramsChanged) {
      hasFetched.current = true;
      prevParams.current = { userRole, userId };
      store.fetchRooms(userRole, userId);
    }
  }, [userRole, userId, autoFetch, store]);

  return store;
};
