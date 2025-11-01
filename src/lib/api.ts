/**
 * Server-side API utilities for SSR data fetching
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Fetch materials data on server side
 */
export async function fetchMaterialsSSR() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/materials`, {
      cache: "no-store", // Always get fresh data
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch materials");
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("SSR fetch materials error:", error);
    return [];
  }
}

/**
 * Fetch users data on server side
 */
export async function fetchUsersSSR() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("SSR fetch users error:", error);
    return [];
  }
}

/**
 * Fetch rooms data on server side
 */
export async function fetchRoomsSSR() {
  try {
    const [roomsRes, usersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/rooms`, {
        cache: "no-store",
        next: { revalidate: 0 },
      }),
      fetch(`${API_BASE_URL}/api/users`, {
        cache: "no-store",
        next: { revalidate: 0 },
      }),
    ]);

    if (!roomsRes.ok) {
      throw new Error("Failed to fetch rooms");
    }

    const roomsData = await roomsRes.json();
    const usersData = usersRes.ok ? await usersRes.json() : [];

    return {
      rooms: roomsData.rooms || [],
      users: Array.isArray(usersData) ? usersData : [],
    };
  } catch (error) {
    console.error("SSR fetch rooms error:", error);
    return { rooms: [], users: [] };
  }
}

/**
 * Fetch timetables data on server side
 */
export async function fetchTimetablesSSR() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/timetables`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch timetables");
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("SSR fetch timetables error:", error);
    return [];
  }
}

/**
 * Fetch teaching logs data on server side
 */
export async function fetchTeachingLogsSSR() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/teaching-logs`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch teaching logs");
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("SSR fetch teaching logs error:", error);
    return [];
  }
}
