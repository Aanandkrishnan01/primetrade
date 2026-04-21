"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api, User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    fullName?: string
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = api.getUser();
    if (storedUser && api.isAuthenticated()) {
      setUser(storedUser);
      // Verify token is still valid
      api
        .getMe()
        .then((freshUser) => {
          setUser(freshUser);
          api.setUser(freshUser);
        })
        .catch(() => {
          api.clearToken();
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    setUser(response.user);
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    fullName?: string
  ) => {
    const response = await api.register({
      email,
      username,
      password,
      full_name: fullName,
    });
    setUser(response.user);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const freshUser = await api.getMe();
      setUser(freshUser);
      api.setUser(freshUser);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
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
