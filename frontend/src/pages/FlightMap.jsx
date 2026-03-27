import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, Tooltip, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Play, Pause, AlertTriangle, Globe, Zap, Activity, Droplets, ArrowUpRight, Shield, Radio } from 'lucide-react';
import { api } from '../api';

// --- 🛸 TACTICAL ICON ---
const createEliteIcon = (rotation, color, isStormy) => new L.DivIcon({
  html: `<div style="transform: rotate(${rotation}deg); transition: transform 0.2s linear; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
      <div class="absolute inset-0 blur-2xl rounded-full opacity-40 ${isStormy ? 'bg-red-600 animate-pulse' : ''}" style="background: ${color};"></div>
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="${isStormy ? '#FF3B30' : color}" stroke="white" stroke-width="1.5"/>
      </svg>
    </div>`,
  className: 'custom-elite-icon',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

export default function FlightMap() {
  const [flights, setFlights] = useState([]);
  const [ticker, setTicker] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [logs, setLogs] = useState(["SYSTEM_BOOT: SUCCESS", "ENCRYPTED_LINK: ACTIVE"]);

  const weatherCells = useMemo(() => {
    const colors = ["#FF3B30", "#FFD60A", "#0A84FF"];
    return Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      center: [10 + Math.random() * 22, 69 + Math.random() * 22],
      color: colors[Math.floor(Math.random() * colors.length)],
      radius: 70000 + Math.random() * 160000,
    }));
  }, []);

  const multRef = useRef(multiplier);
  const pauseRef = useRef(isPaused);

  useEffect(() => { multRef.current = multiplier; pauseRef.current = isPaused; }, [multiplier, isPaused]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.fetchListings();
        const data = Array.isArray(res) ? res : res.listings || [];
        setFlights(data);
        if (data.length > 0) setLogs(prev => [`RADAR_SYNC: ${data.length} VESSELS`, ...prev].slice(0, 5));
      } catch (err) { console.error("RADAR_OFFLINE"); }
    };
    load();
    const t1 = setInterval(load, 15000);
    const t2 = setInterval(() => {
      if (!pauseRef.current) setTicker(p => (p + (0.0005 * multRef.current)) % 1);
    }, 100);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const getVessel = (f) => {
    const sLat = parseFloat(f.sourceLat), sLng = parseFloat(f.sourceLng);
    const dLat = parseFloat(f.destLat), dLng = parseFloat(f.destLng);
    if (isNaN(sLat) || isNaN(dLat)) return null;

    const progress = ticker; 
    let lat = sLat + (dLat - sLat) * progress;
    let lng = sLng + (dLng - sLng) * progress;

    let status = "NOMINAL";
    let isStormy = false;
    weatherCells.forEach(cell => {
        if (L.latLng(lat, lng).distanceTo(L.latLng(cell.center)) < cell.radius) {
            if (cell.color === "#FF3B30") { isStormy = true; status = "EVASION"; }
            else if (cell.color === "#FFD60A") { status = "CAUTION"; }
        }
    });

    const angle = (Math.atan2(dLat - sLat, dLng - sLng) * (180 / Math.PI) + 90);
    const alt = progress < 0.2 ? (progress * 5 * 35000) : progress > 0.8 ? ((1 - progress) * 5 * 35000) : 35000;

    return { 
      pos: [lat, lng], angle: isStormy ? angle + 12 : angle, pct: (progress * 100).toFixed(0),
      source: [sLat, sLng], dest: [dLat, dLng], isStormy, alt: Math.round(alt), status 
    };
  };

  return (
    <div className="relative w-full h-[88vh] bg-[#050505] rounded-[3rem] overflow-hidden border border-[#2C2C2E] shadow-2xl font-mono text-white selection:bg-[#0A84FF]">
      
      {/* 🧭 LEFT HUD: OPERATIONS & LOGS */}
      <div className="absolute top-8 left-8 z-[1001] w-72 flex flex-col gap-4 pointer-events-none">
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-black/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 pointer-events-auto">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2"><Activity className="text-[#0A84FF]" size={14} /><p className="text-[10px] font-black uppercase tracking-[0.2em]">Live_Fleet</p></div>
             <div className="text-[10px] text-gray-500 font-bold">{flights.length} ACTIVE</div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {flights.map(f => (
              <button key={f.id} onClick={() => setSelectedFlight(f)} className={`w-full p-3 rounded-xl border transition-all text-left flex justify-between items-center ${selectedFlight?.id === f.id ? 'bg-[#0A84FF]/20 border-[#0A84FF]/40' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <span className="text-[11px] font-black truncate uppercase">{f.airline}</span>
                <div className={`h-1.5 w-1.5 rounded-full ${getVessel(f)?.isStormy ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-green-500'}`} />
              </button>
            ))}
          </div>
        </motion.div>

        {/* --- SYSTEM LOG FEED --- */}
        <div className="bg-black/20 backdrop-blur-lg p-4 rounded-2xl border border-white/5 opacity-60">
           {logs.map((log, i) => (
             <p key={i} className="text-[9px] font-bold text-gray-400 mb-1 leading-none uppercase tracking-tighter">
               <span className="text-[#0A84FF] mr-2">»</span> {log}
             </p>
           ))}
        </div>
      </div>

      {/* 📊 RIGHT HUD: MISSION BRIEFING */}
      <AnimatePresence>
        {selectedFlight && (
          <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
            className="absolute right-8 top-8 bottom-8 w-88 bg-black/60 backdrop-blur-2xl z-[1001] rounded-[2.5rem] border border-white/10 p-10 flex flex-col gap-8 shadow-3xl"
          >
            <div className="flex justify-between items-start">
               <div>
                  <h2 className="text-3xl font-black italic uppercase text-[#0A84FF] leading-none mb-2">{selectedFlight.airline}</h2>
                  <div className="flex items-center gap-2"><Radio size={12} className="text-green-500" /><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Signal_Verified</p></div>
               </div>
               <button onClick={() => setSelectedFlight(null)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <VitalsSmall label="Altitude" value={`${getVessel(selectedFlight)?.alt} FT`} icon={<ArrowUpRight size={14}/>} />
              <VitalsSmall label="Vector" value={`${getVessel(selectedFlight)?.pct}%`} icon={<Target size={14}/>} />
              <div className="col-span-2 p-5 bg-white/5 rounded-2xl border border-white/5">
                 <p className="text-[10px] font-black text-gray-500 uppercase mb-3">Telemetry_Status</p>
                 <div className="flex items-center gap-3">
                    <Shield className={getVessel(selectedFlight)?.isStormy ? "text-red-500" : "text-green-500"} size={20} />
                    <p className={`text-sm font-black uppercase ${getVessel(selectedFlight)?.isStormy ? 'text-red-500' : 'text-green-500'}`}>
                       {getVessel(selectedFlight)?.status}
                    </p>
                 </div>
              </div>
            </div>

            <div className="mt-auto space-y-6">
               <div className="flex justify-between items-center px-2">
                  <div className="text-center"><p className="text-[10px] font-black text-gray-500 uppercase mb-1">Source</p><p className="text-lg font-black">{selectedFlight.source}</p></div>
                  <Zap size={20} className="text-[#0A84FF]/40" />
                  <div className="text-center"><p className="text-[10px] font-black text-gray-500 uppercase mb-1">Dest</p><p className="text-lg font-black">{selectedFlight.destination}</p></div>
               </div>
               <div className="p-4 bg-[#0A84FF] rounded-2xl text-center shadow-lg shadow-blue-500/20"><p className="text-[10px] font-black uppercase tracking-widest">Override_Vessel_Control</p></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MapContainer center={[22, 78]} zoom={5} zoomControl={false} style={{ height: '100%', width: '100%', background: '#050505' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        
        {weatherCells.map(cell => (
          <Circle key={cell.id} center={cell.center} radius={cell.radius} 
            pathOptions={{ color: cell.color, fillColor: cell.color, fillOpacity: 0.03, weight: 1, dashArray: '10, 10' }} 
          />
        ))}

        {flights.map((f) => {
          const v = getVessel(f);
          if (!v) return null;
          return (
            <React.Fragment key={f.id}>
              <Polyline positions={[v.source, v.pos]} pathOptions={{ color: '#FFD60A', weight: 3, opacity: 0.7 }} />
              <Polyline positions={[v.source, v.pos]} pathOptions={{ color: '#FFD60A', weight: 10, opacity: 0.1, blur: 8 }} />
              
              <Marker eventHandlers={{ click: () => setSelectedFlight(f) }} position={v.pos} icon={createEliteIcon(v.angle, "#0A84FF", v.isStormy)}>
                {/* --- PINNED HUD TOOLTIP --- */}
                <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={selectedFlight?.id === f.id} className="tactical-tooltip">
                   <div className="bg-black/80 border border-white/20 p-2 rounded-lg text-white font-mono min-w-[100px]">
                      <p className="text-[9px] font-black text-[#0A84FF]">{f.airline}</p>
                      <p className="text-[10px] font-bold">ALT: {v.alt} FT</p>
                   </div>
                </Tooltip>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}

function VitalsSmall({ label, value, icon }) {
  return (
    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[#0A84FF]">{icon}<span className="text-[9px] font-black text-gray-500 uppercase">{label}</span></div>
      <p className="text-sm font-black">{value}</p>
    </div>
  );
}