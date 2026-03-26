import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { motion } from "framer-motion";
import { 
  Plane, Globe, Activity, Zap, 
  ArrowLeft, MessageSquare, Gauge, 
  BarChart3, Clock, Navigation, Cpu
} from "lucide-react";
import { useVesselSim } from "../hooks/useVesselSim";

// 🛠️ DEFINING THE CSS CONSTANT (This fixes your ReferenceError)
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;700&display=swap');
  :root { --bg: #020617; --cyan: #22d3ee; --white: #ffffff; --black: #000000; --slate: #1e293b; --border: 2px solid rgba(255,255,255,0.1); }
  body { background: var(--bg); color: #cbd5e1; font-family: 'Space Grotesk', sans-serif; }
  .brut-card { background: rgba(255,255,255,0.03); border: var(--border); padding: 24px; border-radius: 24px; backdrop-blur: xl; }
  .display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; color: var(--white); }
  .mono { font-family: 'IBM Plex Mono', monospace; }
  .stat-bar { height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; margin-top: 8px; }
  .stat-progress { height: 100%; background: var(--cyan); box-shadow: 0 0 15px var(--cyan); }
  .btn-tactical { background: var(--cyan); color: black; font-weight: 900; text-transform: uppercase; padding: 16px; border-radius: 16px; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s; cursor: pointer; border: none; }
  .btn-tactical:hover { background: white; transform: translateY(-2px); }
`;

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 ATTACH SIMULATION ENGINE
  // (Ensure you have created src/hooks/useVesselSim.js)
  const { telemetry, multiplier, setMultiplier } = useVesselSim(product);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getListingById(id);
        setProduct(data);
      } catch (err) { 
        console.error("DATA_FETCH_ERR:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    loadData();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
       <div className="mono animate-pulse text-cyan-500 uppercase tracking-[0.5em]">Initialising_Briefing...</div>
    </div>
  );

  if (!product) return <div className="p-20 mono text-red-500">ERROR: VESSEL_NOT_FOUND</div>;

  return (
    <>
      <style>{css}</style>
      
      {/* HUD HEADER */}
      <nav className="p-8 flex justify-between items-center border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-[#020617]/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full animate-pulse ${telemetry?.status === 'AIRBORNE' ? 'bg-cyan-500' : 'bg-emerald-500'}`} />
            <span className="text-[10px] font-black text-cyan-500 tracking-[0.3em] uppercase">
              STATUS: {telemetry?.status || "CONNECTED"}
            </span>
          </div>
          <h1 className="display text-3xl">Briefing // {product.airline}</h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right mr-4">
              <p className="mono text-[8px] text-slate-500 uppercase">Sim_Clock</p>
              <p className="mono text-xs text-white font-bold">{telemetry?.currentTime || "--:--:--"}</p>
           </div>
           <button className="btn-tactical !py-2 !px-4 text-[10px]" onClick={() => navigate("/dashboard")}>
             <ArrowLeft size={14} /> Back_To_Fleet
           </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COL: Live Telemetry */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="brut-card !p-0 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
            <img 
              src={product.images?.[0]?.url || "https://via.placeholder.com/800"} 
              className="w-full aspect-square object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000" 
              alt="Vessel"
            />
            <div className="absolute bottom-6 left-6 right-6 z-20">
               <div className="flex justify-between items-end mb-4">
                  <div>
                    <span className="mono text-cyan-500 text-xs font-bold uppercase tracking-widest">Altitude_Telemetry</span>
                    <h2 className="display text-4xl">{telemetry?.altitude?.toLocaleString() || "0"} FT</h2>
                  </div>
                  <div className="text-right">
                    <span className="mono text-slate-400 text-[10px] uppercase">Progress</span>
                    <p className="mono text-white font-bold">{telemetry?.progress || "0"}%</p>
                  </div>
               </div>
               <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyan-500 shadow-[0_0_15px_#22d3ee]"
                    animate={{ width: `${telemetry?.progress || 0}%` }}
                  />
               </div>
            </div>
          </div>

          {/* TIME MULTIPLIER CONTROLS */}
          <div className="brut-card bg-cyan-500/5 border-cyan-500/20">
            <h3 className="mono text-xs font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Cpu size={14} className="text-cyan-500" /> Temporal_Compression
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[1, 10, 60, 300].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setMultiplier(speed)}
                  className={`py-3 mono text-[10px] rounded-xl border transition-all cursor-pointer ${
                    multiplier === speed 
                    ? "bg-cyan-500 text-black border-cyan-500 font-black" 
                    : "bg-white/5 text-slate-500 border-white/5 hover:border-white/20"
                  }`}
                >
                  {speed === 1 ? "REAL" : `${speed}x`}
                </button>
              ))}
            </div>
          </div>

          <div className="brut-card space-y-6">
            <h3 className="mono text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Gauge size={14} className="text-cyan-500" /> Sensor_Feed
            </h3>
            <TelemetryItem label="Lat_Vector" value={telemetry?.pos?.lat?.toFixed(6) || "0.000000"} progress={100} />
            <TelemetryItem label="Lng_Vector" value={telemetry?.pos?.lng?.toFixed(6) || "0.000000"} progress={100} />
            <TelemetryItem label="Fuel_Burn" value={`${telemetry?.fuel || 100}%`} progress={telemetry?.fuel || 100} color="#facc15" />
          </div>
        </div>

        {/* RIGHT COL: Logistics & Radar */}
        <div className="lg:col-span-7 space-y-8">
          <div className="brut-card bg-white/5">
             <div className="flex justify-between items-start mb-12">
                <div className="space-y-1">
                   <span className="mono text-[10px] text-cyan-500 uppercase tracking-[0.3em]">Operational_Vector</span>
                   <h2 className="display text-7xl leading-none">{product.source} <span className="text-slate-700">/</span> {product.destination}</h2>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-8">
                <div className="space-y-2">
                   <label className="mono text-[9px] uppercase text-slate-500">Departure</label>
                   <p className="mono text-white font-bold">{new Date(product.departure).toLocaleTimeString()}</p>
                </div>
                <div className="space-y-2 text-right">
                   <label className="mono text-[9px] uppercase text-slate-500">Arrival</label>
                   <p className="mono text-cyan-500 font-bold">{new Date(product.arrival).toLocaleTimeString()}</p>
                </div>
             </div>
          </div>

          <div className="brut-card h-64 bg-slate-950 overflow-hidden relative">
             <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-pulse scale-[1.2]" />
             </div>
             
             <motion.div 
               animate={{ 
                 x: (parseFloat(telemetry?.progress || 0) - 50) * 4,
                 y: Math.sin(parseFloat(telemetry?.progress || 0) * 0.1) * 20
               }}
               className="absolute inset-0 flex items-center justify-center pointer-events-none"
             >
                <Plane size={32} className="text-cyan-500 drop-shadow-[0_0_10px_#22d3ee] rotate-90" />
             </motion.div>

             <div className="absolute bottom-6 left-6">
                <p className="mono text-[8px] text-slate-500 uppercase tracking-widest">Active_Trajectory_Lock</p>
                <p className="mono text-[10px] text-white font-black italic uppercase">Vector_Sync_Enabled</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button className="btn-tactical bg-white/5 !text-white border border-white/10" onClick={() => window.location.reload()}>
                <Activity size={18} /> Reset_Telemetry
             </button>
             <button className="btn-tactical" onClick={() => navigate(`/chat/${product.id}`)}>
                <MessageSquare size={18} /> Comms_Link
             </button>
          </div>
        </div>
      </main>
    </>
  );
}

const TelemetryItem = ({ label, value, progress, color = "#22d3ee" }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] mono uppercase">
      <span className="text-slate-500">{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
    <div className="stat-bar">
      <div className="stat-progress" style={{ width: `${progress}%`, backgroundColor: color, boxShadow: `0 0 15px ${color}` }} />
    </div>
  </div>
);