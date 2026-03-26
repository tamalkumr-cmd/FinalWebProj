import React, { useState, useEffect, useMemo } from "react";
import { register } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, ArrowRight, Satellite, ShieldCheck, 
  Fingerprint, Zap, Loader2, Disc
} from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nav = useNavigate();

  // Handle Submission
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setIsSubmitting(true);
    // Simulate a "Handshake" delay for better UI feel
    setTimeout(async () => {
      try {
        const res = await register(email, password);
        if (res?.error) {
          setMsg(res.error);
          setIsSubmitting(false);
        } else { nav("/login"); }
      } catch (err) {
        setMsg("Uplink Timeout: Signal Lost.");
        setIsSubmitting(false);
      }
    }, 1500);
  }

  // Rapid Random Data Strings for Background
  const dataPackets = useMemo(() => ["0XFF-CORE", "LNK-STABLE", "CMD-AUTH", "7700-EMRG", "MACH-0.85"], []);

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 relative overflow-hidden font-mono selection:bg-white selection:text-black">
      
      {/* --- LAYER 1: THE DATA STREAM BACKGROUND --- */}
      <div className="absolute inset-0 flex flex-wrap gap-10 p-10 opacity-[0.03] pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }}
            transition={{ duration: Math.random() * 5 + 5, repeat: Infinity }}
            className="text-[10px] whitespace-nowrap"
          >
            {Array(10).fill(dataPackets[Math.floor(Math.random() * dataPackets.length)]).join(" // ")}
          </motion.div>
        ))}
      </div>

      {/* --- LAYER 2: INTERACTIVE LASER GRID --- */}
      <div className="absolute inset-0 z-0 perspective-[1000px]">
        <motion.div 
          animate={{ rotateX: [15, 25, 15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:50px_50px] [transform:rotateX(20deg)_translateZ(-200px)]"
        />
      </div>

      {/* --- LAYER 3: REGISTRATION TERMINAL --- */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, rotateY: -20 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-md bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-10 relative z-10 rounded-sm shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      >
        {/* CORNER BRACKETS (UI GIMMICK) */}
        <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-white/30" />
        <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-white/30" />

        {/* HEADER INDICATOR */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-2">
             <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.2 }} className="w-1.5 h-1.5 bg-red-600 rounded-full" />
             <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Live_Uplink</span>
          </div>
          <span className="text-[9px] font-bold text-zinc-700">0.002MS</span>
        </div>

        <div className="text-center mb-12">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="inline-block p-4 border border-dashed border-white/10 rounded-full mb-6"
          >
             <div className="bg-white p-3 rounded-full">
               <Zap size={24} className="text-black fill-current" />
             </div>
          </motion.div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Enroll_Operator</h2>
          <p className="text-[10px] text-zinc-500 mt-2 tracking-[0.3em]">SECURE_ENTRY_AUTHORIZED</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField 
            label="CALL_SIGN" 
            placeholder="PILOT@NORS.AVIA" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <InputField 
            label="ACCESS_KEY" 
            placeholder="********" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />

          <AnimatePresence>
            {msg && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-950/20 border border-red-500/50 p-4 text-[10px] text-red-500 flex items-center gap-3 overflow-hidden"
              >
                <ShieldAlert size={14} /> ERR_04: {msg}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "#fff", color: "#000" }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="w-full py-5 bg-zinc-900 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={16} /> 
                Uplinking_Data
              </>
            ) : (
              <>
                Initialize_Enlistment <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <Link to="/login" className="text-[9px] text-zinc-600 hover:text-white transition-all tracking-[0.2em] uppercase">
            [ Exist_Operator? // Re-route_To_Login ]
          </Link>
        </div>
      </motion.div>

      {/* --- HUD DECORATION: SCANNING LINES --- */}
      <motion.div 
        animate={{ x: [-200, 200] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
        className="fixed bottom-10 right-10 w-40 h-40 border border-white/5 rounded-full flex items-center justify-center opacity-20"
      >
        <Disc size={60} className="animate-spin-slow text-white" />
      </motion.div>
    </div>
  );
}

function InputField({ label, placeholder, type, value, onChange }) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center gap-2">
        <div className="w-1 h-1 bg-white group-focus-within:bg-blue-500" />
        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</label>
      </div>
      <input 
        type={type} 
        value={value} 
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-white/[0.03] border border-white/5 p-4 text-xs focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all text-white placeholder:text-zinc-800"
      />
    </div>
  );
}