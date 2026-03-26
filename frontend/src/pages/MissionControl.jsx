import { useState } from "react";
import { motion } from "framer-motion";
import { User, Package, Download, ShieldCheck, Users, Briefcase } from "lucide-react";
import { useLoadmaster } from "../hooks/useLoadmaster";

export default function MissionControl() {
  const [deckType, setDeckType] = useState("PASSENGER"); // or "CARGO"
  const { seats, setSeats, crew, setCrew } = useLoadmaster(120);

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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-mono p-8">
      
      {/* HUD HEADER */}
      <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Mission_Configurator_<span className="text-cyan-500">v4.0</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.4em] mt-2">Deck_Layout & Crew_Duty_Allocation</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setDeckType("PASSENGER")} className={`btn-hex ${deckType === 'PASSENGER' ? 'active' : ''}`}>[ PAX_MODE ]</button>
          <button onClick={() => setDeckType("CARGO")} className={`btn-hex ${deckType === 'CARGO' ? 'active' : ''}`}>[ FREIGHT_MODE ]</button>
          <button onClick={downloadManifest} className="flex items-center gap-2 bg-emerald-500 text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase italic">
            <Download size={14} /> Download_Manifest
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: CREW DUTY MATRIX */}
        <div className="lg:col-span-4 space-y-6">
          <div className="brut-card-dark">
            <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Users size={14} /> Crew_Duty_Matrix
            </h3>
            <div className="space-y-4">
              {crew.map((member) => (
                <div key={member.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-cyan-500/30 transition-all">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-500">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[8px] text-slate-600 font-black uppercase">{member.role}</p>
                    <input 
                      className="bg-transparent border-none text-white font-bold text-xs focus:outline-none w-full" 
                      placeholder="Assign Name..."
                      onChange={(e) => {
                        const newCrew = [...crew];
                        newCrew[member.id-1].name = e.target.value;
                        setCrew(newCrew);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="brut-card-dark bg-cyan-500/5">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
               <Briefcase size={14} className="text-cyan-500" /> Sector_Brief
            </h3>
            <p className="text-[10px] text-slate-400 leading-relaxed italic">
              "Crew must maintain visual contact with cargo restraints at all times. All business class units require high-priority meal-prep sync."
            </p>
          </div>
        </div>

        {/* RIGHT: VISUAL DECK LAYOUT */}
        <div className="lg:col-span-8">
          <div className="brut-card-dark overflow-hidden relative">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic">
                  Vessel_Aerospatial_Grid // {deckType === 'PASSENGER' ? 'PAX_CONFIG' : 'CARGO_BAY'}
               </h3>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> <span className="text-[8px] uppercase">Business</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700" /> <span className="text-[8px] uppercase">Economy</span>
                  </div>
               </div>
            </div>

            {/* DECK GRID */}
            <div className={`grid ${deckType === 'PASSENGER' ? 'grid-cols-6' : 'grid-cols-4'} gap-3 p-4 bg-black/40 rounded-[2rem] border border-white/5`}>
              {seats.map((seat) => (
                <motion.div
                  key={seat.id}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => {
                    const newSeats = [...seats];
                    newSeats[seat.id-1].status = seat.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE';
                    setSeats(newSeats);
                  }}
                  className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all border
                    ${seat.status === 'OCCUPIED' ? 'bg-cyan-500 border-cyan-400 text-black' : 'bg-white/5 border-white/5 text-slate-700 hover:border-cyan-500/50'}
                    ${seat.class === 'BUSINESS' && seat.status === 'AVAILABLE' ? 'border-blue-500/30 bg-blue-500/5' : ''}
                  `}
                >
                  {deckType === 'PASSENGER' ? <User size={12} /> : <Package size={12} />}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .brut-card-dark { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 2.5rem; padding: 2rem; backdrop-blur: xl; }
        .btn-hex { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #64748b; padding: 0.5rem 1rem; border-radius: 0.75rem; font-size: 10px; font-weight: 900; transition: all 0.3s; cursor: pointer; }
        .btn-hex:hover { color: white; border-color: white; }
        .btn-hex.active { background: #22d3ee; color: black; border-color: #22d3ee; box-shadow: 0 0 20px rgba(34,211,238,0.2); }
      `}</style>
    </div>
  );
}