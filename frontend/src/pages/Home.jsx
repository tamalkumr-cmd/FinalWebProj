import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, Globe, ShieldCheck, Zap, ArrowRight, 
  Navigation, Activity, Cpu, ChevronDown, 
  Radar, Terminal, Radio
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-cyan-400 font-mono selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      
      {/* --- SCANLINE OVERLAY --- */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* --- NAV --- */}
      <nav className="fixed top-0 w-full z-[60] bg-black/80 backdrop-blur-md border-b border-cyan-500/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter italic flex items-center gap-2 group">
            <Plane className="group-hover:rotate-45 transition-transform text-yellow-400" />
            <span className="text-white">NORS</span> <span className="text-cyan-500">AVIATION</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hidden md:block font-bold text-xs tracking-widest hover:text-white transition-colors">
              [ ACCESS_PORT ]
            </Link>
            <Link
              to="/register"
              className="font-bold text-xs tracking-widest bg-cyan-500 text-black px-5 py-2.5 rounded-sm hover:bg-yellow-400 transition-all clip-path-cyber"
              style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0% 30%)' }}
            >
              INITIALIZE_SYSTEM
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-48 pb-20 px-6 max-w-7xl mx-auto text-center">
        {/* Decorative Radar Circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/10 rounded-full animate-pulse -z-10" />
        
        <div className="inline-block mb-6 px-4 py-1 bg-yellow-400/10 border border-yellow-400 text-yellow-400 text-[10px] font-black uppercase tracking-[0.3em]">
          System Status: Optimal // Core v4.0.2
        </div>

        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-white">
          COMMAND THE SKY.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            AUTOMATE LOGISTICS.
          </span>
        </h1>

        <p className="text-lg md:text-xl font-medium text-cyan-700 max-w-2xl mx-auto mb-10">
          Next-generation Aviation Management for the digital age. 
          Real-time telemetry, automated ATC coordination, and neural-link fleet tracking.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
          <Link
            to="/register"
            className="px-8 py-4 bg-cyan-500 text-black font-black text-lg shadow-[4px_4px_0px_0px_#fbbf24] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-2 clip-path-cyber"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 90% 100%, 0 100%)' }}
          >
            Launch Terminal <Navigation className="w-5 h-5" />
          </Link>
          <button className="px-8 py-4 bg-transparent text-cyan-400 border border-cyan-500 font-black text-lg hover:bg-cyan-500/10 transition-all">
            Technical Manual
          </button>
        </div>

        {/* Fleet Mockup Visual */}
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-yellow-500 rounded-lg blur opacity-20 animate-pulse"></div>
          <div className="relative bg-black border border-cyan-500/50 rounded-lg p-4 md:p-6 grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-cyan-950/20 p-4 border border-cyan-500/20 flex flex-col gap-2">
                 <div className="flex justify-between items-center text-[10px] text-cyan-600 font-bold">
                    <span>RADAR_SCAN</span>
                    <Radar size={14} className="animate-spin" />
                 </div>
                 <div className="h-32 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] flex items-center justify-center border border-cyan-500/10">
                    <Plane className="text-cyan-400/50 rotate-45" size={48} />
                 </div>
              </div>
              <div className="bg-cyan-950/20 p-4 border border-cyan-500/20">
                 <div className="text-[10px] text-yellow-400 mb-4 tracking-widest font-bold uppercase">Active_Fleet_Status</div>
                 <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-between items-center text-[12px] border-b border-cyan-500/10 pb-2">
                        <span className="text-white">FLIGHT_NORS_{700 + i}</span>
                        <span className="text-emerald-400">ON_PATH</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="bg-cyan-950/20 p-4 border border-cyan-500/20 flex flex-col justify-between">
                 <div>
                    <div className="text-3xl font-black text-white">12,840</div>
                    <div className="text-[10px] font-bold uppercase text-cyan-600">Total Flight Hours</div>
                 </div>
                 <div className="h-10 bg-cyan-500 text-black font-black flex items-center justify-center text-xs">
                    SYSTEM_REPORT.PDF
                 </div>
              </div>
          </div>
        </div>
      </section>

      {/* --- DATA STREAM MARQUEE --- */}
      <div className="bg-cyan-500 text-black py-3 border-y border-cyan-500 overflow-hidden -rotate-1 transform scale-105">
        <div className="whitespace-nowrap animate-marquee flex gap-10">
          {[...Array(10)].map((_, i) => (
             <span key={i} className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-4">
               🛰️ SATELLITE LINK ESTABLISHED <span className="text-black/50">::</span> 
               TRANSITING VECTOR 090 <span className="text-black/50">::</span>
               FUEL_LOAD: 88% <span className="text-black/50">::</span>
             </span>
          ))}
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <section className="py-20 px-6 bg-black border-b border-cyan-500/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-center">
           {[
             { num: "500+", label: "Vessels Managed" },
             { num: "0.02ms", label: "Link Latency" },
             { num: "GLOBAL", label: "ATC Coverage" }
           ].map((stat, i) => (
             <div key={i} className="group cursor-default">
               <h3 className="text-5xl md:text-6xl font-black mb-2 text-white group-hover:text-cyan-400 transition-colors">{stat.num}</h3>
               <p className="font-bold text-cyan-800 text-xs uppercase tracking-[0.5em]">{stat.label}</p>
             </div>
           ))}
        </div>
      </section>

      {/* --- CORE MODULES --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-6xl font-black mb-4 text-white uppercase tracking-tighter">System Modules</h2>
          <p className="text-cyan-700 font-bold uppercase tracking-widest text-xs">Hardware-Software integration for elite flight ops.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            title="Auto-Pilot v4" 
            desc="AI-driven flight adjustment with zero human latency." 
            icon={<Cpu />} 
            color="hover:bg-cyan-500/10" 
          />
          <FeatureCard 
            title="ATC Overlink" 
            desc="Direct neural communication with international towers." 
            icon={<Radio />} 
            color="hover:bg-yellow-400/10" 
          />
          <FeatureCard 
            title="Fleet Telemetry" 
            desc="Real-time fuel, heat, and engine health diagnostics." 
            icon={<Activity />} 
            color="hover:bg-purple-500/10" 
          />
          <FeatureCard 
            title="Global Shield" 
            desc="Advanced weather avoidance and security protocols." 
            icon={<ShieldCheck />} 
            color="hover:bg-emerald-500/10" 
          />
        </div>
      </section>

      {/* --- FAQ / SYSTEM DOCS --- */}
      <section className="py-20 px-6 max-w-3xl mx-auto">
         <h2 className="text-3xl font-black mb-10 text-center text-white uppercase tracking-widest">Protocol Query</h2>
         <div className="space-y-4">
            <FaqItem question="Vessel Compatibility?" answer="NORS Aviation is compatible with all Boeing, Airbus, and Lockheed-Martin digital glass cockpits." />
            <FaqItem question="Data Privacy?" answer="End-to-end 2048-bit encryption for all flight data and mission-critical communications." />
            <FaqItem question="Offline Redundancy?" answer="Local nodes sustain ATC coordination for up to 48 hours without satellite uplink." />
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0a0a0a] text-cyan-900 py-16 px-6 border-t border-cyan-500/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
           <div className="mb-8 md:mb-0">
              <h2 className="text-3xl font-black italic mb-4 text-white">NORS AVIATION.</h2>
              <p className="max-w-sm text-xs leading-loose opacity-50 font-bold uppercase tracking-widest">
                Official Fleet Management Division. Unauthorized access is a violation of international aviation law.
              </p>
           </div>
           <div className="flex gap-8 text-[10px] font-black tracking-[0.3em]">
              <a href="#" className="text-cyan-500 hover:text-white transition-colors underline underline-offset-8">TWITTER.NET</a>
              <a href="#" className="text-cyan-500 hover:text-white transition-colors underline underline-offset-8">GTIHUB.NAS</a>
              <a href="#" className="text-cyan-500 hover:text-white transition-colors underline underline-offset-8">PRIVACY_PROTOCOL</a>
           </div>
        </div>
      </footer>

    </div>
  );
}

// --- SUB COMPONENTS ---

function FeatureCard({ title, desc, icon, color }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-6 bg-black border border-cyan-500/20 rounded-sm transition-all ${color} group cursor-crosshair`}
    >
      <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400 group-hover:text-white transition-colors">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h3 className="text-sm font-black mb-2 text-white uppercase tracking-widest">{title}</h3>
      <p className="text-[11px] font-bold text-cyan-900 leading-relaxed uppercase tracking-tight group-hover:text-cyan-700 transition-colors">{desc}</p>
    </motion.div>
  );
}

function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-cyan-500/30 bg-black/50 backdrop-blur-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 text-left font-black text-xs tracking-widest uppercase hover:bg-cyan-500/10 text-cyan-400"
      >
        {`> ${question}`}
        <ChevronDown className={`transition-transform ${isOpen ? "rotate-180 text-yellow-400" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 text-[11px] text-cyan-800 font-bold uppercase leading-relaxed border-t border-cyan-500/10">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}