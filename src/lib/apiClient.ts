/**
 * Helper function to create fetch options with authentication headers
 * Note: Headers must be ISO-8859-1 encoded, so we base64 encode the userRole
 * to support Vietnamese characters like "Quản lý"
 */
export function createAuthHeaders(
  userId: string,
  userRole: string | string[]
): HeadersInit {
  // Base64 encode userRole to avoid ISO-8859-1 encoding issues with Vietnamese characters
  const roleString = JSON.stringify(userRole);
  const encodedRole =
    typeof window !== "undefined"
      ? btoa(unescape(encodeURIComponent(roleString)))
      : Buffer.from(roleString).toString("base64");

  return {
    "Content-Type": "application/json",
    "x-user-id": userId,
    "x-user-role": encodedRole,
  };
}

/**
 * Fetch wrapper with authentication headers
 */
export async function authFetch(
  url: string,
  userId: string,
  userRole: string | string[],
  options?: RequestInit
): Promise<Response> {
  const headers = createAuthHeaders(userId, userRole);

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });
}

/**
 * Check if user has admin role
 */
export function isAdmin(userRole: string | string[]): boolean {
  const ADMIN_ROLES = ["Admin"];

  if (Array.isArray(userRole)) {
    return userRole.some((role) => ADMIN_ROLES.includes(role));
  }

  return ADMIN_ROLES.includes(userRole);
}

/**
 * Get API endpoint based on user role
 * @param resource - The resource name (e.g., 'timetables', 'materials')
 * @param userRole - User's role(s)
 * @param forceUserEndpoint - Force use of user endpoint even if user has admin role
 */
export function getApiEndpoint(
  resource: string,
  userRole: string | string[],
  forceUserEndpoint = false
): string {
  const rolePrefix = !forceUserEndpoint && isAdmin(userRole) ? "admin" : "user";
  return `/api/${rolePrefix}/${resource}`;
}
