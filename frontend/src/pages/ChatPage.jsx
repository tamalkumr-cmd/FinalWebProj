import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; 
import { 
  Send, Phone, Search, Radio, Activity, 
  Video, CheckCheck, Paperclip, 
  ShieldCheck, Zap, Globe, Trash2,
  Terminal, ArrowLeft, LogOut, XCircle, Shield, MoreVertical
} from "lucide-react";

const socket = io("http://localhost:5001", {
  transports: ["websocket"],
  upgrade: false
});

export default function ChatPage({ currentUser }) {
  const navigate = useNavigate();
  const [inbox, setInbox] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHandshake, setIsHandshake] = useState(false);
  
  const scrollRef = useRef();
  const processedMessageIds = useRef(new Set());

  // --- REAL-TIME SIGNAL CORE ---
  useEffect(() => {
    if (!currentUser?.id) return;
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

    socket.on("receive_message", handleNewMsg);
    socket.on("message_scrubbed", (id) => setMessages(p => p.filter(m => m.id !== id)));
    socket.on("display_typing", (data) => {
      if (activeChat && String(data.senderId) === String(activeChat.id)) setIsTyping(data.typing);
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_scrubbed");
      socket.off("display_typing");
    };
  }, [currentUser?.id, activeChat?.id]);

  const loadInbox = async () => {
    try {
      const data = await api.getInbox();
      setInbox(Array.isArray(data) ? data : []);
    } catch (e) { setInbox([]); }
  };

  const selectOperator = async (contact) => {
    setIsHandshake(true);
    setActiveChat(contact);
    try {
      const history = await api.getChatHistory(contact.id);
      processedMessageIds.current.clear();
      history.forEach(m => processedMessageIds.current.add(m.id));
      setMessages(Array.isArray(history) ? history : []);
      setTimeout(() => {
        setIsHandshake(false);
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 800);
    } catch (e) { setIsHandshake(false); }
  };

  const transmit = async (overrideText = null) => {
    const textToSend = overrideText || inputText;
    if (!textToSend.trim() || !activeChat) return;
    
    const txId = `TX-${Date.now()}`;
    const packet = { 
      txId, senderId: currentUser.id, receiverId: activeChat.id, 
      text: textToSend, createdAt: new Date().toISOString()
    };
    
    processedMessageIds.current.add(txId);
    setMessages((prev) => [...prev, packet]);
    if (!overrideText) setInputText("");
    
    try {
      await api.sendMessage(packet);
      socket.emit("send_message", packet);
      loadInbox();
    } catch (e) { console.error("SIGNAL_LOST"); }
  };

  return (
    <div className="flex h-[95vh] bg-[#080a0c] text-slate-200 overflow-hidden font-sans border border-white/5 rounded-[2.5rem] shadow-2xl">
      
      {/* 📟 SIDEBAR (Fixed and Real-time) */}
      <aside className="w-85 border-r border-white/5 flex flex-col bg-[#0d1117]/60 backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div onClick={() => navigate("/dashboard")} className="cursor-pointer">
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Sky_Link</h2>
              <p className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-[0.2em]">Tactical Comms</p>
            </div>
            <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all">
              <LogOut size={18} />
            </button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Personnel..." 
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-2">
          {inbox.map(contact => (
            <div 
              key={contact.id} 
              onClick={() => selectOperator(contact)} 
              className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all ${
                activeChat?.id === contact.id ? 'bg-cyan-500/10 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]' : 'hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-slate-800 overflow-hidden border border-white/10">
                    <img src={contact.photoUrl || `https://ui-avatars.com/api/?name=${contact.name}&background=1e293b&color=fff`} alt="" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#0d1117] rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-100 truncate">{contact.name}</p>
                <p className="text-[10px] text-slate-500 truncate mono uppercase tracking-tight">{(contact.lastMessage || "Secure Line")}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6">
             <button 
                onClick={() => navigate("/dashboard")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/5 hover:bg-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/10"
            >
                <XCircle size={14} /> Terminate Link
            </button>
        </div>
      </aside>

      {/* 🛰️ MAIN OPERATOR WINDOW */}
      <main className="flex-1 flex flex-col bg-[#0d1117] relative">
        <AnimatePresence>
            {isHandshake && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-[#0d1117] flex flex-col items-center justify-center">
                    <Globe size={40} className="text-cyan-500 animate-pulse mb-4" />
                    <p className="mono text-[10px] tracking-[0.4em] text-cyan-500 uppercase font-black">Establishing Handshake...</p>
                </motion.div>
            )}
        </AnimatePresence>

        {activeChat ? (
          <>
            <header className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-[#0d1117]/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-5">
                <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-white/5 rounded-full lg:hidden">
                    <ArrowLeft size={20} />
                </button>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[#080a0c] font-black text-xl shadow-lg shadow-cyan-500/20">
                    {activeChat.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-black text-white tracking-tight uppercase italic">{activeChat.name}</h4>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    <p className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">
                        {isTyping ? "Operator is typing..." : "Secure Connection Established"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <HeaderButton icon={<Phone size={18}/>} />
                <HeaderButton icon={<Video size={18}/>} />
                <HeaderButton icon={<MoreVertical size={18}/>} />
              </div>
            </header>

            {/* MESSAGE FEED */}
            <div className="flex-1 px-10 py-8 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
              {messages.map((m, i) => {
                const isMe = String(m.senderId) === String(currentUser.id);
                return (
                  <div key={m.id || i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[500px] p-4 rounded-[1.5rem] shadow-2xl border ${
                      isMe 
                      ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 border-cyan-500 text-white rounded-tr-none' 
                      : 'bg-[#161b22] border-white/5 text-slate-200 rounded-tl-none'
                    }`}>
                      <p className="text-[14px] font-medium leading-relaxed">{m.text}</p>
                      <div className="flex items-center justify-end gap-2 mt-2 opacity-40">
                        <span className="text-[8px] font-mono">
                          {new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </span>
                        {isMe && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* OPERATOR CONTROL DOCK */}
            <footer className="p-6 bg-[#0d1117] border-t border-white/5">
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    <QuickAction label="Status Report" onClick={() => transmit("Requesting immediate operational status report.")} />
                    <QuickAction label="Confirm Receipt" onClick={() => transmit("Message received and acknowledged. Proceeding.")} />
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-[2rem] border border-white/5">
                  <div className="p-3 text-slate-500 border-r border-white/10"><Terminal size={20} /></div>
                  <input 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && transmit()}
                    placeholder="Type secure transmission..." 
                    className="flex-1 bg-transparent py-2 text-sm outline-none" 
                  />
                  <button 
                    onClick={() => transmit()} 
                    className="bg-cyan-500 p-3 rounded-full text-[#080a0c] shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 transition-all"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
            <Globe size={80} className="animate-[spin_40s_linear_infinite] mb-6 text-cyan-500" />
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-white">Awaiting Link Selection</p>
          </div>
        )}
      </main>
    </div>
  );
}

function QuickAction({ label, onClick }) {
    return (
        <button onClick={onClick} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all uppercase tracking-widest whitespace-nowrap">
            {label}
        </button>
    );
}

function HeaderButton({ icon }) {
  return <button className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all">{icon}</button>;
}