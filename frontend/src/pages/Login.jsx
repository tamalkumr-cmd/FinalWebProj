import { useState } from "react";
import { login } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import axios from "axios";
import { ArrowRight, Lock, Mail, AlertCircle, Plane, Radio, Zap, Terminal, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const nav = useNavigate();

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
      setMsg("Auth sequence failed.");
      setIsSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setMsg("");
      setIsGoogleSubmitting(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        token: idToken,
      });
      localStorage.setItem("token", res.data.token);
      if (setToken) setToken(res.data.token);
      nav("/dashboard");
    } catch (err) {
      setMsg("SSO Link severed.");
      setIsGoogleSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] font-mono text-cyan-400 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* --- CYBERPUNK BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]" />
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#0891b2 1px, transparent 1px), linear-gradient(90deg, #0891b2 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      
      {/* Glitchy Orbs */}
      <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-pink-500/10 blur-[100px] rounded-full animate-pulse" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Logo Section */}
        <div className="mb-8 relative group">
           <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none italic">
              NORS<span className="text-cyan-500 text-5xl">.</span><span className="text-yellow-400">AVIA</span>
           </h1>
           <div className="flex items-center gap-2 mt-2 text-[9px] tracking-[0.5em] text-cyan-600 font-bold uppercase">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> Uplink Active // Sector 7G
           </div>
        </div>

        {/* Main Interface Frame */}
        <div className="relative">
           {/* Geometric Accents */}
           <div className="absolute -top-3 -right-3 w-12 h-12 border-t border-r border-cyan-500/50" />
           <div className="absolute -bottom-3 -left-3 w-12 h-12 border-b border-l border-yellow-500/50" />

           <div className="bg-black/90 backdrop-blur-xl border border-cyan-500/20 p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
              
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h2 className="text-white text-xs font-black tracking-[0.2em] uppercase flex items-center gap-2">
                    <Terminal size={14} className="text-cyan-500" /> System_Access
                  </h2>
                  <div className="h-[1px] w-full bg-gradient-to-r from-cyan-500 to-transparent" />
                </div>
                <ShieldCheck size={18} className="text-cyan-800" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <CyberInput 
                  label="USER_IDENTIFIER" 
                  type="email" 
                  placeholder="ID_0081@NORS.SYSTEMS"
                  value={email}
                  onChange={setEmail}
                  icon={<Mail size={16} />}
                />

                <CyberInput 
                  label="SECURITY_HASH" 
                  type="password" 
                  placeholder="********"
                  value={password}
                  onChange={setPassword}
                  icon={<Lock size={16} />}
                />

                {msg && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="bg-red-500/10 border border-red-500 text-red-500 p-3 text-[10px] font-black uppercase flex items-center gap-2"
                  >
                    <AlertCircle size={14} /> [CRITICAL] :: {msg}
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-cyan-600 text-black py-4 font-black uppercase tracking-widest hover:bg-cyan-400 active:scale-95 transition-all flex items-center justify-center gap-3"
                  style={{ clipPath: 'polygon(5% 0%, 100% 0%, 100% 75%, 95% 100%, 0% 100%, 0% 25%)' }}
                >
                  {isSubmitting ? "SYNCING..." : "INITIALIZE_LOGIN"}
                  <Zap size={18} className="fill-black" />
                </button>
              </form>

              {/* SSO Section */}
              <div className="relative flex py-8 items-center">
                 <div className="flex-grow border-t border-cyan-900"></div>
                 <span className="flex-shrink-0 mx-4 text-[9px] text-cyan-800 font-bold uppercase tracking-[0.3em]">External_Link</span>
                 <div className="flex-grow border-t border-cyan-900"></div>
              </div>

              <button
                 type="button"
                 onClick={handleGoogleLogin}
                 disabled={isGoogleSubmitting}
                 className="w-full bg-transparent border border-cyan-900 hover:border-cyan-400 hover:bg-cyan-500/5 py-4 text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 text-cyan-600 hover:text-cyan-400"
              >
                 <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 grayscale group-hover:grayscale-0" alt="G" />
                 Login with Corporate Mail
              </button>

              <div className="mt-8 text-center flex justify-between items-center px-2">
                 <Link to="/register" className="text-[10px] text-cyan-900 hover:text-cyan-400 transition-colors uppercase font-bold tracking-tighter">
                    {">"} Request_Access
                 </Link>
                 <span className="text-[10px] text-cyan-950 font-bold">VER_2.9.0</span>
              </div>
           </div>
        </div>
      </motion.div>

      {/* Footer Anim Decor */}
      <div className="absolute bottom-10 right-10 text-cyan-900 text-[10px] font-mono space-y-1 hidden md:block">
        <div>X: {Math.random().toFixed(4)}</div>
        <div>Y: {Math.random().toFixed(4)}</div>
        <div className="text-cyan-500 animate-pulse">STATUS: DEPLOYED</div>
      </div>
    </div>
  );
}

function CyberInput({ label, type, placeholder, value, onChange, icon }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center px-1">
        <label className="text-[9px] font-bold text-cyan-700 tracking-[0.2em]">{label}</label>
      </div>
      <div className="relative group">
        <div className="absolute left-3 inset-y-0 flex items-center text-cyan-800 group-focus-within:text-yellow-400 transition-colors">
          {icon}
        </div>
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-cyan-950/20 border border-cyan-900 focus:border-cyan-400 py-3.5 pl-10 pr-4 outline-none text-cyan-400 text-xs placeholder-cyan-950 transition-all"
          placeholder={placeholder}
          required
        />
        <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-yellow-400 group-focus-within:w-full transition-all duration-300" />
      </div>
    </div>
  );
}