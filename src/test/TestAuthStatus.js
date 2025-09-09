import React, { useEffect, useState } from "react";
import localforage from "localforage";
import { isLoggedIn, hasRole, getUser } from "../utils/auth";
import api from "../utils/axiosConfig";

const TestAuthStatus = () => {
  const [status, setStatus] = useState({
    loggedIn: null,
    hasAdminRole: null,
    user: null,
    token: null,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      const loggedIn = await isLoggedIn();
      const admin = await hasRole("admin");
      const user = await getUser();
      const token = await localforage.getItem("token");

      setStatus({
        loggedIn,
        hasAdminRole: admin,
        user,
        token,
      });
    };

    fetchStatus();
  }, []);

  const clearToken = async () => {
    await localforage.removeItem("token");
    alert("Token cleared.");
    window.location.reload();
  };

  const simulate401 = async () => {
    try {
      // Assuming this endpoint returns 401 when the token is invalid
      await api.get("/new-mom/mom");
    } catch (error) {
      console.error("API error (expected if token is bad):", error.message);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h2>🔐 Auth Test Status</h2>
      <p><strong>Logged In:</strong> {status.loggedIn ? "✅ Yes" : "❌ No"}</p>
      <p><strong>Has Admin Role:</strong> {status.hasAdminRole ? "✅ Yes" : "❌ No"}</p>
      <p><strong>User:</strong> {status.user ? JSON.stringify(status.user) : "❌ Not Found"}</p>
      <p><strong>Token:</strong> {status.token ? <code>{status.token.slice(0, 30)}...</code> : "❌ Not Found"}</p>

      <button onClick={clearToken} style={btnStyle}>🗑 Clear Token</button>
      <button onClick={simulate401} style={{ ...btnStyle, marginLeft: "1rem", background: "#e57373" }}>
        🔥 Simulate 401 Error
      </button>
    </div>
  );
};

const btnStyle = {
  padding: "0.5rem 1rem",
  background: "#03b3ff",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default TestAuthStatus;
