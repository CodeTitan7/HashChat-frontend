import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL

export default function Chat({ user }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [receiverUsername, setReceiverUsername] = useState(() => {
    return sessionStorage.getItem("lastReceiverUsername") || "";
  });
  const [receiverId, setReceiverId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [connected, setConnected] = useState(false);
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    socketRef.current = io(API_URL);
    const socket = socketRef.current;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join", user.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("receive_message", (data) => {
      setMessages(prev => [...prev, {
        _id: data._id,
        text: data.text,
        fromSelf: String(data.sender) === String(user.id),
        sender: data.sender,
        receiver: data.receiver,
        senderUsername: data.senderUsername
      }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, navigate]);

  useEffect(() => {
    const fetchReceiverData = async () => {
      if (!receiverUsername.trim()) {
        setReceiverId("");
        setMessages([]);
        return;
      }

      setIsSearching(true);
      try {
        const token = sessionStorage.getItem("token");
        
        const userRes = await fetch(`${API_URL}/api/user/username/${receiverUsername}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setReceiverId(userData.id);

          const historyRes = await fetch(
            `${API_URL}/api/messages/${user.id}/${userData.id}`,
            { headers: { "Authorization": `Bearer ${token}` }}
          );

          if (historyRes.ok) {
            const history = await historyRes.json();
            
            const historyWithUsernames = await Promise.all(
              history.map(async (msg) => {
                let senderUsername = "";
                if (String(msg.sender) !== String(user.id)) {
                  senderUsername = receiverUsername;
                }
                
                return {
                  _id: msg._id,
                  text: msg.text,
                  fromSelf: String(msg.sender) === String(user.id),
                  sender: msg.sender,
                  receiver: msg.receiver,
                  senderUsername: senderUsername,
                  createdAt: msg.createdAt
                };
              })
            );
            
            setMessages(historyWithUsernames);
          } else {
            setMessages([]);
          }
        } else {
          setReceiverId("");
          setMessages([]);
        }
      } catch (err) {
        console.error("Failed to fetch receiver data:", err);
        setReceiverId("");
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchReceiverData, 500);
    return () => clearTimeout(timer);
  }, [receiverUsername, user.id]);

  const sendMessage = () => {
    if (!message.trim() || !receiverUsername.trim() || !receiverId) {
      alert("Enter message and receiver username");
      return;
    }

    if (!socketRef.current) {
      alert("Socket not connected");
      return;
    }

    socketRef.current.emit("send_message", {
      sender: user.id,
      receiver: receiverId,
      text: message
    });

    setMessage("");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("lastReceiverUsername");
    localStorage.removeItem("token");
    
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    
    navigate("/");
  };

  if (!user) return null;

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
      padding: "20px",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#ffffff"
    },
    chatWrapper: {
      maxWidth: "1200px",
      margin: "0 auto",
      minHeight: "calc(100vh - 40px)",
      display: "flex",
      flexDirection: "column"
    },
    header: {
      background: "transparent",
      padding: "20px 0px",
      marginBottom: "15px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "all 0.3s ease"
    },
    headerLeft: {
      flex: 1
    },
    title: {
      margin: 0,
      fontSize: "28px",
      fontWeight: "700",
      color: connected ? "#00ff9d" : "#ff3b5c",
      display: "inline-block",
      marginRight: "15px"
    },
    statusIndicator: {
      display: "inline-block",
      fontSize: "16px",
      fontWeight: "600",
      color: connected ? "#00ff9d" : "#ff3b5c",
      textTransform: "uppercase",
      letterSpacing: "1px"
    },
    userInfo: {
      margin: "10px 0 5px 0",
      color: "#b0b0b0",
      fontSize: "14px"
    },
    userId: {
      margin: "5px 0",
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#808080",
      padding: "8px 12px",
      background: "rgba(255, 255, 255, 0.05)",
      borderRadius: "8px",
      display: "inline-block",
      border: "1px solid rgba(255, 255, 255, 0.1)"
    },
    logoutBtn: {
      padding: "12px 30px",
      background: "linear-gradient(135deg, #ff3b5c 0%, #ff8c42 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 15px 0 rgba(255, 59, 92, 0.3)",
      position: "relative",
      overflow: "hidden"
    },
    receiverSection: {
      background: "rgba(45, 45, 45, 0.6)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      padding: "20px",
      borderRadius: "20px",
      marginBottom: "15px",
      border: "1px solid rgba(255, 255, 255, 0.1)"
    },
    label: {
      display: "block",
      marginBottom: "10px",
      fontWeight: "600",
      color: "#00d4ff",
      fontSize: "14px",
      textTransform: "uppercase",
      letterSpacing: "1px"
    },
    input: {
      padding: "14px 18px",
      width: "100%",
      border: "2px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "12px",
      fontSize: "14px",
      boxSizing: "border-box",
      background: "rgba(26, 26, 26, 0.8)",
      color: "#ffffff",
      transition: "all 0.3s ease",
      outline: "none"
    },
    receiverInfo: {
      marginTop: "12px",
      padding: "12px 18px",
      background: "linear-gradient(135deg, rgba(0, 255, 157, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)",
      borderRadius: "10px",
      fontSize: "14px",
      border: "1px solid rgba(0, 255, 157, 0.2)",
      color: "#00ff9d"
    },
    messagesContainer: {
      flex: 1,
      minHeight: "500px",
      maxHeight: "calc(100vh - 400px)",
      overflowY: "auto",
      background: "rgba(45, 45, 45, 0.4)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      padding: "25px",
      marginBottom: "15px",
      borderRadius: "20px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      scrollbarWidth: "thin",
      scrollbarColor: "#00d4ff rgba(255, 255, 255, 0.1)"
    },
    messagesHeader: {
      margin: "0 0 20px 0",
      color: "#808080",
      fontSize: "14px",
      textTransform: "uppercase",
      letterSpacing: "2px",
      fontWeight: "600"
    },
    emptyState: {
      color: "#606060",
      textAlign: "center",
      padding: "60px 20px",
      fontSize: "16px"
    },
    messageBubble: (fromSelf) => ({
      padding: "14px 18px",
      margin: "12px 0",
      background: fromSelf 
        ? "linear-gradient(135deg, rgba(0, 255, 157, 0.15) 0%, rgba(0, 212, 255, 0.15) 100%)"
        : "rgba(45, 45, 45, 0.8)",
      borderRadius: "16px",
      border: fromSelf 
        ? "1px solid rgba(0, 255, 157, 0.3)"
        : "1px solid rgba(255, 255, 255, 0.1)",
      maxWidth: "70%",
      marginLeft: fromSelf ? "auto" : "0",
      marginRight: fromSelf ? "0" : "auto",
      boxShadow: fromSelf 
        ? "0 4px 15px 0 rgba(0, 255, 157, 0.2)"
        : "0 4px 15px 0 rgba(0, 0, 0, 0.3)",
      transition: "all 0.3s ease",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)"
    }),
    messageSender: (fromSelf) => ({
      fontWeight: "600",
      marginBottom: "6px",
      color: fromSelf ? "#00ff9d" : "#00d4ff",
      fontSize: "13px",
      textShadow: fromSelf 
        ? "0 0 10px rgba(0, 255, 157, 0.5)"
        : "0 0 10px rgba(0, 212, 255, 0.5)"
    }),
    messageText: {
      fontSize: "15px",
      lineHeight: "1.5",
      color: "#ffffff",
      wordWrap: "break-word"
    },
    inputContainer: {
      display: "flex",
      gap: "15px",
      background: "rgba(45, 45, 45, 0.6)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      padding: "20px",
      borderRadius: "20px",
      border: "1px solid rgba(255, 255, 255, 0.1)"
    },
    messageInput: {
      flex: 1,
      padding: "14px 18px",
      border: "2px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "12px",
      fontSize: "15px",
      outline: "none",
      background: "rgba(26, 26, 26, 0.8)",
      color: "#ffffff",
      transition: "all 0.3s ease"
    },
    sendBtn: (connected) => ({
      padding: "14px 35px",
      background: connected 
        ? "linear-gradient(135deg, #00ff9d 0%, #00d4ff 100%)"
        : "rgba(100, 100, 100, 0.5)",
      color: connected ? "#000000" : "#606060",
      border: "none",
      borderRadius: "12px",
      cursor: connected ? "pointer" : "not-allowed",
      fontSize: "15px",
      fontWeight: "700",
      minWidth: "120px",
      transition: "all 0.3s ease",
      boxShadow: connected 
        ? "0 4px 15px 0 rgba(0, 255, 157, 0.4)"
        : "none",
      textTransform: "uppercase",
      letterSpacing: "1px"
    })
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        input:focus {
          border-color: #00d4ff !important;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.3) !important;
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px 0 rgba(0, 255, 157, 0.5) !important;
        }
        
        div::-webkit-scrollbar {
          width: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        div::-webkit-scrollbar-thumb {
          background: #00d4ff;
          border-radius: 10px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: #00ff9d;
        }
      `}</style>

      <div style={styles.chatWrapper}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <h2 style={styles.title}>CHAT TERMINAL</h2>
              <span style={styles.statusIndicator}>
                {connected ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <p style={styles.userInfo}>
              <strong>USERNAME:</strong> {user.username}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={styles.logoutBtn}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 25px 0 rgba(255, 59, 92, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px 0 rgba(255, 59, 92, 0.3)";
            }}
          >
            LOGOUT
          </button>
        </div>

        <div style={styles.receiverSection}>
          <label style={styles.label}>Receiver's Username</label>
          <input
            placeholder="Enter username to start chatting..."
            value={receiverUsername}
            onChange={(e) => {
              const newReceiverUsername = e.target.value;
              setReceiverUsername(newReceiverUsername);
              if (newReceiverUsername.trim()) {
                sessionStorage.setItem("lastReceiverUsername", newReceiverUsername);
              } else {
                sessionStorage.removeItem("lastReceiverUsername");
              }
            }}
            style={styles.input}
          />
          {isSearching && (
            <div style={styles.receiverInfo}>
              Searching for user...
            </div>
          )}
          {receiverId && !isSearching && (
            <div style={styles.receiverInfo}>
              Connected with: <strong>{receiverUsername}</strong>
            </div>
          )}
          {!receiverId && !isSearching && receiverUsername.trim() && (
            <div style={{...styles.receiverInfo, 
              background: "linear-gradient(135deg, rgba(255, 59, 92, 0.1) 0%, rgba(255, 140, 66, 0.1) 100%)",
              border: "1px solid rgba(255, 59, 92, 0.2)",
              color: "#ff3b5c"
            }}>
              User not found
            </div>
          )}
        </div>

        <div style={styles.messagesContainer}>
          <h3 style={styles.messagesHeader}>
            MESSAGES [{messages.length}]
          </h3>
          
          {messages.length === 0 ? (
            <p style={styles.emptyState}>
              No messages yet. Start the conversation!
            </p>
          ) : (
            <>
              {messages.map((m, i) => (
                <div 
                  key={m._id || i}
                  style={styles.messageBubble(m.fromSelf)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={styles.messageSender(m.fromSelf)}>
                    {m.fromSelf ? "YOU" : (m.senderUsername || receiverUsername || "USER").toUpperCase()}
                  </div>
                  <div style={styles.messageText}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div style={styles.inputContainer}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            style={styles.messageInput}
            disabled={!connected}
          />
          <button 
            onClick={sendMessage}
            disabled={!connected}
            style={styles.sendBtn(connected)}
          >
            {connected ? "SEND" : "OFFLINE"}
          </button>
        </div>
      </div>
    </div>
  );
}