import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { Plane, Navigation, Target, Activity } from 'lucide-react';
import { api } from '../api';

// --- 🛸 TACTICAL PLANE ICON ---
const createPlaneIcon = (rotation, color) => new L.DivIcon({
  html: `
    <div style="transform: rotate(${rotation}deg); transition: transform 0.5s ease-out;">
      <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" class="drop-shadow-[0_0_8px_${color}]">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5 20.5 3 18.5 3.5 17 5L13.5 8.5 5.3 6.7c-1.1-.2-2.2.5-2.4 1.5-.2 1.1.5 2.1 1.5 2.4l8.2 1.8L9 16l-3.3-.4c-.9-.1-1.7.5-1.9 1.4-.2.9.4 1.7 1.3 1.9l4.4.6 4.4.6c.9.1 1.7-.5 1.9-1.4.2-.9-.4-1.7-1.3-1.9z"/>
      </svg>
    </div>`,
  className: 'custom-plane-icon',
  iconSize: [35, 35],
});

export default function FlightMap() {
  const [flights, setFlights] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Fetch Fleet Data
  useEffect(() => {
    const loadFleet = async () => {
      try {
        const { data } = await api.getAllListings();
        setFlights(data || []);
      } catch (err) { console.error("RADAR_ERROR", err); }
    };
    loadFleet();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Real-Time Physics Calculation
  const calculateVesselState = (f) => {
    const start = new Date(f.departure).getTime();
    const end = new Date(f.arrival).getTime();
    const now = currentTime.getTime();

    // Progress 0 to 1
    let progress = (now - start) / (end - start);
    if (progress < 0) progress = 0;
    if (progress > 1) progress = 1;

    // Linear Interpolation (Lerp) for Lat/Lng
    const currentLat = f.sourceLat + (f.destLat - f.sourceLat) * progress;
    const currentLng = f.sourceLng + (f.destLng - f.sourceLng) * progress;

    // Heading Calculation (Degrees)
    const angle = Math.atan2(f.destLat - f.sourceLat, f.destLng - f.sourceLng) * (180 / Math.PI);

    return {
      pos: [currentLat, currentLng],
      heading: angle + 90,
      pct: (progress * 100).toFixed(1),
      isActive: progress > 0 && progress < 1
    };
  };

  return (
    <div className="h-screen w-full bg-[#020617] relative overflow-hidden">
      
      {/* 📡 TOP HUD: SYSTEM STATUS */}
      <div className="absolute top-8 left-8 z-[1000] space-y-4 pointer-events-none">
        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Activity size={20} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Fleet_Radar_v4.2</h1>
            <p className="text-[9px] text-cyan-500 font-bold uppercase tracking-[0.3em]">Active_Vessels: {flights.length}</p>
          </div>
        </div>
      </div>

      <MapContainer 
        center={[20, 78]} 
        zoom={5} 
        zoomControl={false}
        style={{ height: "100%", width: "100%", background: "#020617" }}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

        {flights.map((vessel) => {
          const state = calculateVesselState(vessel);
          const isCargo = vessel.vesselType === "CARGO";
          const color = isCargo ? "#f97316" : "#22d3ee"; // Orange (Cargo) vs Cyan (Pax)

          return (
            <React.Fragment key={vessel.id}>
              {/* 🟢 LINE 1: SOURCE TO PLANE (SOLID TRAIL) */}
              <Polyline 
                positions={[[vessel.sourceLat, vessel.sourceLng], state.pos]} 
                pathOptions={{ color: color, weight: 2, opacity: 0.8 }} 
              />

              {/* ⚪ LINE 2: PLANE TO DESTINATION (DASHED PROJECTED) */}
              <Polyline 
                positions={[state.pos, [vessel.destLat, vessel.destLng]]} 
                pathOptions={{ color: '#475569', weight: 1.5, dashArray: '10, 15', opacity: 0.5 }} 
              />

              {/* 🛸 THE MOVING VESSEL */}
              <Marker 
                position={state.pos} 
                icon={createPlaneIcon(state.heading, color)}
              >
                <Popup className="tactical-popup">
                  <div className="p-4 bg-[#020617] text-white min-w-[220px] rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black text-cyan-500 uppercase">{vessel.airline}</span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase">{vessel.vesselType}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-[9px] uppercase font-black">
                       <div>ORIGIN <br/><span className="text-white text-[11px]">{vessel.source}</span></div>
                       <div className="text-right">TARGET <br/><span className="text-white text-[11px]">{vessel.destination}</span></div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                       <div className="flex justify-between text-[8px] font-bold mb-1">
                          <span className="text-slate-500 uppercase tracking-widest">Progress</span>
                          <span className="text-cyan-400">{state.pct}%</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${state.pct}%` }} />
                       </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* 🛰️ SCANLINE EFFECT */}
      <div className="absolute inset-0 pointer-events-none z-[1001] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
    </div>
  );
}