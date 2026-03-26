import { useState, useRef, useEffect } from "react";
import { verifyOtp } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, AlertCircle, ShieldAlert, Cpu, Fingerprint, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Verify() {
  const nav = useNavigate();
  const inputRefs = useRef([]);
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!email) setMsg("IDENTITY_RECOGNITION_FAILED: Register First");
  }, [email]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    if (!email) return setMsg("ERR_NULL_IDENTITY");

    setIsSubmitting(true);
    const code = otp.join("");
    if (code.length < 6) {
      setMsg("INCOMPLETE_SEQUENCE");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await verifyOtp(email, code);
      if (res?.error) {
        setMsg(res.error);
        setIsSubmitting(false);
      } else {
        localStorage.removeItem("userEmail");
        nav("/login");
      }
    } catch (err) {
      setMsg("VERIFICATION_TIMEOUT");
      setIsSubmitting(false);
    }
  }

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] font-mono text-cyan-400 selection:bg-cyan-500 selection:text-white flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* --- CYBER GRID BACKGROUND --- */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#0891b2 1px, transparent 1px), linear-gradient(90deg, #0891b2 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent z-0"></div>

      {/* Pulsing Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse"></div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-[480px]"
      >
        {/* Top Logo branding */}
        <div className="text-center mb-10">
          <Link to="/" className="text-4xl font-black tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] uppercase italic">
            Nors<span className="text-cyan-500">.</span>os
          </Link>
        </div>

        {/* --- TACTICAL GLASS CARD --- */}
        <div className="relative group">
          {/* Outer Glow Border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          
          <div className="relative bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
            
            {/* Status Scanner Bar */}
            <motion.div 
              animate={{ x: [-400, 400] }} 
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute top-0 left-0 w-32 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            />

            <div className="mb-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <ShieldAlert className="text-cyan-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-2">Auth_Required</h2>
              <p className="text-cyan-400/60 text-center text-xs leading-relaxed uppercase tracking-wider">
                System sent encrypted key to: <br/>
                <span className="text-white bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 mt-2 inline-block">
                  {email || "anonymous_user"}
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* OTP Inputs */}
              <div className="flex justify-between gap-3">
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-full h-14 md:h-16 text-center text-xl font-bold rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-500 focus:bg-cyan-500/10 focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all placeholder-white/10"
                    placeholder="0"
                    value={digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>

              {/* Dynamic Messaging */}
              <AnimatePresence mode="wait">
                {msg && (
                  <motion.div 
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3"
                  >
                    <Radio size={16} className="animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{msg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="group w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 relative overflow-hidden shadow-[0_0_30px_rgba(8,145,170,0.4)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Cpu className="animate-spin" size={16} />
                    <span>Processing_Entry...</span>
                  </div>
                ) : (
                  <>
                    <Fingerprint size={18} className="group-hover:scale-110 transition-transform" />
                    <span>Bypass_Firewall</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                type="button"
                className="text-[10px] font-bold text-cyan-400/40 hover:text-cyan-300 uppercase tracking-widest transition-all"
              >
                [ Request_New_Sequence ]
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ambient Decals */}
      <div className="absolute top-10 right-10 flex flex-col gap-1 text-cyan-500/20 text-[10px] uppercase font-black">
        <span>Region: Node_01</span>
        <span>Secure: AES-256</span>
      </div>
    </div>
  );
}