import React, { createContext, useContext, useEffect, useState } from "react";
import { authMe, login as loginApi, logout as logoutApi } from "../services/authApi";
// import useNotification from "../hooks/useNotification"; // 
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const { prepareSound } = useNotification();
  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await authMe();
        setUser(res);

      } catch (err) {
        console.warn("Session invalid or expired", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await loginApi(credentials);
      console.log("Login Success:", res.data);

      const token = res.data?.token || res.data?.data?.token || res.data?.data?.accessToken;
      if (token) {
        localStorage.setItem('adminToken', token);
      }

      // Use user data from login response as initial state
      if (res.data?.data?.user) {
        setUser(res.data.data.user);
      }

      try {
        // Try to refresh/get full profile
        const profileRes = await authMe();
        if (profileRes) {
          setUser(profileRes);
        }
      } catch (profileErr) {
        console.warn("Secondary profile fetch failed after login, using login data:", profileErr);
      }

      return { success: true };
    } catch (err) {
      console.error("Login failed:", err);
      return { success: false, message: err?.response?.data?.message || "Login failed" };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("adminToken");
      setUser(null);
      window.location.href = "/signin"; // Optionally redirect
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
