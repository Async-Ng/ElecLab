import { NextResponse } from "next/server";

export interface AuthContext {
  userId: string;
  userRole: string | string[];
}

/**
 * Extract user authentication context from request headers
 * Note: userRole is base64 encoded to support non-ASCII characters
 */
export function getAuthContext(request: Request): AuthContext | null {
  const userId = request.headers.get("x-user-id");
  const encodedUserRole = request.headers.get("x-user-role");

  if (!userId || !encodedUserRole) {
    return null;
  }

  // Decode base64 userRole
  let decodedRole: string;
  try {
    decodedRole = Buffer.from(encodedUserRole, "base64").toString("utf-8");
  } catch (error) {
    console.error("Failed to decode userRole:", error);
    return null;
  }

  // Parse userRole if it's a JSON array
  let parsedRole: string | string[];
  try {
    parsedRole = JSON.parse(decodedRole);
  } catch {
    parsedRole = decodedRole;
  }

  return {
    userId,
    userRole: parsedRole,
  };
}

/**
 * Check if user has admin role
 */
export function isAdmin(userRole: string | string[]): boolean {
  const ADMIN_ROLES = ["Admin", "Quản lý"];

  if (Array.isArray(userRole)) {
    return userRole.some((role) => ADMIN_ROLES.includes(role));
  }

  return ADMIN_ROLES.includes(userRole);
}

/**
 * Middleware to verify admin role
 */
export function requireAdmin(request: Request): NextResponse | null {
  const auth = getAuthContext(request);

  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized: Missing authentication" },
      { status: 401 }
    );
  }

  if (!isAdmin(auth.userRole)) {
    return NextResponse.json(
      { error: "Forbidden: Admin role required" },
      { status: 403 }
    );
  }

  return null; // No error, user is authorized
}

/**
 * Middleware to verify user is authenticated
 */
export function requireAuth(request: Request): NextResponse | null {
  const auth = getAuthContext(request);

  if (!auth) {
    return NextResponse.json(
      { error: "Unauthorized: Missing authentication" },
      { status: 401 }
    );
  }

  return null; // No error, user is authenticated
}
