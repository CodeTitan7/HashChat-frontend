import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/Chat";

const API_URL = import.meta.env.VITE_API_URL

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .catch(() => {});
  }, []);
  
  useEffect(() => {
    const restoreUser = async () => {
      const token = sessionStorage.getItem("token");
      const savedUser = sessionStorage.getItem("user");

      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (err) {
          console.error("Failed to restore user:", err);
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
        }
      }
      
      setLoading(false);
    };

    restoreUser();
  }, []);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "lastLogin" && e.newValue) {
        const loginData = JSON.parse(e.newValue);
        console.log(`Another tab logged in as: ${loginData.username}`);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      sessionStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("token", localStorage.getItem("token") || "");
      
      localStorage.setItem("lastLogin", JSON.stringify({
        username: userData.username,
        timestamp: Date.now()
      }));
    } else {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
        color: "#00d4ff",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        fontSize: "18px",
        fontWeight: "600"
      }}>
        <div>LOADING...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Login setUser={handleSetUser} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat" element={<Chat user={user} />} />
    </Routes>
  );
}
