"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";

// Sử dụng type User từ src/types/user.ts

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  getPrimaryRole: () => string | null;
  isAdmin: () => boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load auth state from localStorage on mount
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        // Only parse if storedUser is a valid JSON string
        if (
          storedUser.trim().startsWith("{") &&
          storedUser.trim().endsWith("}")
        ) {
          setUser(JSON.parse(storedUser));
        } else {
          throw new Error("Invalid user JSON");
        }
      } catch (error) {
        // Clear invalid storage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    // Lưu token vào cookie để middleware có thể đọc
    document.cookie = `auth_token=${newToken}; path=/;`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const hasRole = (role: string) => {
    return user?.roles.includes(role as any) || false;
  };

  // Hàm kiểm tra role cao nhất - ưu tiên Admin
  const getPrimaryRole = () => {
    if (!user || !user.roles || user.roles.length === 0) return null;
    // Nếu có role Admin thì ưu tiên Admin
    if (user.roles.includes("Admin" as any)) return "Admin";
    // Ngược lại trả về role đầu tiên
    return user.roles[0];
  };

  const isAdmin = () => {
    return user?.roles.includes("Admin" as any) || false;
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to refresh user", error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
        getPrimaryRole,
        isAdmin,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
