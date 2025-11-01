import { useEffect, useRef } from "react";
import { useTeachingLogsStore } from "@/stores/useTeachingLogsStore";
import { useAuth } from "@/hooks/useAuth";

interface UseTeachingLogsOptions {
  autoFetch?: boolean;
  lessonId?: string;
}

/**
 * Custom hook to manage teaching logs data with automatic fetching and caching
 * @param options - Configuration options for auto-fetching
 * @returns Teaching logs store state and actions
 */
export const useTeachingLogs = (options: UseTeachingLogsOptions = {}) => {
  const { autoFetch = true, lessonId } = options;
  const { user } = useAuth();
  const store = useTeachingLogsStore();
  const hasFetched = useRef(false);
  const prevLessonId = useRef(lessonId);

  useEffect(() => {
    if (!autoFetch || !user?._id) return;

    const lessonIdChanged = prevLessonId.current !== lessonId;

    if (!hasFetched.current || lessonIdChanged) {
      hasFetched.current = true;
      prevLessonId.current = lessonId;
      store.fetchTeachingLogs(user._id, user.roles, false, lessonId);
    }
  }, [autoFetch, user, lessonId, store]);

  return store;
};
