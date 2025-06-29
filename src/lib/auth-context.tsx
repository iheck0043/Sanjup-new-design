import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Debug log for BASE_URL
if (import.meta.env.DEV) {
  console.log("AUTH Context - BASE_URL:", BASE_URL);
  console.log(
    "AUTH Context - ENV VITE_BASE_URL:",
    import.meta.env.VITE_BASE_URL
  );
  console.log("AUTH Context - Window Origin:", window.location.origin);
}

interface User {
  id: string;
  phone: string;
  access_token: string;
  refresh_token: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    const storedToken = localStorage.getItem("access_token");
    return storedToken || null;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (phone: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/sanjup/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در ورود");
      }

      toast.success("کد تایید ارسال شد");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "خطا در ورود");
      throw error;
    }
  };

  const verifyOTP = async (phone: string, code: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/v1/auth/sanjup/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check specifically for the new user case
        if (
          response.status === 400 &&
          data.info?.message === "User not found. Redirect to signup form." &&
          data.info?.attrs?.is_new_user === true
        ) {
          throw new Error("NEW_USER_SIGNUP_REQUIRED");
        }
        throw new Error(
          data.info?.message || data.message || "خطا در تایید کد"
        );
      }

      if (data.info.status === 200 && data.data) {
        const userData = data.data;
        setUser(userData);
        setAccessToken(userData.access_token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("access_token", userData.access_token);
        toast.success("ورود موفقیت‌آمیز");
      } else {
        throw new Error(data.info.message || "خطا در تایید کد");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    toast.success("خروج موفقیت‌آمیز");
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, verifyOTP, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
