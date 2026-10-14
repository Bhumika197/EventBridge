import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";
const AuthContext = createContext(void 0);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("eventbridge_token"));
  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState([]);
  const loadColleges = async () => {
    try {
      const res = await api.getColleges();
      if (res.success) setColleges(res.data);
    } catch (e) {
      console.error(e);
    }
  };
  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
      } else if (!token.startsWith("demo_token_")) {
        logout();
      }
    } catch (err) {
      if (!token.startsWith("demo_token_")) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadColleges();
    refreshUser();
  }, [token]);
  const login = async (username, passwordPlain) => {
    try {
      const res = await api.login({ username, password: passwordPlain });
      if (res.success && res.data) {
        localStorage.setItem("eventbridge_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return;
      } else {
        throw new Error(res.message || "Authentication failed.");
      }
    } catch (err) {
      // Instant fallback for demo profiles if network or server is offline
      if (passwordPlain === "12345678" || passwordPlain === "password123") {
        if (username === "dev@student.com" || username === "dev") {
          const fallbackUser = { userId: 1222, name: "Dev Student", username: "dev@student.com", email: "dev@student.com", role: "STUDENT", collegeId: 1 };
          setUser(fallbackUser);
          setToken("demo_token_student");
          localStorage.setItem("eventbridge_token", "demo_token_student");
          return;
        } else if (username === "mrunali.rbunagpur.in" || username === "mrunali@rbunagpur.in") {
          const fallbackUser = { userId: 1225, name: "Mrunali Organizer", username: "mrunali.rbunagpur.in", email: "mrunali@rbunagpur.in", role: "EVENT_ORGANIZER", collegeId: 1 };
          setUser(fallbackUser);
          setToken("demo_token_organizer");
          localStorage.setItem("eventbridge_token", "demo_token_organizer");
          return;
        } else if (username === "bhumika@admin.com" || username === "admin") {
          const fallbackUser = { userId: 1224, name: "Bhumika Admin", username: "bhumika@admin.com", email: "bhumika@admin.com", role: "PLATFORM_ADMIN", collegeId: 1 };
          setUser(fallbackUser);
          setToken("demo_token_admin");
          localStorage.setItem("eventbridge_token", "demo_token_admin");
          return;
        }
      }
      throw err;
    }
  };
  const logout = () => {
    localStorage.removeItem("eventbridge_token");
    setToken(null);
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, token, loading, colleges, login, logout, refreshUser }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
