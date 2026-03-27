import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, Globe, Activity, Zap, 
  ArrowLeft, MessageSquare, Gauge, 
  Clock, Navigation, Cpu, ShieldCheck,
  Radio, MapPin, Wind, AlertTriangle, RefreshCw
} from "lucide-react";
import { useVesselSim } from "../hooks/useVesselSim";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=JetBrains+Mono:wght@500;700&display=swap');
  
  :root { 
    --indigo-navy: #001B56; 
    --indigo-blue: #007AFF; 
    --bg-light: #F8F9FB;
    --border-gray: #E5E7EB;
    --critical-red: #DC2626;
  }

  body { background: var(--bg-light); color: #1F2937; font-family: 'Inter', sans-serif; transition: background 0.5s ease; }
  body.emergency-mode { background: #FEF2F2; }

  .ops-card { 
    background: white; border: 1px solid var(--border-gray); padding: 24px; border-radius: 20px; 
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition: all 0.3s ease;
  }
  .emergency-mode .ops-card { border-color: #FCA5A5; }

  .mono { font-family: 'JetBrains Mono', monospace; }
  .stat-bar { height: 6px; background: #F3F4F6; border-radius: 10px; overflow: hidden; margin-top: 8px; }
  .stat-progress { height: 100%; background: var(--indigo-blue); transition: width 0.5s ease-out; }
  .emergency-mode .stat-progress { background: var(--critical-red); }

  .btn-indigo { 
    background: var(--indigo-navy); color: white; font-weight: 700; text-transform: uppercase; 
    padding: 14px 24px; border-radius: 12px; display: flex; align-items: center; justify-content: center; 
    gap: 10px; transition: all 0.2s; cursor: pointer; border: none; font-size: 11px; letter-spacing: 0.05em;
  }
  .btn-indigo:hover { background: var(--indigo-blue); transform: translateY(-1px); }
  
  .btn-outline { background: white; border: 1px solid var(--border-gray); color: var(--indigo-navy); }
  .btn-emergency { background: var(--critical-red); color: white; animation: pulse-red 2s infinite; }
  
  @keyframes pulse-red {
    0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
    100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
  }

  .scanning-overlay {
    position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, rgba(0, 122, 255, 0.1), transparent);
    height: 50%; width: 100%; animation: scan 2s linear infinite; pointer-events: none;
  }
  @keyframes scan { from { top: -50%; } to { top: 100%; } }
`;

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- NEW FUNCTIONAL STATES ---
  const [isScanning, setIsScanning] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  const { telemetry, multiplier, setMultiplier } = useVesselSim(product);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getListingById(id);
        setProduct(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadData();
  }, [id]);

  // --- ACTION HANDLERS ---
  const handleRecalibrate = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  const toggleEmergency = () => {
    setEmergencyMode(!emergencyMode);
    document.body.classList.toggle('emergency-mode');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <>
      <style>{css}</style>
      
      <nav className={`px-8 py-5 flex justify-between items-center border-b sticky top-0 z-50 transition-colors ${emergencyMode ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-6">
          <button className="p-2 hover:bg-gray-100 rounded-full" onClick={() => navigate("/dashboard")}>
             <ArrowLeft size={20} className={emergencyMode ? 'text-red-600' : 'text-[#001B56]'} />
          </button>
          <div>
            <div className={`badge-live mb-1 ${emergencyMode ? 'bg-red-100 text-red-700' : 'bg-green-50 text-green-700'}`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-ping ${emergencyMode ? 'bg-red-600' : 'bg-green-500'}`} />
              {emergencyMode ? 'CRITICAL_SYSTEM_ALERT' : 'LIVE_TELEMETRY'}
            </div>
            <h1 className={`text-xl font-extrabold tracking-tight ${emergencyMode ? 'text-red-900' : 'text-[#001B56]'}`}>
                {emergencyMode ? 'Emergency Operations' : 'Vessel Activity Briefing'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <button className={`btn-indigo ${emergencyMode ? 'bg-red-600' : ''}`} onClick={() => navigate(`/chat/${product.id}`)}>
              <MessageSquare size={16} /> Open Comms Link
           </button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          {/* IMAGE CARD WITH SCANNING EFFECT */}
          <div className="ops-card !p-0 overflow-hidden relative">
            {isScanning && <div className="scanning-overlay" />}
            <div className={`p-6 text-white ${emergencyMode ? 'bg-red-600' : 'bg-[#001B56]'}`}>
                <h2 className="text-2xl font-black italic">{product.airline}</h2>
            </div>
            <img src={product.images?.[0]?.url} className={`w-full aspect-[4/3] object-cover transition-all ${isScanning ? 'brightness-125 blur-[1px]' : ''}`} alt="Vessel" />
            <div className="p-6">
               <p className="text-[10px] font-bold text-gray-400 uppercase">Altitude</p>
               <h2 className={`text-3xl font-black ${emergencyMode ? 'text-red-600' : 'text-[#001B56]'}`}>{telemetry?.altitude?.toLocaleString() || "0"} FT</h2>
            </div>
          </div>

          <div className="ops-card bg-blue-50/50">
            <h3 className="text-[10px] font-black uppercase mb-4">Time Compression</h3>
            <div className="grid grid-cols-4 gap-2">
              {[1, 10, 60, 300].map((speed) => (
                <button key={speed} onClick={() => setMultiplier(speed)} className={`py-2 mono text-[11px] rounded-lg border ${multiplier === speed ? 'bg-[#001B56] text-white' : 'bg-white'}`}>
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="ops-card">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-5xl font-black text-[#001B56]">{product.source} → {product.destination}</h2>
                {emergencyMode && <AlertTriangle className="text-red-600 animate-bounce" size={40} />}
             </div>
             <div className="grid grid-cols-3 gap-8 border-t pt-8">
                <LogisticItem label="Departure" value={new Date(product.departure).toLocaleTimeString()} />
                <LogisticItem label="Arrival" value={new Date(product.arrival).toLocaleTimeString()} />
                <LogisticItem label="Status" value={emergencyMode ? "DIVERTING" : "EN-ROUTE"} />
             </div>
          </div>

          {/* SENSOR FEED PANEL WITH FUNCTIONAL BUTTONS */}
          <div className="grid grid-cols-2 gap-6">
              <div className="ops-card">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4">System Integrity</h3>
                  <TelemetryItem label="Fuel" value={`${telemetry?.fuel}%`} progress={telemetry?.fuel} />
                  <TelemetryItem label="Systems" value={isScanning ? "RECALIBRATING..." : "NOMINAL"} progress={isScanning ? 40 : 100} />
              </div>

              <div className="flex flex-col gap-4">
                  <button 
                    className={`btn-indigo btn-outline flex-1 ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    onClick={handleRecalibrate}
                    disabled={isScanning}
                  >
                     <RefreshCw size={18} className={isScanning ? 'animate-spin' : ''} /> 
                     {isScanning ? 'Scanning Hardware...' : 'Recalibrate Sensors'}
                  </button>

                  <button 
                    className={`btn-indigo flex-1 transition-all ${emergencyMode ? 'btn-emergency' : 'bg-gray-800'}`}
                    onClick={toggleEmergency}
                  >
                     {emergencyMode ? <Zap size={18} /> : <AlertTriangle size={18} />}
                     {emergencyMode ? 'Resume Normal Ops' : 'Emergency Override'}
                  </button>
              </div>
          </div>
        </div>
      </main>
    </>
  );
}

const LogisticItem = ({ label, value }) => (
    <div>
        <p className="text-[9px] font-bold text-gray-400 uppercase">{label}</p>
        <p className="text-sm font-black text-[#001B56]">{value}</p>
    </div>
);

const TelemetryItem = ({ label, value, progress }) => (
  <div className="mb-4">
    <div className="flex justify-between text-[10px] font-bold uppercase">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <div className="stat-bar"><div className="stat-progress" style={{ width: `${progress}%` }} /></div>
  </div>
);