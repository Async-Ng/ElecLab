import { useEffect, useRef } from "react";
import { useMaterialsStore } from "@/stores/useMaterialsStore";
import { useAuth } from "@/hooks/useAuth";

interface UseMaterialsOptions {
  autoFetch?: boolean;
}

/**
 * Custom hook to manage materials data with automatic fetching and caching
 * @param options - Configuration options for auto-fetching
 * @returns Materials store state and actions
 */
export const useMaterials = (options: UseMaterialsOptions = {}) => {
  const { autoFetch = true } = options;
  const { user } = useAuth();
  const store = useMaterialsStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (autoFetch && !hasFetched.current && user?._id) {
      hasFetched.current = true;
      store.fetchMaterials(user._id, user.roles);
    }
  }, [autoFetch, user, store]);

  return store;
};
