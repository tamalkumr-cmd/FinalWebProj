import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { api } from "../api";

// Connect to the backend socket
const socket = io("http://localhost:5000");

// 💥 UPGRADED MODERN UI CSS
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  body { 
    background: #0f172a; /* Slate 900 */
    font-family: 'Inter', sans-serif; 
    color: #f8fafc; 
    margin: 0;
  }
  
  .chat-wrapper { 
    display: flex; 
    flex-direction: column; 
    height: 100vh; 
    max-width: 1200px; 
    margin: 0 auto; 
    background: #0b1120; 
    box-shadow: 0 0 30px rgba(0,0,0,0.8);
    border-left: 1px solid #1e293b;
    border-right: 1px solid #1e293b;
  }
  
  /* Header Area */
  .chat-header { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    padding: 20px 30px; 
    background: #0f172a; 
    border-bottom: 1px solid #1e293b; 
    z-index: 10;
  }
  .header-info { display: flex; align-items: center; gap: 15px; }
  .avatar { 
    width: 48px; height: 48px; 
    border-radius: 50%; 
    background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
    display: flex; align-items: center; justify-content: center; 
    font-weight: 600; font-size: 1.2rem; color: white;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
  }
  .header-text h2 { font-size: 1.1rem; font-weight: 600; margin-bottom: 4px; color: #f1f5f9; }
  .header-text p { font-size: 0.85rem; color: #94a3b8; display: flex; align-items: center; gap: 6px; }
  .status-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
  
  .back-btn { 
    background: #1e293b; border: 1px solid #334155; color: white; 
    padding: 10px 20px; border-radius: 8px; cursor: pointer; 
    transition: 0.2s; font-weight: 500; font-size: 0.9rem;
  }
  .back-btn:hover { background: #334155; }

  /* Messages Feed */
  .chat-window { 
    flex: 1; overflow-y: auto; padding: 30px; 
    display: flex; flex-direction: column; gap: 20px; 
    scroll-behavior: smooth;
  }
  
  .msg-row { display: flex; flex-direction: column; width: 100%; }
  .msg-mine { align-items: flex-end; }
  .msg-theirs { align-items: flex-start; }
  
  .msg-bubble { 
    max-width: 65%; padding: 14px 18px; font-size: 0.95rem; line-height: 1.5; 
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); 
  }
  .msg-mine .msg-bubble { 
    background: #3b82f6; color: white; 
    border-radius: 18px 18px 4px 18px; 
  }
  .msg-theirs .msg-bubble { 
    background: #1e293b; color: #f1f5f9; 
    border-radius: 18px 18px 18px 4px; 
    border: 1px solid #334155; 
  }
  
  .msg-meta { font-size: 0.75rem; color: #64748b; margin-top: 6px; display: flex; align-items: center; gap: 6px; }
  .sender-name { font-size: 0.8rem; color: #94a3b8; margin-bottom: 6px; margin-left: 4px; }
  
  /* Input Area */
  .chat-input-container { 
    padding: 20px 30px; background: #0f172a; 
    border-top: 1px solid #1e293b; display: flex; gap: 15px; align-items: center;
  }
  .chat-input { 
    flex: 1; background: #1e293b; border: 1px solid #334155; 
    padding: 16px 24px; border-radius: 30px; color: white; 
    font-size: 1rem; outline: none; transition: 0.2s; 
  }
  .chat-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.2); }
  
  .send-btn { 
    background: #3b82f6; color: white; border: none; 
    width: 52px; height: 52px; border-radius: 50%; 
    cursor: pointer; display: flex; align-items: center; justify-content: center; 
    transition: 0.2s; font-size: 1.2rem;
  }
  .send-btn:hover { background: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
  .send-btn:active { transform: translateY(0); }
  
  .typing-indicator { color: #3b82f6; font-size: 0.85rem; padding-left: 10px; font-style: italic; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
`;

export default function ChatPage() {
  const { listingId } = useParams(); 
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [myId, setMyId] = useState(null); // Safely extracted ID
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [otherUserName, setOtherUserName] = useState("");
  
  const chatEndRef = useRef(null);

  // 1. Load Data & Extract ID Safely
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productData, profile] = await Promise.all([
          api.getListingById(listingId),
          api.getProfile() 
        ]);
        console.log("BACKEND SENT THIS PROFILE:", profile);
        setProduct(productData);
        setProfileData(profile);
        
        // 💥 THE BUG FIX: Safely find the user ID regardless of API structure
        const safeId = profile?.id || profile?.user?.id || profile?._id;
        setMyId(safeId);
        
      } catch (err) { 
        console.error("Failed to load workspace data", err); 
      }
    };
    loadData();
  }, [listingId]);

  // 2. Setup Sockets and Load Chat History
  useEffect(() => {
    if (!product || !myId) return;

    const fetchHistory = async () => {
      try {
        const history = await api.getListingMessages(listingId);
        setMessages(history);
        
        // Auto-mark unread messages as "Seen"
        history.forEach(msg => {
          if (msg.senderId !== myId && !msg.isSeen) {
            socket.emit("mark_seen", { messageId: msg.id, listingId });
          }
        });
        chatEndRef.current?.scrollIntoView();
      } catch (err) { console.error(err); }
    };
    
    fetchHistory();
    socket.emit("join_chat", listingId);

    // Listeners
    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setIsOtherTyping(false);
      
      if (msg.senderId !== myId) {
        socket.emit("mark_seen", { messageId: msg.id, listingId });
      }
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    socket.on("display_typing", (data) => {
      if (data.userId !== myId) {
        setIsOtherTyping(data.isTyping);
        setOtherUserName(data.userName);
      }
    });

    socket.on("message_updated", () => fetchHistory());

    return () => {
      socket.off("receive_message");
      socket.off("display_typing");
      socket.off("message_updated");
    };
  }, [product, myId, listingId]);

  // 3. Handle Typing Events
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!myId) return;
    
    socket.emit("typing", {
      listingId,
      userId: myId,
      userName: profileData?.name || "User",
      isTyping: e.target.value.length > 0
    });
  };

  // 4. Send Message Event
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    if (!myId) {
      alert("Authentication error: Cannot find your User ID. Please log in again.");
      return;
    }

    socket.emit("send_message", {
      listingId,
      text: newMessage,
      senderId: myId // 💥 Fixed! No more undefined crashes
    });

    setNewMessage("");
    socket.emit("typing", { listingId, userId: myId, isTyping: false }); 
  };

  if (!product || !profileData) {
    return <div style={{ padding: 40, color: 'white', textAlign: 'center', fontFamily: 'monospace' }}>Establishing Secure Connection...</div>;
  }

  // Get Freelancer Initials for Avatar
  const freelancerName = product.seller?.name || "Freelancer";
  const initials = freelancerName.substring(0, 2).toUpperCase();

  return (
    <>
      <style>{css}</style>
      
      <div className="chat-wrapper">
        
        {/* HEADER */}
        <div className="chat-header">
          <div className="header-info">
            <div className="avatar">{initials}</div>
            <div className="header-text">
              <h2>{product.title}</h2>
              <p><div className="status-dot"></div> Negotiating with {freelancerName}</p>
            </div>
          </div>
          <button className="back-btn" onClick={() => navigate(`/product/${product.id}`)}>
            Back to Workspace
          </button>
        </div>

        {/* MESSAGES FEED */}
        <div className="chat-window">
          {messages.length === 0 ? (
            <div style={{ color: '#475569', textAlign: 'center', margin: 'auto', fontSize: '0.9rem' }}>
              No messages yet. Send a message to start the project discussion.
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.senderId === myId;
              return (
                <div key={msg.id} className={`msg-row ${isMine ? 'msg-mine' : 'msg-theirs'}`}>
                  
                  {!isMine && <div className="sender-name">{msg.sender?.name || freelancerName}</div>}
                  
                  <div className="msg-bubble">
                    {msg.text}
                  </div>
                  
                  {isMine && (
                    <div className="msg-meta">
                      {msg.isSeen ? (
                        <span style={{ color: '#3b82f6', fontWeight: '600' }}>✓✓ Read</span>
                      ) : (
                        <span>✓ Sent</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {/* Live Typing Indicator */}
          {isOtherTyping && (
            <div className="typing-indicator">
              {otherUserName} is typing...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* INPUT FORM */}
        <form className="chat-input-container" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            className="chat-input" 
            value={newMessage} 
            onChange={handleTyping} 
            placeholder="Type your message here..." 
            autoFocus
          />
          <button type="submit" className="send-btn">
            ➤
          </button>
        </form>

      </div>
    </>
  );
}