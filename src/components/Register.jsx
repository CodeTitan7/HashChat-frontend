import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    try {
      await axios.post(
        `${API_URL}/api/auth/register`,
        { username, email, password }
      );
      setMsg("Registered successfully");
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data || "Register failed");
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "20px"
    },
    card: {
      maxWidth: "450px",
      width: "100%",
      background: "rgba(45, 45, 45, 0.6)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      padding: "50px 40px",
      borderRadius: "24px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      position: "relative",
      overflow: "hidden"
    },
    glowEffect: {
      position: "absolute",
      top: "-50%",
      right: "-50%",
      width: "200%",
      height: "200%",
      background: "radial-gradient(circle, rgba(0, 255, 157, 0.1) 0%, transparent 70%)",
      animation: "rotate 20s linear infinite reverse",
      pointerEvents: "none"
    },
    content: {
      position: "relative",
      zIndex: 1
    },
    title: {
      fontSize: "32px",
      fontWeight: "700",
      marginBottom: "10px",
      background: "linear-gradient(135deg, #00ff9d 0%, #00d4ff 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: "2px"
    },
    subtitle: {
      color: "#808080",
      textAlign: "center",
      marginBottom: "40px",
      fontSize: "14px",
      letterSpacing: "1px"
    },
    inputGroup: {
      marginBottom: "25px"
    },
    label: {
      display: "block",
      marginBottom: "10px",
      color: "#00d4ff",
      fontSize: "13px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "1px"
    },
    input: {
      width: "100%",
      padding: "16px 20px",
      backgroundColor: "rgba(26, 26, 26, 0.8)",
      border: "2px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "12px",
      color: "#ffffff",
      fontSize: "15px",
      transition: "all 0.3s ease",
      outline: "none",
      boxSizing: "border-box"
    },
    button: (isLoading) => ({
      width: "100%",
      padding: "16px",
      background: isLoading 
        ? "rgba(100, 100, 100, 0.5)"
        : "linear-gradient(135deg, #00ff9d 0%, #00d4ff 100%)",
      color: isLoading ? "#606060" : "#000000",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "700",
      cursor: isLoading ? "not-allowed" : "pointer",
      transition: "all 0.3s ease",
      textTransform: "uppercase",
      letterSpacing: "2px",
      marginTop: "10px",
      boxShadow: isLoading 
        ? "none"
        : "0 4px 15px 0 rgba(0, 255, 157, 0.4)"
    }),
    message: (success) => ({
      color: success ? "#00ff9d" : "#ff3b5c",
      backgroundColor: success 
        ? "rgba(0, 255, 157, 0.1)" 
        : "rgba(255, 59, 92, 0.1)",
      padding: "14px 18px",
      borderRadius: "10px",
      marginTop: "20px",
      fontSize: "14px",
      border: success 
        ? "1px solid rgba(0, 255, 157, 0.3)"
        : "1px solid rgba(255, 59, 92, 0.3)",
      textAlign: "center",
      fontWeight: "500"
    }),
    footer: {
      marginTop: "30px",
      textAlign: "center",
      color: "#808080",
      fontSize: "14px"
    },
    link: {
      color: "#00d4ff",
      textDecoration: "none",
      fontWeight: "600",
      transition: "all 0.3s ease",
      textShadow: "0 0 10px rgba(0, 212, 255, 0.5)"
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        input:focus {
          border-color: #00d4ff !important;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.3) !important;
        }

        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px 0 rgba(0, 255, 157, 0.5) !important;
        }

        a:hover {
          color: #00ff9d !important;
          text-shadow: 0 0 15px rgba(0, 255, 157, 0.8) !important;
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.glowEffect}></div>
        
        <div style={styles.content}>
          <h2 style={styles.title}>Register</h2>
          <p style={styles.subtitle}>Create Your Account</p>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <button 
            onClick={register}
            style={styles.button(false)}
          >
            REGISTER
          </button>

          {msg && (
            <div style={styles.message(msg === "Registered successfully")}>
              {msg}
            </div>
          )}

          <p style={styles.footer}>
            Already have an account?{" "}
            <Link to="/" style={styles.link}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}