import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import { allocateSeats } from '../utils/seatAllocator';
import SeatMapPreview from '../components/SeatMapPreview';
import { 
  FileUp, Cpu, Printer, Terminal, 
  ShieldAlert, AlertTriangle, ChevronRight, 
  Scale, Users, Plane, Fingerprint, Database,
  Search, Info, Zap, ArrowRight, ArrowUpRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlightOperations({ selectedFlight }) {
  const [manifest, setManifest] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [safetyAlert, setSafetyAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const logEndRef = useRef(null);

  const fontStack = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif";
  const aircraftModel = selectedFlight?.aircraftModel || "UNKNOWN_VESSEL";
  const capacity = selectedFlight?.seatsCount || 180;
  const flightId = selectedFlight?.airline || "NORS-XXXX";

  const addLog = (message, type = "info") => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { time, message, type }].slice(-50));
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const validateLoad = (passengersCount) => {
    if (passengersCount > capacity) {
      setSafetyAlert({ title: "OVERLOAD", msg: `CRITICAL: ${passengersCount}/${capacity}`, type: "danger" });
      addLog(`FATAL: Structural overload.`, "error");
      return false;
    }
    if (passengersCount > capacity * 0.9) {
      setSafetyAlert({ title: "HEAVY", msg: `Vessel at ${(passengersCount/capacity * 100).toFixed(1)}%`, type: "warn" });
      addLog("CAUTION: Heavy density loadout.", "warn");
    } else { setSafetyAlert(null); }
    return true;
  };

  // --- UPDATED BOARDING PASS GENERATOR ---
  const downloadPassPack = () => {
    if (manifest.length === 0) return;
    addLog("GENERATING_MISSION_CREDENTIALS...", "warn");
    
    // Standard Landscape Orientation [150mm x 60mm]
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [150, 60] });

    manifest.forEach((p, index) => {
      // 1. Base Card Layer
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 150, 60, "F");

      // 2. Sector Blue Protocol Strip (Left Sidebar)
      doc.setFillColor(0, 122, 255); 
      doc.rect(0, 0, 10, 60, "F");

      // 3. Labeling Headers
      doc.setTextColor(142, 142, 147);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("OPERATOR_IDENTITY", 18, 12);
      doc.text("MISSION_ID", 100, 12);

      // 4. Passenger Details & Flight ID
      doc.setTextColor(28, 28, 30);
      doc.setFontSize(16);
      doc.text(p.name ? p.name.toUpperCase() : "IDENT_UNKNOWN", 18, 22);
      doc.text(flightId, 100, 22);

      // 5. Seat Assignment (Large Tactical Text)
      doc.setTextColor(142, 142, 147);
      doc.setFontSize(8);
      doc.text("ASSIGNED_GRID_NODE", 18, 38);
      
      doc.setTextColor(0, 122, 255);
      doc.setFontSize(38);
      doc.text(p.seat || "00", 18, 54);

      // 6. Security Watermark & Integrity Status
      doc.setTextColor(52, 199, 89);
      doc.setFontSize(9);
      doc.text("VERIFIED_UPLINK", 100, 38);
      
      // 7. Tactical Visual Elements (Lines and Barcode)
      doc.setDrawColor(242, 242, 247);
      doc.line(15, 28, 140, 28);
      
      for(let i=0; i<25; i++) {
        doc.setFillColor(28, 28, 30, 0.1);
        doc.rect(100 + (i * 1.6), 46, 0.6, 8, "F");
      }

      if (index < manifest.length - 1) doc.addPage([150, 60], "landscape");
    });

    doc.save(`MANIFEST_${flightId}.pdf`);
    addLog("EXPORT_COMPLETE: PACKETS_DEPLOYED", "success");
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    setLoading(true); setManifest([]); setLogs([]);
    addLog(`INGESTING: ${file.name}`, "info");

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      if (!validateLoad(data.length)) { setLoading(false); return; }

      setTimeout(() => {
        const allocated = allocateSeats(data, capacity);
        setManifest(allocated);
        setLoading(false);
        addLog(`SUCCESS: ALLOCATED_TO_GRID`, "success");
      }, 1200);
    };
    reader.readAsBinaryString(file);
  };

  if (!selectedFlight) return <NoFlightSelected />;

  const filteredManifest = manifest.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={{ fontFamily: fontStack }} className="max-w-[1700px] mx-auto p-5 md:p-8 text-[#1C1C1E] selection:bg-[#007AFF] selection:text-white bg-[#F2F2F7] min-h-screen">
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <StatusCard label="MISSION_ID" value={flightId} icon={<Plane size={16}/>} />
        <StatusCard label="VESSEL_TYPE" value={aircraftModel} icon={<Cpu size={16}/>} />
        <StatusCard label="LOAD_FACTOR" value={`${manifest.length} / ${capacity}`} icon={<Users size={16}/>} 
                    progress={(manifest.length / capacity) * 100} />
        <StatusCard label="INTEGRITY" value={safetyAlert ? safetyAlert.title : "STABLE"} icon={<Activity size={16}/>} 
                    color={safetyAlert ? "text-[#FF3B30]" : "text-[#34C759]"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-9 flex flex-col gap-6">
          <div className="bg-white border border-[#D1D1D6] p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-black/5 relative min-h-[80vh] flex flex-col">
            <header className="flex justify-between items-center mb-8 border-b border-[#F2F2F7] pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#1C1C1E] rounded-2xl text-white shadow-lg">
                        <Database size={18} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight uppercase">Vessel_Grid</h3>
                        <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-[0.3em]">Hardware Visualization Layer</p>
                    </div>
                </div>

                {manifest.length > 0 && !loading && (
                    <div className="flex items-center bg-[#F2F2F7] border border-[#D1D1D6] rounded-2xl px-5 py-2.5 shadow-sm focus-within:ring-2 ring-[#007AFF] transition-all">
                        <Search size={16} className="text-[#8E8E93] mr-2.5" />
                        <input 
                        type="text" 
                        placeholder="SCAN IDENTITY..." 
                        className="bg-transparent text-[11px] outline-none text-[#1C1C1E] w-40 font-bold uppercase tracking-widest"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                )}
            </header>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <Cpu className="text-[#007AFF] animate-spin mb-6" size={56} />
                <p className="text-[10px] font-black tracking-[0.5em] text-[#007AFF] animate-pulse uppercase italic">Compiling_Grid</p>
              </div>
            ) : manifest.length > 0 ? (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                   <SeatMapPreview allocatedManifest={filteredManifest} totalSeats={capacity} model={aircraftModel} />
                </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-[#F2F2F7] rounded-[3rem] bg-[#F9F9F9]">
                <div className="p-7 bg-white rounded-full shadow-xl mb-6 border border-[#D1D1D6]">
                    <Info size={40} className="text-[#D1D1D6]" />
                </div>
                <p className="text-xs font-black text-[#AEAEB2] uppercase tracking-[0.4em] italic">Awaiting_Manifest_Uplink</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-[#D1D1D6] p-6 rounded-[2.5rem] shadow-xl shadow-black/5 relative group overflow-hidden">
            <input type="file" id="xl" hidden onChange={handleUpload} />
            <label htmlFor="xl" className="cursor-pointer block text-center relative z-10">
              <div className="w-14 h-14 bg-[#F2F2F7] rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#007AFF] group-hover:text-white transition-all duration-500 shadow-sm border border-[#D1D1D6]">
                <FileUp size={20} />
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#1C1C1E]">Initialize Manifest</p>
              <p className="text-[9px] text-[#8E8E93] uppercase font-bold mt-1 tracking-tighter">Support: XLSX / CSV / JSON</p>
            </label>
          </div>

          <div className="bg-white border border-[#D1D1D6] rounded-[2.5rem] p-6 h-[380px] flex flex-col shadow-xl">
             <h4 className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mb-4 flex items-center gap-2 italic">
                <Users size={12} className="text-[#007AFF]"/> Data_Stream
             </h4>
             <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-[9px]">
                {filteredManifest.map((p, i) => (
                    <motion.div 
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        key={i} 
                        className="flex justify-between items-center p-3 bg-[#F2F2F7] rounded-xl border border-[#E5E5EA] hover:border-[#007AFF] transition-all group"
                    >
                        <span className="text-[9px] font-extrabold text-[#1C1C1E] uppercase truncate w-24 group-hover:text-[#007AFF]">{p.name}</span>
                        <span className="text-[9px] font-black text-[#007AFF] bg-white px-2 py-1 rounded-lg border border-[#D1D1D6] shadow-inner">{p.seat}</span>
                    </motion.div>
                ))}
                {manifest.length === 0 && <p className="text-[9px] text-[#AEAEB2] italic text-center mt-12 animate-pulse">Awaiting ingestion...</p>}
             </div>
          </div>

          <div className="bg-[#1C1C1E] border border-black rounded-[2rem] p-6 h-[220px] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#007AFF] text-[10px] font-black uppercase tracking-widest leading-none">
                <Terminal size={12} /> System_Console
              </div>
              <Fingerprint size={12} className="text-zinc-700" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar-dark font-mono text-[9px]">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-zinc-600">[{log.time}]</span>
                  <span className={log.type === "success" ? "text-[#34C759]" : log.type === "error" ? "text-[#FF3B30]" : "text-[#007AFF]"}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {manifest.length > 0 && (
            <button onClick={downloadPassPack} className="w-full bg-[#007AFF] hover:bg-[#0051FF] text-white py-5 rounded-[2rem] font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
              <Printer size={16} /> Deploy Packets
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value, icon, color = "text-[#1C1C1E]", progress }) {
  return (
    <div className="bg-white border border-[#D1D1D6] p-5 md:p-6 rounded-[2.5rem] relative overflow-hidden shadow-lg shadow-black/5 group">
      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 h-1 bg-[#007AFF] transition-all duration-1000" style={{ width: `${progress}%` }} />
      )}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#F2F2F7] rounded-xl flex items-center justify-center text-[#8E8E93] border border-[#D1D1D6] group-hover:bg-[#007AFF] group-hover:text-white transition-all duration-500 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-[#8E8E93] font-extrabold uppercase tracking-widest mb-1.5 leading-none">{label}</p>
          <p className={`text-lg font-black italic tracking-tighter ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function NoFlightSelected() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center p-12 bg-[#F2F2F7] rounded-[4rem] m-6 border border-[#D1D1D6]">
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative mb-10">
        <div className="relative w-28 h-28 bg-white rounded-[2.5rem] flex items-center justify-center border border-[#D1D1D6] shadow-2xl">
          <AlertTriangle size={48} className="text-[#FF9500] animate-pulse" />
        </div>
      </motion.div>
      <h2 className="text-4xl font-extrabold text-[#1C1C1E] italic uppercase tracking-tight">Node_Offline</h2>
      <button className="mt-12 flex items-center gap-3 text-[#007AFF] font-black uppercase text-xs tracking-[0.3em] hover:gap-6 transition-all group">
          Navigate to Registry <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
      </button>
    </div>
  );
}