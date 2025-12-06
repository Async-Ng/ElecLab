import { useEffect, useRef } from "react";
import { useUsersStore } from "@/stores/useUsersStore";
import { useAuth } from "@/hooks/useAuth";

/**
 * Custom hook to manage users data with automatic fetching and caching
 * @returns Users store state and actions
 */
export const useUsers = () => {
  const { user } = useAuth();
  const store = useUsersStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (
      !hasFetched.current &&
      user?._id &&
      user?.roles &&
      user.roles.length > 0
    ) {
      hasFetched.current = true;
      store.fetchUsers(user._id, user.roles);
    }
  }, [user, store]);

  return store;
};
