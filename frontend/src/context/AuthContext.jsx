import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Loads the current session (user + plan + usage). Called on boot and after changes.
  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      setPlan(data.plan);
      setUsage(data.usage);
    } catch {
      setUser(null);
      setPlan(null);
      setUsage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email, password) => {
    await api.post("/auth/login", { email, password });
    await refresh();
  };

  const register = async (name, email, password) => {
    await api.post("/auth/register", { name, email, password });
    await refresh();
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    setPlan(null);
    setUsage(null);
  };

  return (
    <AuthContext.Provider value={{ user, plan, usage, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
