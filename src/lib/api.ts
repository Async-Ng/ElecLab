/**
 * Server-side API utilities for SSR data fetching
 */

// Get the base URL - works in both dev and production
function getBaseUrl() {
  // In production (Vercel), use the deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Custom production URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // In development, use localhost
  return "http://localhost:3000";
}

const API_BASE_URL = getBaseUrl();

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
    return [];
  }
}
