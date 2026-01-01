import { useState, useEffect, ReactNode } from "react";
import { api, User } from "@/services/api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!localStorage.getItem("auth_token"));

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      api.getProfile()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem("auth_token");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);
    localStorage.setItem("auth_token", result.token);
    setUser(result.user);
  };

  const loginWithGoogle = async (token: string) => {
    const result = await api.loginWithGoogle(token);
    localStorage.setItem("auth_token", result.token);
    setUser(result.user);
  };

const register = async (name: string, email: string, password: string) => {
  const result = await api.register(name, email, password);
  localStorage.setItem("auth_token", result.token);
  setUser(result.user);
};

  const logout = async () => {
    await api.logout();
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const updatedUser = await api.updateProfile(data);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
