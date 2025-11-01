import { useEffect, useRef } from "react";
import { useRoomsStore } from "@/stores/useRoomsStore";
import { useAuth } from "@/hooks/useAuth";

interface UseRoomsOptions {
  autoFetch?: boolean;
}

/**
 * Custom hook to manage rooms data with automatic fetching and caching
 * @param options - Configuration options for auto-fetching
 * @returns Rooms store state and actions
 */
export const useRooms = (options: UseRoomsOptions = {}) => {
  const { autoFetch = true } = options;
  const { user } = useAuth();
  const store = useRoomsStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (autoFetch && !hasFetched.current && user?._id && user?.roles) {
      hasFetched.current = true;
      store.fetchRooms(user._id, user.roles);
    }
  }, [autoFetch, user?._id, user?.roles, store]);

  return store;
};
