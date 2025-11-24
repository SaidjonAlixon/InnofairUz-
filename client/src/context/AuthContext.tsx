import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "@shared/schema";

type AuthUser = Omit<User, "password"> | null;

type AuthContextValue = {
  user: AuthUser;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; password: string; fullName: string; role: "investor" | "mijoz"; avatar?: string }) => Promise<void>;
  updateUser: (userId: string, updates: { fullName?: string; email?: string; avatar?: string }) => Promise<void>;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "inno-fair.uz_user";
const LEGACY_KEYS = ["inno-fair.uz_user", "inno-fair.uz_admin_user"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => {
    if (typeof window === "undefined") return null;
    for (const key of LEGACY_KEYS) {
      const stored = window.localStorage.getItem(key);
      if (!stored) continue;
      try {
        return JSON.parse(stored) as AuthUser;
      } catch (error) {
        console.warn("Failed to parse stored auth user", error);
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    LEGACY_KEYS.filter((key) => key !== STORAGE_KEY).forEach((key) =>
      window.localStorage.removeItem(key),
    );
  }, [user]);

const login = async ({ email, password }: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Login muvaffaqiyatsiz");
      }

      const data = (await response.json()) as { user: AuthUser };
      if (!data?.user) {
        throw new Error("Login javobi noto'g'ri");
      }

      setUser(data.user);
    } catch (err: any) {
      setError(err.message || "Login xatosi");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({
    email,
    password,
    fullName,
    avatar,
    role,
  }: {
    email: string;
    password: string;
    fullName: string;
    role: "investor" | "mijoz";
    avatar?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, avatar, role }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Ro'yxatdan o'tish muvaffaqiyatsiz");
      }

      const data = (await response.json()) as { user: AuthUser };
      if (!data?.user) {
        throw new Error("Ro'yxatdan o'tish javobi noto'g'ri");
      }

      setUser(data.user);
    } catch (err: any) {
      setError(err.message || "Ro'yxatdan o'tish xatosi");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: { fullName?: string; email?: string; avatar?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updates }),
      }).catch((networkError) => {
        // Handle network errors (server not running, CORS, etc.)
        throw new Error("Server bilan bog'lanishda xatolik. Iltimos, server ishlamoqda ekanligini tekshiring.");
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || `Server xatosi: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as { user: AuthUser };
      if (!data?.user) {
        throw new Error("Profil yangilash javobi noto'g'ri");
      }

      setUser(data.user);
    } catch (err: any) {
      const errorMessage = err.message || "Profil yangilash xatosi";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      }).catch((networkError) => {
        // Handle network errors (server not running, CORS, etc.)
        throw new Error("Server bilan bog'lanishda xatolik. Iltimos, server ishlamoqda ekanligini tekshiring.");
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || `Server xatosi: ${response.status} ${response.statusText}`);
      }

      // Password change doesn't update user object
    } catch (err: any) {
      const errorMessage = err.message || "Parol o'zgartirish xatosi";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      updateUser,
      changePassword,
      logout,
      isLoading,
      error,
    }),
    [user, isLoading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth faqat AuthProvider ichida chaqirilishi mumkin");
  }
  return context;
}



