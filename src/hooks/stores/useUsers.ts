import { useEffect, useRef } from 'react';
import { useUsersStore } from '@/stores/useUsersStore';

/**
 * Custom hook to manage users data with automatic fetching and caching
 * @returns Users store state and actions
 */
export const useUsers = () => {
  const store = useUsersStore();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      store.fetchUsers();
    }
  }, [store]);

  return store;
};
