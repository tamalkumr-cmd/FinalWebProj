import React, { useEffect, useRef } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Plane, ArrowRight, Activity, Cpu, Radio, 
  ShieldCheck, Target, Globe, Zap, ChevronDown, Terminal 
} from "lucide-react";

export default function Home() {
  const containerRef = useRef(null);
  
  // 1. 🚀 PHYSICS-BASED SMOOTHING
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 40, 
    damping: 20, 
    restDelta: 0.001 
  });

  // Background Reactive Logic
  const bgScale = useTransform(smoothProgress, [0, 1], [1, 1.4]);
  const ghostTextX = useTransform(smoothProgress, [0, 1], ["0%", "-50%"]);

  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 1.5, smoothWheel: true }}>
      <div ref={containerRef} className="bg-black text-white selection:bg-white selection:text-black">
        
        {/* --- GLOBAL HUD: PROGRESS LINE --- */}
        <div className="fixed top-0 left-0 w-full h-[1px] bg-zinc-900 z-[100]">
          <motion.div 
            className="h-full bg-white origin-left" 
            style={{ scaleX: smoothProgress }} 
          />
        </div>

        {/* --- DYNAMIC BACKGROUND: GHOST TEXT & GRID --- */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div 
            style={{ x: ghostTextX }}
            className="absolute top-1/4 whitespace-nowrap text-[30vw] font-black text-white/[0.02] italic select-none"
          >
            PRECISION_SYSTEMS_AEROSPACE_COMMAND_LINK
          </motion.div>
          <motion.div  
            style={{ scale: bgScale }}
            className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:100px_100px]"
          />
        </div>

        {/* --- HERO: THE MONOLITH --- */}
        <section className="h-[120vh] flex flex-col items-center justify-center relative z-10 px-6">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-3 px-4 py-1 border border-white/10 rounded-full mb-8 bg-white/5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Signal_Locked // Core_v4</span>
              </div>
              <h1 className="text-[14vw] md:text-[11vw] font-black italic tracking-tighter uppercase leading-[0.75]">
                LIMITLESS<br/><span className="text-outline-mono">HORIZON</span>
              </h1>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 1 }}
              className="mt-16 flex flex-col items-center gap-10"
            >
              <p className="max-w-md text-zinc-500 font-mono text-[11px] uppercase tracking-[0.3em] leading-loose">
                Next-generation avionics and neural-link telemetry for elite fleet commanders. Optimized for zero-latency execution.
              </p>
              <Link to="/login" className="btn-mono group flex items-center gap-4">
                Initialize Access <Zap size={14} className="group-hover:text-yellow-400 transition-colors" />
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            style={{ opacity: useTransform(smoothProgress, [0, 0.1], [1, 0]) }}
            className="absolute bottom-10 flex flex-col items-center gap-4"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-zinc-700">Scroll to Decrypt</span>
            <ChevronDown size={16} className="text-zinc-800 animate-bounce" />
          </motion.div>
        </section>

        {/* --- SECTION 2: THE "STACKING" DOSSIERS --- */}
        <section className="relative z-10 px-6 md:px-20 pb-40">
          <div className="max-w-6xl mx-auto space-y-[40vh]">
            <StackCard 
              num="01" 
              title="QUANTUM_SYNC" 
              desc="Our sub-millisecond handshake protocol ensures your fleet's telemetry is synchronized across orbital relays with zero packet loss." 
              details={["2048-bit RSA Encryption", "Sub-1ms Latency", "Global Multi-Node"]}
              icon={<Activity size={48}/>}
              image="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072"
            />
            <StackCard 
              num="02" 
              title="GHOST_RADAR" 
              desc="Proprietary predictive pathing algorithms visualize vessel vectors 60 seconds before they occur, allowing for preemptive logistics management." 
              details={["AI Predictive Vectors", "Real-time Intercepts", "Thermal Mapping"]}
              icon={<Target size={48}/>}
              image="https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2070"
            />
            <StackCard 
              num="03" 
              title="AERO_SHIELD" 
              desc="Advanced security protocols wrap all communications in a hardware-encrypted shroud, rendering your strategic operations invisible to third-party scans." 
              details={["Military Grade Security", "Signal Masking", "Protocol Scrubbing"]}
              icon={<ShieldCheck size={48}/>}
              image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070"
            />
          </div>
        </section>

        {/* --- SECTION 3: PROTOCOL DATA MARQUEE --- */}
        <div className="py-20 flex overflow-hidden border-y border-white/5 bg-zinc-950/50 backdrop-blur-md">
          <motion.div 
            animate={{ x: [0, -1000] }} 
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex gap-20 items-center whitespace-nowrap"
          >
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-[6vw] font-black italic uppercase text-zinc-800 flex items-center gap-10">
                Data_Stream_Stable <Globe size={40} className="text-white" /> Link_Established
              </span>
            ))}
          </motion.div>
        </div>

        {/* --- FINAL CTA: THE HANDSHAKE --- */}
        <section className="h-screen flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 radial-blur opacity-20" />
          <motion.div 
            whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
            className="text-center z-10"
          >
            <h2 className="text-[12vw] font-black italic uppercase mb-10 leading-none">
              COMMAND<br /><span className="text-zinc-800">ACCEPTED.</span>
            </h2>
            <Link to="/register" className="btn-mono text-2xl group flex items-center gap-6 px-16 py-8">
              INITIALIZE <ArrowRight className="group-hover:translate-x-4 transition-transform" />
            </Link>
          </motion.div>
        </section>

        {/* --- FOOTER: THE VOID --- */}
        <footer className="py-10 px-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-[9px] font-black tracking-[0.4em] text-zinc-600">
            <Terminal size={12} />
            <span>NORS_AEROSPACE_DIV // ALL_RIGHTS_RESERVED</span>
          </div>
          <div className="flex gap-8 text-[9px] font-black tracking-[0.2em] text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">TERMINAL_LOGS</a>
            <a href="#" className="hover:text-white transition-colors">PRIVACY_SHROUD</a>
          </div>
        </footer>
      </div>
    </ReactLenis>
  );
}

// --- REFINED STACKING COMPONENT ---
function StackCard({ num, title, desc, details, icon, image }) {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { margin: "-20% 0px -20% 0px" });
  
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start start"]
  });

  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [0.85, 1]), { stiffness: 100, damping: 30 });
  const rotate = useTransform(scrollYProgress, [0, 1], [2, 0]);

  return (
    <motion.div 
      ref={cardRef}
      style={{ scale, rotate }}
      className={`sticky top-[15vh] h-[75vh] w-full bg-[#080808] border ${isInView ? 'border-white/20 shadow-[0_0_80px_rgba(255,255,255,0.05)]' : 'border-white/5'} rounded-3xl overflow-hidden flex flex-col md:flex-row transition-colors duration-1000`}
    >
      <div className="flex-1 p-10 md:p-16 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="font-mono text-zinc-500 text-sm tracking-widest">{num}</span>
            <div className="h-[1px] w-12 bg-zinc-800" />
          </div>
          <h3 className="text-5xl md:text-7xl font-black italic uppercase leading-none tracking-tighter">{title}</h3>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] leading-relaxed max-w-sm">{desc}</p>
          
          <ul className="space-y-2 pt-6">
            {details.map((detail, i) => (
              <li key={i} className="flex items-center gap-3 text-[10px] font-black tracking-widest text-zinc-400">
                <Zap size={10} className="text-white" /> {detail}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-white/10 group-hover:text-white/40 transition-colors">{icon}</div>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/40 to-transparent z-10" />
        <motion.img 
          initial={{ scale: 1.2 }}
          animate={isInView ? { scale: 1 } : { scale: 1.2 }}
          transition={{ duration: 2 }}
          src={image} 
          alt={title} 
          className="h-full w-full object-cover grayscale opacity-30" 
        />
      </div>
    </motion.div>
  );
}