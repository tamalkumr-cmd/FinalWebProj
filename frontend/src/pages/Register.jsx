import { useState } from "react";
import { register } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Lock, Mail, AlertCircle, Plane, UserPlus, ShieldAlert, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setIsSubmitting(true);
    
    try {
      const res = await register(email, password);
      if (res?.error) {
        setMsg(res.error);
        setIsSubmitting(false);
      } else {
        localStorage.setItem("userEmail", email); 
        nav("/verify"); 
      }
    } catch (err) {
      setMsg("Registration failed. System rejected credentials.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] font-mono text-cyan-400 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* --- CYBERPUNK LAYERS --- */}
      
      {/* 1. The Scanline Effect */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* 2. Grid & Glitch Glow */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#0891b2 1px, transparent 1px), linear-gradient(90deg, #0891b2 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* 3. Floating Aviation Elements */}
      <FloatingShape color="bg-cyan-500/20" size="w-20 h-20" top="15%" left="10%" delay={0} icon={<Plane className="text-cyan-400" />} />
      <FloatingShape color="bg-yellow-500/20" size="w-16 h-16" bottom="20%" left="5%" delay={1.5} icon={<ShieldAlert className="text-yellow-400" />} />
      <FloatingShape color="bg-purple-500/20" size="w-24 h-24" top="10%" right="15%" delay={0.5} icon={<Cpu className="text-purple-400" />} />

      {/* --- MAIN CARD --- */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="relative z-10 w-full max-w-[450px]"
      >
        {/* Header Logo */}
        <div className="mb-8 relative group">
           <h1 className="text-4xl font-black tracking-tighter text-white uppercase leading-none italic">
              NORS<span className="text-cyan-500 text-5xl">.</span><span className="text-yellow-400">AVIA</span>
           </h1>
           <div className="flex items-center gap-2 mt-2 text-[9px] tracking-[0.5em] text-cyan-600 font-bold uppercase">
              // REGISTER_NEW_OFFICER // SECTOR_01
           </div>
        </div>

        {/* The Card Stack Effect */}
        <div className="relative">
           {/* Shadow Layers */}
           <div className="absolute top-3 left-[-8px] w-full h-full bg-cyan-900/50 border border-cyan-500/30 rounded-lg -z-20 transform -rotate-1"></div>
           <div className="absolute top-1 left-[-4px] w-full h-full bg-black border border-cyan-500/20 rounded-lg -z-10"></div>

           {/* Actual Card (Terminal) */}
           <div className="bg-black/90 backdrop-blur-xl border border-cyan-500/40 rounded-lg p-8 md:p-10 relative overflow-hidden">
              
              {/* Corner Badge */}
              <div className="absolute -top-1 -right-1 bg-cyan-500 text-black px-4 py-1 font-black text-[10px] uppercase tracking-widest">
                  Level 0 Clearance
              </div>

              <div className="mt-4 mb-8">
                 <h2 className="text-2xl font-black mb-1 flex items-center gap-2 text-white uppercase tracking-tight">
                    Enlistment <UserPlus className="text-cyan-500" />
                 </h2>
                 <p className="text-cyan-900 text-[10px] font-bold uppercase tracking-widest">Initialize your pilot credentials.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                 <InputField 
                    label="Officer Uplink (Email)" 
                    type="email" 
                    placeholder="NAME@NORS.AVIA"
                    value={email}
                    onChange={setEmail}
                    icon={<Mail size={18} />}
                 />

                 <InputField 
                    label="Access Cipher (Password)" 
                    type="password" 
                    placeholder="SET_ENCRYPTION_KEY"
                    value={password}
                    onChange={setPassword}
                    icon={<Lock size={18} />}
                    isPassword
                 />

                 {/* Error Message */}
                 {msg && (
                    <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 text-[10px] font-bold flex items-center gap-3"
                    >
                       <AlertCircle className="shrink-0" size={16} />
                       <span>[SYSTEM_ERROR] :: {msg.toUpperCase()}</span>
                    </motion.div>
                 )}

                 {/* Submit Button */}
                 <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="group w-full bg-cyan-500 text-black py-4 font-black text-sm tracking-[0.2em] shadow-[4px_4px_0px_0px_#fbbf24] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:scale-95 transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                    style={{ clipPath: 'polygon(5% 0%, 100% 0%, 100% 75%, 95% 100%, 0% 100%, 0% 25%)' }}
                 >
                    {isSubmitting ? "ENCRYPTING..." : "INITIALIZE_ENLISTMENT"}
                    {!isSubmitting && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                 </button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-cyan-950">
                 <p className="text-[10px] font-bold text-cyan-900 uppercase tracking-widest">
                    Existing personnel?{" "}
                    <Link to="/login" className="text-cyan-400 hover:text-white transition-colors underline decoration-cyan-500 underline-offset-4">
                        Access_Terminal
                    </Link>
                 </p>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function InputField({ label, type, placeholder, value, onChange, icon }) {
   return (
      <div className="space-y-2">
         <label className="text-[10px] font-bold text-cyan-700 uppercase tracking-[0.3em] ml-1">{label}</label>
         <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-cyan-800 group-focus-within:text-cyan-400 transition-colors">
               {icon}
            </div>
            <input
               type={type}
               value={value}
               onChange={(e) => onChange(e.target.value)}
               className="w-full bg-cyan-950/20 border border-cyan-900 focus:border-cyan-400 py-3.5 pl-11 pr-4 font-bold outline-none transition-all text-cyan-400 text-xs placeholder-cyan-900"
               placeholder={placeholder}
               required
            />
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-yellow-400 group-focus-within:w-full transition-all duration-500" />
         </div>
      </div>
   );
}

function FloatingShape({ color, size, top, left, right, bottom, delay, icon }) {
   return (
      <motion.div
         animate={{ 
            y: [0, -30, 0], 
            rotate: [0, 5, -5, 0],
            opacity: [0.2, 0.5, 0.2]
         }}
         transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: delay
         }}
         className={`absolute ${color} ${size} border border-cyan-500/20 rounded-xl flex items-center justify-center text-3xl z-0 hidden md:flex`}
         style={{ top, left, right, bottom }}
      >
         {icon}
      </motion.div>
   )
}