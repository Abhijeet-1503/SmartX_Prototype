import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  role: string;
  name: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string | string[]) => boolean;
  isGodMode: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem("auth_token")
  );
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Verify token with server
  const { data: verifiedUser, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => 
      apiRequest<User>("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: !!token,
    retry: false,
    meta: { hideErrorToast: true },
  });

  useEffect(() => {
    if (verifiedUser) {
      setUser(verifiedUser);
      localStorage.setItem("user", JSON.stringify(verifiedUser));
    } else if (error || (!isLoading && token && !verifiedUser)) {
      // Token is invalid or error occurred, clear it
      console.log("Clearing invalid token");
      logout();
    }
  }, [verifiedUser, isLoading, token, error]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("auth_token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  };

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const isAuthenticated = !!user && !!token;
  const isGodMode = user?.role === "god";
  const isAdmin = user?.role === "admin" || isGodMode;
  const isTeacher = user?.role === "teacher" || isAdmin;
  
  // Only show loading when we have a token and are verifying it
  const actualIsLoading = !!token && isLoading && !verifiedUser && !error;

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    isLoading: actualIsLoading,
    hasRole,
    isGodMode,
    isAdmin,
    isTeacher,
  };

  return (
    <AuthContext.Provider value={value}>
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