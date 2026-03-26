import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Package, Download, ShieldCheck, 
  Users, Briefcase, Layout, Terminal, 
  ChevronRight, Cpu, Layers 
} from "lucide-react";
import { useLoadmaster } from "../hooks/useLoadmaster";

export default function MissionControl() {
  const [deckType, setDeckType] = useState("PASSENGER");
  const { seats, setSeats, crew, setCrew } = useLoadmaster(120);

  const fontStack = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif";

  const downloadManifest = () => {
    const manifest = {
      vessel_type: deckType,
      crew: crew,
      capacity_used: seats.filter(s => s.status === 'OCCUPIED').length,
      timestamp: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `mission_manifest_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const occupiedCount = seats.filter(s => s.status === 'OCCUPIED').length;

  return (
    <div 
      style={{ fontFamily: fontStack }}
      className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] p-6 md:p-12 selection:bg-[#007AFF] selection:text-white"
    >
      {/* 📡 HUD HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-[#D1D1D6] pb-10 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[#007AFF] text-white text-[10px] font-black rounded-full shadow-lg shadow-[#007AFF]/20 uppercase tracking-widest">
              Live_Config
            </span>
            <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-[0.3em]">Protocol_v4.0.2</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight uppercase italic">
            Deck_<span className="text-[#8E8E93]">Architect</span>
          </h1>
        </motion.div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-white p-1.5 rounded-2xl flex gap-2 border border-[#D1D1D6] shadow-sm">
            <TabBtn active={deckType === 'PASSENGER'} onClick={() => setDeckType("PASSENGER")} label="PAX" />
            <TabBtn active={deckType === 'CARGO'} onClick={() => setDeckType("CARGO")} label="CARGO" />
          </div>
          <button 
            onClick={downloadManifest} 
            className="flex items-center gap-3 bg-[#1C1C1E] text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all hover:bg-black active:scale-95 shadow-xl"
          >
            <Download size={18} /> <span className="uppercase tracking-widest">Export Manifest</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 🛠️ LEFT: CREW & TELEMETRY */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* CAPACITY HUD */}
          <div className="bg-white border border-[#D1D1D6] rounded-[2.5rem] p-8 shadow-xl shadow-black/5">
            <div className="flex justify-between items-end mb-6">
               <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-widest">Load_Utilization</h3>
               <span className="text-2xl font-black text-[#007AFF] italic">{Math.round((occupiedCount/seats.length)*100)}%</span>
            </div>
            <div className="h-3 bg-[#F2F2F7] rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(occupiedCount/seats.length)*100}%` }}
                    className="h-full bg-[#007AFF] shadow-[0_0_15px_rgba(0,122,255,0.4)]"
                />
            </div>
          </div>

          {/* CREW MATRIX */}
          <div className="bg-white border border-[#D1D1D6] rounded-[2.5rem] p-8 shadow-xl shadow-black/5">
            <div className="flex items-center gap-3 mb-8">
                <Users size={20} className="text-[#007AFF]" />
                <h3 className="text-sm font-extrabold uppercase tracking-widest">Crew_Duty_Matrix</h3>
            </div>
            <div className="space-y-4">
              {crew.map((member, i) => (
                <motion.div 
                  key={member.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 bg-[#F2F2F7] border border-[#E5E5EA] rounded-3xl flex items-center gap-5 group hover:bg-white hover:border-[#007AFF] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#8E8E93] group-hover:text-[#007AFF] shadow-sm transition-colors">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-[#8E8E93] font-extrabold uppercase tracking-tighter mb-1">{member.role}</p>
                    <input 
                      className="bg-transparent border-none text-[#1C1C1E] font-bold text-lg focus:outline-none w-full placeholder-[#AEAEB2]" 
                      placeholder="Assign Staff..."
                      value={member.name}
                      onChange={(e) => {
                        const newCrew = [...crew];
                        newCrew[member.id-1].name = e.target.value;
                        setCrew(newCrew);
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 🚀 RIGHT: VISUAL DECK GRID */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-[#D1D1D6] rounded-[3rem] p-10 shadow-2xl shadow-black/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                <Layers size={300} />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
               <div className="flex items-center gap-4">
                 <div className="p-3 bg-[#1C1C1E] rounded-2xl text-white">
                    <Cpu size={20} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold tracking-tight">Aerospatial_Grid</h3>
                    <p className="text-xs font-bold text-[#AEAEB2] uppercase tracking-widest">{deckType}_Configuration</p>
                 </div>
               </div>
               
               <div className="flex gap-6 bg-[#F2F2F7] px-6 py-3 rounded-2xl border border-[#E5E5EA]">
                  <LegendItem color="bg-[#007AFF]" label="Business" />
                  <LegendItem color="bg-[#D1D1D6]" label="Economy" />
                  <LegendItem color="bg-[#1C1C1E]" label="Occupied" />
               </div>
            </div>

            {/* DECK GRID */}
            <div className={`grid ${deckType === 'PASSENGER' ? 'grid-cols-6 sm:grid-cols-8 md:grid-cols-10' : 'grid-cols-4 sm:grid-cols-6'} gap-4 p-8 bg-[#F2F2F7] rounded-[2.5rem] border border-[#E5E5EA] shadow-inner`}>
              <AnimatePresence mode="popLayout">
                {seats.map((seat, i) => (
                  <motion.div
                    key={seat.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      const newSeats = [...seats];
                      newSeats[seat.id-1].status = seat.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
                      setSeats(newSeats);
                    }}
                    className={`aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 shadow-sm
                      ${seat.status === 'OCCUPIED' 
                        ? 'bg-[#1C1C1E] text-white shadow-lg' 
                        : seat.class === 'BUSINESS' 
                          ? 'bg-white border-2 border-[#007AFF] text-[#007AFF]' 
                          : 'bg-white border border-[#D1D1D6] text-[#AEAEB2] hover:border-[#007AFF]'}`}
                  >
                    {deckType === 'PASSENGER' ? <User size={16} /> : <Package size={16} />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 px-8 py-6 bg-white/50 border border-white rounded-[2rem] backdrop-blur-md">
             <Terminal size={18} className="text-[#8E8E93]" />
             <p className="text-xs font-medium text-[#8E8E93] italic uppercase tracking-wider leading-relaxed">
                Unit telemetry sync active. Toggle modules to update manifest in real-time.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- TACTICAL SUB-COMPONENTS ---

function TabBtn({ active, onClick, label }) {
    return (
        <button 
            onClick={onClick}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500
            ${active ? 'bg-[#1C1C1E] text-white shadow-lg shadow-black/20' : 'text-[#8E8E93] hover:text-[#1C1C1E]'}`}
        >
            {label}
        </button>
    );
}

function LegendItem({ color, label }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-[10px] font-bold uppercase tracking-tighter text-[#3A3A3C]">{label}</span>
        </div>
    );
}