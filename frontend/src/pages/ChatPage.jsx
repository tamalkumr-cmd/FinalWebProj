import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Phone, Search, Radio, Activity, 
  MoreVertical, Video, CheckCheck, Paperclip, Smile,
  ShieldCheck, Zap, Globe, Trash2
} from "lucide-react";

// 🛰️ SIGNAL CORE: Switched to 5001 to avoid system port conflicts
const socket = io("http://localhost:5001", {
  transports: ["websocket"],
  upgrade: false
});

export default function ChatPage({ currentUser }) {
  const [inbox, setInbox] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // Typing status of the OTHER person
  const scrollRef = useRef();
  const processedMessageIds = useRef(new Set());

  useEffect(() => {
    if (!currentUser?.id) return;
    
    // Join personal frequency
    socket.emit("join_personal_frequency", String(currentUser.id));
    loadInbox();

    const handleNewMsg = (newMsg) => {
      if (String(newMsg.senderId) === String(currentUser.id)) return;
      const uniqueId = newMsg.id || newMsg.txId;
      if (uniqueId && processedMessageIds.current.has(uniqueId)) return;
      
      setMessages((prev) => {
        if (activeChat && String(activeChat.id) === String(newMsg.senderId)) {
          if (uniqueId) processedMessageIds.current.add(uniqueId);
          return [...prev, newMsg];
        }
        return prev;
      });
      loadInbox();
    };

    // 🗑️ Handle remote message deletion
    const handleScrub = (messageId) => {
      setMessages((prev) => prev.filter(m => m.id !== messageId));
    };

    // ⌨️ Handle typing telemetry
    const handleTyping = (data) => {
      if (activeChat && String(data.senderId) === String(activeChat.id)) {
        setIsTyping(data.typing);
      }
    };

    socket.on("receive_message", handleNewMsg);
    socket.on("message_scrubbed", handleScrub);
    socket.on("display_typing", handleTyping);

    return () => {
      socket.off("receive_message", handleNewMsg);
      socket.off("message_scrubbed", handleScrub);
      socket.off("display_typing", handleTyping);
    };
  }, [currentUser?.id, activeChat?.id]);

  // --- DATA FETCHERS ---
  const loadInbox = async () => {
    try {
      const data = await api.getInbox();
      setInbox(Array.isArray(data) ? data : []);
    } catch (e) { setInbox([]); }
  };

  const loadHistory = async (partnerId) => {
    try {
      const history = await api.getChatHistory(partnerId);
      processedMessageIds.current.clear();
      history.forEach(m => processedMessageIds.current.add(m.id));
      setMessages(Array.isArray(history) ? history : []);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) { setMessages([]); }
  };

  // --- ACTIONS ---
  const transmit = async () => {
    if (!inputText.trim() || !activeChat) return;
    const txId = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const packet = { 
      txId, senderId: currentUser.id, receiverId: activeChat.id, 
      text: inputText, createdAt: new Date().toISOString()
    };
    
    processedMessageIds.current.add(txId);
    setMessages((prev) => [...prev, packet]);
    setInputText("");
    
    // Stop typing notification
    socket.emit("typing_stop", { senderId: currentUser.id, receiverId: activeChat.id });

    try {
      await api.sendMessage(packet);
      socket.emit("send_message", packet);
      loadInbox();
    } catch (e) { console.error("SIGNAL_LOST"); }
  };

  const scrubMessage = async (messageId) => {
    try {
      await api.deleteMessage(messageId);
      socket.emit("delete_message", { messageId, receiverId: activeChat.id });
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (e) { console.error("SCRUB_FAILED"); }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (activeChat) {
      socket.emit("typing_start", { senderId: currentUser.id, receiverId: activeChat.id });
      
      // Auto-stop typing after 2 seconds of no input
      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        socket.emit("typing_stop", { senderId: currentUser.id, receiverId: activeChat.id });
      }, 2000);
    }
  };

  return (
    <div className="flex h-[90vh] bg-[#080a0c] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] font-sans text-slate-200">
      
      {/* 📟 SIDEBAR */}
      <aside className="w-85 border-r border-white/5 flex flex-col bg-[#0d1117]/60 backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Sky_Link</h2>
              <p className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-[0.2em]">Tactical Comms</p>
            </div>
            <div className="p-2 bg-cyan-500/10 rounded-xl">
              <Activity size={18} className="text-cyan-500 animate-pulse" />
            </div>
          </div>

          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search personnel..." 
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          {inbox.map(contact => (
            <motion.div 
              whileHover={{ x: 5 }}
              key={contact.id} onClick={() => { setActiveChat(contact); loadHistory(contact.id); }} 
              className={`p-4 mb-2 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${activeChat?.id === contact.id ? 'bg-cyan-500/10' : 'hover:bg-white/5'}`}
            >
              <Avatar src={contact.photoUrl} name={contact.name} online={true} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-100 truncate">{contact.name}</p>
                <p className="text-xs text-slate-500 truncate">{contact.lastMessage || "Encrypted Line"}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </aside>

      {/* 🛰️ MAIN WINDOW */}
      <main className="flex-1 flex flex-col bg-[#0d1117] relative">
        {activeChat ? (
          <>
            <header className="px-8 py-4 border-b border-white/5 flex justify-between items-center bg-[#0d1117]/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <Avatar src={activeChat.photoUrl} name={activeChat.name} size="lg" online />
                <div>
                  <h4 className="text-base font-bold text-white">{activeChat.name}</h4>
                  <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">
                    {isTyping ? "Personnel is typing..." : "Signal Locked"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <HeaderButton icon={<Phone size={18}/>} />
                <HeaderButton icon={<Video size={18}/>} />
              </div>
            </header>

            <div className="flex-1 px-10 py-8 overflow-y-auto space-y-6 custom-scrollbar flex flex-col">
              {messages.map((m, i) => {
                const isMe = String(m.senderId) === String(currentUser.id);
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={m.id || i} 
                    className={`flex w-full group ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="relative">
                      {isMe && (
                        <button 
                          onClick={() => scrubMessage(m.id)}
                          className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <div className={`px-5 py-3 rounded-[1.5rem] shadow-2xl ${
                        isMe 
                        ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white rounded-tr-none' 
                        : 'bg-[#161b22] border border-white/5 text-slate-200 rounded-tl-none'
                      }`}>
                        <p className="text-[14px] font-medium">{m.text}</p>
                        <div className="flex items-center gap-2 mt-2 opacity-40">
                          <span className="text-[8px] font-mono">
                            {new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                          </span>
                          {isMe && <CheckCheck size={12} className={m.id ? "text-white" : "text-white/40"} />}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            <footer className="p-6 bg-[#0d1117] border-t border-white/5">
              <div className="max-w-4xl mx-auto flex items-center gap-4 bg-white/5 p-2 rounded-[2rem] border border-white/5">
                <button className="p-3 text-slate-500 hover:text-cyan-500"><Paperclip size={20} /></button>
                <input 
                  value={inputText} 
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && transmit()}
                  placeholder="Type secure transmission..." 
                  className="flex-1 bg-transparent py-2 text-sm outline-none" 
                />
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={transmit} 
                  className="bg-cyan-500 p-3 rounded-full text-[#080a0c] shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
            <Globe size={80} className="animate-[spin_20s_linear_infinite] mb-4" />
            <p className="text-xs uppercase tracking-[0.5em]">Establishing Handshake...</p>
          </div>
        )}
      </main>
    </div>
  );
}

function Avatar({ src, name, size = "md", online = false }) {
  const sizes = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-14 h-14" };
  return (
    <div className="relative">
      <div className={`${sizes[size]} rounded-2xl p-[2px] bg-white/10 overflow-hidden`}>
        <img src={src || `https://ui-avatars.com/api/?name=${name}&background=1e293b&color=fff`} className="w-full h-full object-cover" />
      </div>
      {online && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-[3px] border-[#0d1117] rounded-full" />}
    </div>
  );
}

function HeaderButton({ icon }) {
  return <button className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all">{icon}</button>;
}