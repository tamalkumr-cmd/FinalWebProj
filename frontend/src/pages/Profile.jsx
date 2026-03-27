import React from "react";
import { motion } from "framer-motion";
import { 
  User, 
  ShieldCheck, 
  Award, 
  Activity, 
  Clock, 
  MapPin, 
  ChevronRight,
  LogOut,
  Settings,
  Fingerprint
} from "lucide-react";

export default function Profile() {
  // Mock data - replace with your actual user context/state
  const userData = {
    callsign: "Tamal",
    registrySerial: "5512",
    clearance: "B9",
    status: "ACTIVE_DUTY",
    experience: "1250_FLIGHT_HRS",
    lastMission: "FWQFQ // WQFQF"
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-[#001F3F] font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* --- TOP HUD NAVIGATION --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-white/50">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
               <Fingerprint size={14} /> SECURITY_ENCRYPTED_SESSION
            </div>
            <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none text-[#001F3F]">
              Personnel_<span className="text-blue-200">Dossier</span>
            </h1>
            <p className="mt-4 text-[11px] font-black text-blue-300 tracking-[0.4em] uppercase">Master_Record // FE38CDAB3C49</p>
          </motion.div>

          <div className="flex gap-4">
            <button className="px-6 py-3 bg-white border border-white text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-[#007BFF] transition-all shadow-xl shadow-blue-900/5 flex items-center gap-2">
               <Settings size={14} /> [ CONFIG ]
            </button>
            <button className="px-6 py-3 bg-[#FF7F50] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-500 transition-all shadow-xl shadow-orange-500/20 flex items-center gap-2">
               <LogOut size={14} /> [ TERMINATE_SESSION ]
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- LEFT: IDENTITY BLOCK --- */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[3rem] p-10 shadow-xl shadow-blue-900/5 text-center">
              <div className="relative inline-block group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#007BFF] to-blue-200 rounded-[3.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative w-48 h-48 rounded-[3rem] border-8 border-white overflow-hidden shadow-2xl mx-auto bg-blue-50">
                  <img 
                    src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39" 
                    alt="Pilot Avatar" 
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#00E676] text-white text-[10px] font-black px-6 py-2 rounded-full shadow-lg">
                  {userData.status}
                </div>
              </div>

              <div className="mt-12 space-y-2">
                <h2 className="text-4xl font-black italic text-[#001F3F] tracking-tighter uppercase">{userData.callsign}</h2>
                <p className="text-blue-300 font-black text-[11px] tracking-[0.3em] uppercase">Clearance_Level: {userData.clearance}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10">
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                  <p className="text-[9px] font-black text-blue-200 uppercase mb-1">Rank</p>
                  <p className="text-[12px] font-black text-[#001F3F]">COMMANDER</p>
                </div>
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                  <p className="text-[9px] font-black text-blue-200 uppercase mb-1">Serial</p>
                  <p className="text-[12px] font-black text-[#001F3F]">#{userData.registrySerial}</p>
                </div>
              </div>
            </div>

            {/* PERFORMANCE METRIC */}
            <div className="bg-[#001F3F] rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-900/40 relative overflow-hidden">
               <Activity className="absolute -right-4 -top-4 opacity-10 w-40 h-40" />
               <p className="text-[10px] font-black tracking-[0.4em] uppercase text-blue-400 mb-6">Mission_Efficiency</p>
               <div className="flex items-end gap-2 mb-2">
                  <span className="text-6xl font-black italic tracking-tighter leading-none">98.4</span>
                  <span className="text-xl font-black italic text-blue-400 mb-1">%</span>
               </div>
               <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-[98.4%] h-full bg-[#007BFF] animate-pulse"></div>
               </div>
            </div>
          </div>

          {/* --- RIGHT: OPERATIONAL DATA --- */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* CORE ATTRIBUTES */}
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[4rem] p-12 shadow-2xl shadow-blue-900/5">
              <div className="flex items-center gap-4 mb-12">
                <div className="p-3 border border-blue-50 rounded-2xl bg-white text-[#007BFF] shadow-sm"><ShieldCheck size={20}/></div>
                <span className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-300 italic">Operational_Attributes</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <ProfileField label="Identity_Callsign" value={userData.callsign} icon={<User size={16}/>} />
                <ProfileField label="Registry_Serial" value={`# ${userData.registrySerial}`} icon={<Award size={16}/>} />
                <ProfileField label="Experience_Log" value={userData.experience} icon={<Clock size={16}/>} />
                <ProfileField label="Primary_Deployment" value="SECTOR_BLUE_MUMBAI" icon={<MapPin size={16}/>} />
              </div>
            </div>

            {/* RECENT MISSION FEED */}
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[4rem] p-12 shadow-2xl shadow-blue-900/5">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 border border-blue-50 rounded-2xl bg-white text-[#007BFF] shadow-sm"><Activity size={20}/></div>
                  <span className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-300 italic">Mission_Experience_Log</span>
                </div>
                <button className="text-[10px] font-black text-[#007BFF] uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                  Full_Log <ChevronRight size={14}/>
                </button>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-blue-50/30 border border-blue-100 rounded-3xl group hover:bg-white transition-all cursor-pointer">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-blue-50 text-[#001F3F] font-black">0{i+1}</div>
                      <div>
                        <p className="text-[12px] font-black text-[#001F3F]">VECTOR_LOCK: {userData.lastMission}</p>
                        <p className="text-[10px] font-black text-blue-200">2026-03-27 // STATUS: SUCCESS</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-blue-100 group-hover:text-[#007BFF] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SHARED COMPONENT ---
const ProfileField = ({ label, value, icon }) => (
  <div className="flex flex-col gap-4">
    <label className="text-[13px] font-black text-blue-300 uppercase tracking-widest italic ml-2 flex items-center gap-2">
      {icon} {label}
    </label>
    <div className="bg-[#F4F9FF] border border-blue-100 rounded-2xl p-6 text-[15px] text-[#001F3F] font-black italic shadow-inner flex items-center justify-between">
      {value}
      <div className="w-2 h-2 rounded-full bg-blue-100"></div>
    </div>
  </div>
);