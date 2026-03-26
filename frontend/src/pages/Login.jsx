import React, { useState, useEffect } from "react";
import { login } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import axios from "axios";
import { 
  ArrowRight, Lock, Mail, AlertCircle, Zap, 
  Terminal, ShieldCheck, Activity, Radio, Cpu 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const nav = useNavigate();

  // --- STANDARD AUTH ---
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res?.error) {
        setMsg(res.error);
        setIsSubmitting(false);
      } else {
        localStorage.setItem("token", res.token);
        if (setToken) setToken(res.token);
        nav("/dashboard");
      }
    } catch (err) {
      setMsg("AUTH_SEQUENCE_FAILED");
      setIsSubmitting(false);
    }
  }

  // --- GOOGLE SSO AUTH ---
  async function handleGoogleLogin() {
    try {
      setMsg("");
      setIsGoogleSubmitting(true);
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        token: idToken,
      });
      localStorage.setItem("token", res.data.token);
      if (setToken) setToken(res.data.token);
      nav("/dashboard");
    } catch (err) {
      setMsg("SSO_LINK_SEVERED");
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020202] font-mono text-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* --- LAYER 1: CRT SCANLINE & GRID --- */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(255,255,255,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_4px,4px_100%]" />
      <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* --- LAYER 2: AMBIENT GLOWS --- */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[460px]"
      >
        {/* LOGO HUD */}
        <div className="mb-10 flex justify-between items-end border-b border-white/5 pb-6">
            <div className="space-y-1">
                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                    NORS<span className="text-zinc-800">.AVIA</span>
                </h1>
                <div className="flex items-center gap-2 text-[8px] tracking-[0.6em] text-zinc-500 font-black uppercase">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" /> 
                   Uplink_Secure // Sector_04
                </div>
            </div>
            <div className="text-right hidden sm:block">
                <div className="text-[10px] font-black text-zinc-800">NODE_0881</div>
                <div className="text-[8px] font-bold text-zinc-600">STABLE_CONNECTION</div>
            </div>
        </div>

        {/* INTERFACE TERMINAL */}
        <div className="relative group">
            {/* Tactical Corners */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t border-l border-white/20 group-hover:border-white transition-colors duration-500" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b border-r border-white/20 group-hover:border-white transition-colors duration-500" />

            <div className="bg-zinc-950/80 backdrop-blur-3xl border border-white/5 p-10 shadow-[0_0_100px_rgba(0,0,0,1)]">
              
              <div className="flex justify-between items-center mb-12">
                <div className="space-y-1 w-full">
                  <h2 className="text-zinc-400 text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-3 italic">
                    <Terminal size={12} className="text-white" /> Authentication_Required
                  </h2>
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="h-[1px] w-full bg-gradient-to-r from-white/20 to-transparent origin-left" 
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <CyberInput 
                  label="OPERATOR_MANIFEST_ID" 
                  type="email" 
                  placeholder="ID_0442@NORS.AVIA"
                  value={email}
                  onChange={setEmail}
                  icon={<Mail size={16} />}
                />

                <CyberInput 
                  label="MASTER_CIPHER_KEY" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                  icon={<Lock size={16} />}
                />

                <AnimatePresence>
                  {msg && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-white/5 border-l-2 border-white p-4 text-[9px] font-black uppercase text-white flex items-center gap-3 overflow-hidden"
                    >
                      <AlertCircle size={14} className="animate-pulse" /> {`Protocol_Err: ${msg}`}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="group relative w-full bg-white text-black py-5 font-black uppercase italic tracking-widest text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-4 active:scale-95"
                  style={{ clipPath: 'polygon(4% 0%, 100% 0%, 100% 75%, 96% 100%, 0% 100%, 0% 25%)' }}
                >
                  {isSubmitting ? "SYNCING_NODE..." : "INITIALIZE_TAKEOFF"}
                  <Zap size={18} className="fill-black group-hover:animate-bounce" />
                </button>
              </form>

              {/* SSO DATALINK */}
              <div className="relative flex py-10 items-center">
                 <div className="flex-grow border-t border-white/5"></div>
                 <span className="flex-shrink-0 mx-4 text-[8px] text-zinc-700 font-black uppercase tracking-[0.5em]">SSO_UPLINK</span>
                 <div className="flex-grow border-t border-white/5"></div>
              </div>

              <button
                 type="button"
                 onClick={handleGoogleLogin}
                 disabled={isGoogleSubmitting}
                 className="group w-full bg-transparent border border-white/10 hover:border-white/40 hover:bg-white/5 py-5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-4 text-zinc-500 hover:text-white"
              >
                 <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="G" />
                 {isGoogleSubmitting ? "Linking_Satelite..." : "Google_Handshake_Entry"}
              </button>

              <div className="mt-12 text-center flex justify-between items-center px-2">
                 <Link to="/register" className="text-[9px] text-zinc-700 hover:text-white transition-all uppercase font-black border-b border-transparent hover:border-white/20 pb-1">
                    [ Request_Credential_Manifest ]
                 </Link>
                 <div className="flex gap-4 opacity-20">
                    <Activity size={12} />
                    <Radio size={12} />
                 </div>
              </div>
            </div>
        </div>
      </motion.div>

      {/* TACTICAL HUD DECOR */}
      <div className="fixed bottom-10 left-10 text-zinc-800 text-[9px] font-black space-y-2 hidden lg:block tracking-widest">
        <div className="flex items-center gap-3"><Cpu size={12}/> CORE_LOAD: 2.4%</div>
        <div className="flex items-center gap-3"><Radio size={12}/> SIG_STRENGTH: 94%</div>
        <div className="text-white opacity-40 animate-pulse">SYSTEM_ACTIVE // VER_4.0</div>
      </div>
    </div>
  );
}

// REUSABLE HUD INPUT
function CyberInput({ label, type, placeholder, value, onChange, icon }) {
  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] font-black text-zinc-600 tracking-[0.3em] uppercase italic">{label}</label>
      </div>
      <div className="relative">
        <div className="absolute left-4 inset-y-0 flex items-center text-zinc-700 group-focus-within:text-white transition-colors">
          {icon}
        </div>
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/[0.02] border border-white/5 focus:border-white/20 focus:bg-white/[0.04] py-4 pl-12 pr-4 outline-none text-white text-xs placeholder-zinc-900 transition-all italic font-bold"
          placeholder={placeholder}
          required
        />
        <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-white group-focus-within:w-full transition-all duration-500" />
      </div>
    </div>
  );
}