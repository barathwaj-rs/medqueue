import React, { createContext, useContext, useEffect, useState } from "react";
import { setAuthToken } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("medqueueUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("medqueueToken") || null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("medqueueUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("medqueueUser");
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("medqueueToken", token);
    } else {
      localStorage.removeItem("medqueueToken");
    }
  }, [token]);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
