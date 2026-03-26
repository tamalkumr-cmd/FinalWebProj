import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Navigation, Zap, Play, Pause, AlertTriangle } from 'lucide-react';
import { api } from '../api';

// --- 🛸 TACTICAL ICON GENERATOR ---
const createEliteIcon = (rotation, color, isDiverting) => new L.DivIcon({
  html: `<div class="relative transition-all duration-500" style="transform: rotate(${rotation}deg);">
      <div class="absolute inset-0 blur-xl rounded-full opacity-40 ${isDiverting ? 'bg-red-500 animate-ping' : ''}" style="background: ${color};"></div>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="relative">
        <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="${isDiverting ? '#ef4444' : color}" stroke="black" stroke-width="0.5"/>
      </svg>
    </div>`,
  className: 'custom-elite-icon',
  iconSize: [40, 40],
});

// --- 🧭 MOUSE TRACKER ---
function MouseTracker({ setMousePos }) {
  useMapEvents({
    mousemove: (e) => setMousePos({ lat: e.latlng.lat.toFixed(4), lng: e.latlng.lng.toFixed(4) }),
  });
  return null;
}

// --- ✈️ MAIN FLIGHT MAP ---
export default function FlightMap() {
  const [flights, setFlights] = useState([]);
  const [simTime, setSimTime] = useState(new Date());
  const [multiplier, setMultiplier] = useState(1); // 1x, 10x, 50x, 150x
  const [isPaused, setIsPaused] = useState(false);
  const [mousePos, setMousePos] = useState({ lat: "00.0000", lng: "00.0000" });

  // Refs prevent the closures in setInterval from using stale state
  const multRef = useRef(multiplier);
  const pauseRef = useRef(isPaused);

  useEffect(() => {
    multRef.current = multiplier;
    pauseRef.current = isPaused;
  }, [multiplier, isPaused]);

  useEffect(() => {
    // 1. Initial Data Fetch
    const load = async () => {
      try {
        const response = await api.fetchListings();
        // Handle axios wrapper or direct array
        const data = Array.isArray(response) ? response : response.data;
        setFlights(data || []);
      } catch (err) { console.error("🛰️ RADAR_SYNC_ERROR:", err); }
    };

    load();
    const dataTimer = setInterval(load, 15000); // Sync data every 15s

    // --- 🚀 THE SIMULATION CLOCK ENGINE ---
    const simTimer = setInterval(() => {
      if (!pauseRef.current) {
        setSimTime(prev => new Date(prev.getTime() + (1000 * multRef.current)));
      }
    }, 1000); // Ticks every real second

    return () => {
      clearInterval(dataTimer);
      clearInterval(simTimer);
    };
  }, []);

  // --- 🛰️ TELEMETRY CALCULATOR ---
  const getLiveVesselData = (f) => {
    // 🛡️ PARSE COORDINATES (Crucial to prevent 500 errors or hidden icons)
    const sLat = parseFloat(f.sourceLat) || 0;
    const sLng = parseFloat(f.sourceLng) || 0;
    const dLat = parseFloat(f.destLat) || 0;
    const dLng = parseFloat(f.destLng) || 0;
    
    const start = new Date(f.departure).getTime();
    const end = new Date(f.arrival).getTime();
    const now = simTime.getTime(); // Use Simulation Time instead of real time
    
    // Calculate Progress (0 to 1)
    const totalTime = end - start;
    const progress = totalTime > 0 ? Math.max(0, Math.min(1, (now - start) / totalTime)) : 0;

    // Linear Interpolation for movement
    const lat = sLat + (dLat - sLat) * progress;
    const lng = sLng + (dLng - sLng) * progress;
    
    // Determine Flight Phase
    let phase = progress <= 0 ? "SCHEDULED" : progress < 0.15 ? "DEPARTING" : progress > 0.85 ? "LANDING" : "EN_ROUTE";
    if (progress >= 1) phase = "ARRIVED";

    // Standard bearing calculation for icon rotation
    const angle = (Math.atan2(dLat - sLat, dLng - sLng) * (180 / Math.PI) + 90);

    // Dynamic Color based on state
    let color = "#fbbf24"; // En Route (Yellow)
    if (progress <= 0) color = "#64748b"; // Scheduled (Gray)
    if (progress >= 1) color = "#10b981"; // Arrived (Green)

    return { 
      pos: [lat, lng], 
      heading: angle, 
      pct: (progress * 100).toFixed(2), 
      phase,
      color,
      source: [sLat, sLng],
      dest: [dLat, dLng],
      timeRemaining: ((1 - progress) * totalTime / (1000 * multRef.current * 60)).toFixed(0) // Sim minutes
    };
  };

  return (
    <div className="relative w-full h-[92vh] bg-[#020617] overflow-hidden rounded-[3.5rem] border border-white/5 shadow-2xl">
      
      {/* 🧭 HUD: NAVIGATION & CONTROLS */}
      <div className="absolute top-10 left-10 z-[1001] flex flex-col gap-4 pointer-events-none">
        <HUDCard label="SIM_LAT" value={mousePos.lat} color="text-yellow-400" icon={<Target size={14}/>} />
        
        {/* 🚀 WARP CONTROLLER */}
        <div className="bg-black/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 flex items-center gap-2 pointer-events-auto shadow-2xl">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className={`p-3 rounded-xl transition-all ${isPaused ? 'bg-emerald-500/20 text-emerald-500' : 'hover:bg-white/5 text-slate-500'}`}
            >
              {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
            </button>

            {[1, 10, 50, 150].map(speed => (
              <button
                key={speed}
                onClick={() => { setMultiplier(speed); setIsPaused(false); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${multiplier === speed && !isPaused ? 'bg-yellow-500 text-black' : 'hover:bg-white/5 text-slate-400'}`}
              >
                {speed}X
              </button>
            ))}
            <div className="px-3 py-2 border-l border-white/10 ml-2">
               <p className="text-[8px] text-slate-500 font-bold uppercase leading-none">Sim_Clock</p>
               <p className="text-[11px] text-yellow-500 font-mono font-bold leading-tight">
                {simTime.toLocaleTimeString([], { hour12: false })}
               </p>
            </div>
        </div>
      </div>

      {/* 🗺️ MAP CONTAINER */}
      <div className="absolute inset-0 z-0">
        <MapContainer center={[20, 78]} zoom={5} zoomControl={false} style={{ height: '100%', width: '100%', background: '#020617' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <MouseTracker setMousePos={setMousePos} />

          {flights.map((f) => {
            const state = getLiveVesselData(f);
            
            // Only show flights that are active or scheduled. Hide Arrived.
            if (state.phase === "ARRIVED") return null;

            return (
              <React.Fragment key={f.id}>
                
                {/* 🛡️ THE CONNECTION LINE: Solid, Yellow */}
                <Polyline 
                  positions={[state.source, state.dest]} 
                  pathOptions={{ 
                    color: '#fbbf24', // Yellow color
                    weight: 1.5,
                    opacity: 0.2 // Reduced opacity for tactical look
                  }} 
                />
                
                {/* Visual line showing trajectory progress */}
                <Polyline 
                  positions={[state.source, state.pos]} 
                  pathOptions={{ 
                    color: state.color, // Color changes based on phase (Gray -> Yellow)
                    weight: 2,
                    opacity: 0.6
                  }} 
                />
                
                {/* Airborne Marker */}
                <Marker position={state.pos} icon={createEliteIcon(state.heading, state.color, f.isDiverting)}>
                   <Popup className="radar-popup">
                      <div className="p-3 bg-black text-white text-[10px] font-mono border-l-2" style={{ borderColor: state.color }}>
                         <div className="flex justify-between items-center mb-1 pb-1 border-b border-white/10">
                            <p className="text-yellow-400 font-bold italic text-[11px]">{f.airline}</p>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5" style={{ color: state.color }}>{state.phase}</span>
                         </div>
                         <p>PROG: {state.pct}%</p>
                         <p>ALTITUDE: {f.altitude || 35000} FT</p>
                         <p>WX_COND: {f.weatherStatus || 'CLEAR'}</p>
                         {state.phase !== "SCHEDULED" && (
                            <p className="text-emerald-400 mt-1 pt-1 border-t border-white/5">ETA_SIM: {state.timeRemaining} MIN</p>
                         )}
                         {f.isDiverting && (
                            <div className="flex items-center gap-1 text-red-500 font-bold animate-pulse mt-1 pt-1 border-t border-red-500/20">
                              <AlertTriangle size={12}/> REROUTING_WEATHER
                            </div>
                         )}
                      </div>
                   </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

// HUD Component stayed the same
function HUDCard({ label, value, color, icon }) {
  return (
    <div className="bg-black/60 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-4 pointer-events-auto shadow-2xl">
      <div className="text-slate-500">{icon}</div>
      <div>
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className={`text-sm font-black mono tracking-tighter ${color}`}>{value}</p>
      </div>
    </div>
  );
}