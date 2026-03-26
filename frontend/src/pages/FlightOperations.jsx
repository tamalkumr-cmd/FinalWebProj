import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import { allocateSeats } from '../utils/seatAllocator';
import SeatMapPreview from '../components/SeatMapPreview';
import { 
  FileUp, Cpu, Printer, Terminal, 
  ShieldAlert, AlertTriangle, ChevronRight, 
  Scale, Users, Plane, Fingerprint, Database,
  Search, Info, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FlightOperations({ selectedFlight }) {
  const [manifest, setManifest] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [safetyAlert, setSafetyAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const logEndRef = useRef(null);

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
      setSafetyAlert({ title: "OVERLOAD_DETECTED", msg: `CRITICAL: ${passengersCount}/${capacity} exceeds structural limits.`, type: "danger" });
      addLog(`FATAL: Payload exceeds ${aircraftModel} structural limits.`, "error");
      return false;
    }
    if (passengersCount > capacity * 0.9) {
      setSafetyAlert({ title: "HEAVY_LOAD", msg: `Warning: Vessel at ${(passengersCount/capacity * 100).toFixed(1)}% capacity.`, type: "warn" });
      addLog("CAUTION: High density loadout detected.", "warn");
    } else { setSafetyAlert(null); }
    return true;
  };

  const downloadPassPack = () => {
    if (manifest.length === 0) return;
    addLog("STREAMING_PDF_DATA...", "warn");
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [150, 60] });

    manifest.forEach((p, index) => {
      doc.setFillColor(2, 6, 23); doc.rect(0, 0, 150, 60, "F");
      doc.setFillColor(6, 182, 212); doc.rect(0, 0, 150, 1.5, "F");
      doc.setDrawColor(255, 255, 255); doc.setLineDashPattern([1, 1], 0); doc.line(105, 5, 105, 55);
      doc.setTextColor(255, 255, 255); doc.setFont("courier", "bold"); doc.setFontSize(12);
      doc.text(`PASS_TYPE: ${aircraftModel}`, 10, 10); doc.text(`FLIGHT: ${flightId}`, 10, 16);
      doc.text(`DEST: ${p.dest || p.Destination || 'GLOBAL'}`, 10, 22);
      doc.setTextColor(100, 116, 139); doc.setFontSize(8); doc.text("PASSENGER_NAME", 10, 35);
      doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.text(p.name.toUpperCase(), 10, 40);
      doc.setTextColor(6, 182, 212); doc.setFontSize(32); doc.text(p.seat, 70, 45); doc.text(p.seat, 115, 35); 
      if (index < manifest.length - 1) doc.addPage([150, 60], "landscape");
    });
    doc.save(`PASS_PACK_${flightId}.pdf`);
    addLog("EXPORT_SUCCESSFUL: 100% DEPLOYED", "success");
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    setLoading(true); setManifest([]); setLogs([]);
    addLog(`INIT_INGESTION: ${file.name}`, "info");

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      if (!validateLoad(data.length)) { setLoading(false); return; }

      setTimeout(() => {
        const allocated = allocateSeats(data, capacity);
        setManifest(allocated);
        setLoading(false);
        addLog(`SUCCESS: ALLOCATED TO ${aircraftModel} GRID`, "success");
      }, 1800);
    };
    reader.readAsBinaryString(file);
  };

  if (!selectedFlight) return <NoFlightSelected />;

  const filteredManifest = manifest.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#020617] text-white font-mono p-4">
      
      {/* 🚀 TOP STATUS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatusCard label="MISSION_ID" value={flightId} icon={<Plane size={14}/>} />
        <StatusCard label="AIRCRAFT" value={aircraftModel} icon={<Cpu size={14}/>} />
        <StatusCard label="LOAD_FACTOR" value={`${manifest.length} / ${capacity}`} icon={<Users size={14}/>} 
                    progress={(manifest.length / capacity) * 100} />
        <StatusCard label="STABILITY" value={safetyAlert ? "REJECTED" : "LOCKED"} icon={<Scale size={14}/>} 
                    color={safetyAlert ? "text-red-500" : "text-emerald-500"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: CONTROLS & LOGS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] relative group overflow-hidden">
             <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
             {/* Scanning Line Effect */}
             <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-cyan-500/20 z-0 pointer-events-none" 
             />
            <input type="file" id="xl" hidden onChange={handleUpload} />
            <label htmlFor="xl" className="cursor-pointer block text-center relative z-10">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/20 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all">
                <FileUp className="text-cyan-400" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-white group-hover:text-cyan-400">Execute_Manifest_Upload</p>
            </label>
          </div>

          <AnimatePresence>
            {safetyAlert && (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className={`p-4 rounded-2xl border ${safetyAlert.type === 'danger' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-yellow-500/10 border-yellow-500 text-yellow-500'}`}>
                <div className="flex gap-3 items-center">
                  <ShieldAlert size={20} className="animate-pulse" />
                  <div className="text-[10px] font-black uppercase leading-tight">{safetyAlert.title}<br/><span className="opacity-70 font-bold">{safetyAlert.msg}</span></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-black/60 border border-white/5 rounded-[2rem] p-5 h-[280px] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-cyan-500 text-[10px] font-black uppercase tracking-widest">
                <Terminal size={12} /> Console_Out
              </div>
              <Fingerprint size={12} className="text-slate-700" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar text-[9px]">
              {logs.length === 0 && <p className="text-slate-600 italic">Awaiting secure uplink...</p>}
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-600">[{log.time}]</span>
                  <span className={log.type === "success" ? "text-emerald-400" : log.type === "error" ? "text-red-500" : "text-cyan-400"}>{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {manifest.length > 0 && (
            <button onClick={downloadPassPack} className="group w-full bg-cyan-600 hover:bg-cyan-500 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Printer size={16} className="group-hover:rotate-12 transition-transform" /> Print_Mission_Credentials
            </button>
          )}
        </div>

        {/* RIGHT: MAP & LIST */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-black/40 border border-white/5 rounded-[3rem] p-8 flex-1 relative overflow-hidden">
             {manifest.length > 0 && !loading && (
               <div className="absolute top-8 right-8 z-20 flex items-center bg-black/60 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
                 <Search size={14} className="text-cyan-500 mr-2" />
                 <input 
                    type="text" 
                    placeholder="SCAN_IDENT..." 
                    className="bg-transparent text-[10px] outline-none text-white w-32 font-bold uppercase"
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
             )}

            {loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Cpu className="text-cyan-500 animate-spin mb-4" size={50} />
                <p className="text-[10px] font-black tracking-[0.5em] text-cyan-500 animate-pulse uppercase italic">Compiling_Seat_Matrix</p>
              </div>
            ) : manifest.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
                <div className="overflow-y-auto pr-4 custom-scrollbar">
                   <SeatMapPreview allocatedManifest={filteredManifest} totalSeats={capacity} model={aircraftModel} />
                </div>
                <div className="bg-white/[0.02] rounded-3xl p-4 border border-white/5 overflow-y-auto max-h-[500px] custom-scrollbar">
                   <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Database size={12}/> Manifest_Data_Stream
                   </h4>
                   <div className="space-y-2">
                      {filteredManifest.map((p, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black text-white group-hover:text-cyan-400 transition-colors">{p.name}</span>
                              <span className="text-[8px] text-slate-500 uppercase">Dest: {p.dest || p.Destination || 'N/A'}</span>
                           </div>
                           <span className="text-xs font-black text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20">{p.seat}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <Info size={32} className="text-slate-800 mb-4" />
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest italic">Awaiting_Data_Ingestion</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components to prevent ReferenceErrors
function StatusCard({ label, value, icon, color = "text-white", progress }) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] relative overflow-hidden group">
      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 h-1 bg-cyan-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
      )}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className={`text-sm font-black italic tracking-tighter ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function NoFlightSelected() {
  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center p-10 bg-[#020617]">
      <div className="relative group mb-8">
        <div className="absolute -inset-4 bg-yellow-500/20 rounded-full blur-2xl group-hover:bg-yellow-500/40 transition-all duration-1000"></div>
        <div className="relative w-24 h-24 bg-black rounded-full flex items-center justify-center border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
          <AlertTriangle size={48} className="text-yellow-500 animate-pulse" />
        </div>
      </div>
      
      <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
        Vessel_Link_Offline
      </h2>
      <div className="w-20 h-[2px] bg-yellow-500/50 my-4 mx-auto" />
      <p className="text-slate-500 text-[10px] max-w-xs mx-auto uppercase tracking-[0.3em] leading-relaxed">
        Terminal requires an active mission link. Return to <span className="text-cyan-500 font-black">Operations_Hub</span> to select a vessel for ground processing.
      </p>
    </div>
  );
}