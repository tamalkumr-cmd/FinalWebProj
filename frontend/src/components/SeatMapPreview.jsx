import React from 'react';
import { motion } from 'framer-motion';
import { Armchair } from 'lucide-react';

export default function SeatMapPreview({ allocatedManifest, totalSeats }) {
  const rows = Math.ceil(totalSeats / 6);
  // Definitive split for the 7-column layout
  const leftSide = ['A', 'B', 'C'];
  const rightSide = ['D', 'E', 'F'];

  const getPassenger = (id) => allocatedManifest?.find(p => p.seat === id);

  return (
    <div className="w-full bg-white border border-[#D1D1D6] p-10 rounded-[3rem] shadow-2xl shadow-black/5 overflow-hidden">
      
      {/* ✈️ AIRCRAFT NOSE / FLIGHT DECK */}
      <div className="w-full mb-16 flex flex-col items-center">
        <div className="w-56 h-12 bg-[#F2F2F7] rounded-t-[4rem] border-t-2 border-x-2 border-[#D1D1D6] flex items-center justify-center relative overflow-hidden">
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-[#007AFF]/10"
          />
          <span className="text-[10px] font-black tracking-[0.5em] text-[#8E8E93] uppercase">Flight_Deck</span>
        </div>
        <div className="w-[1px] h-12 bg-gradient-to-b from-[#D1D1D6] to-transparent" />
      </div>

      {/* 💺 TACTICAL 7-COLUMN GRID */}
      <div className="grid grid-cols-7 gap-y-6 max-w-4xl mx-auto items-center">
        
        {/* --- HEADER LABELS --- */}
        <div /> {/* Row Number Spacer */}
        {leftSide.map(l => <div key={l} className="text-center text-xs font-extrabold text-[#AEAEB2]">{l}</div>)}
        <div className="text-center text-[9px] font-black text-[#007AFF]/30 uppercase italic tracking-tighter">Aisle</div>
        {rightSide.map(l => <div key={l} className="text-center text-xs font-extrabold text-[#AEAEB2]">{l}</div>)}

        {/* --- ROWS GENERATION --- */}
        {Array.from({ length: rows }).map((_, r) => {
          const rowNum = r + 1;

          return (
            <React.Fragment key={r}>
              
              {/* 1. ROW IDENTIFIER */}
              <div className="flex items-center justify-center text-sm font-black text-[#D1D1D6] italic pr-4">
                {String(rowNum).padStart(2, '0')}
              </div>

              {/* 2. LEFT BLOCK (A, B, C) */}
              {leftSide.map((l) => (
                <Seat 
                  key={l} 
                  seatId={`${rowNum}${l}`} 
                  passenger={getPassenger(`${rowNum}${l}`)} 
                  label={l}
                  delay={(r * 0.02)}
                />
              ))}

              {/* 3. THE AISLE (Column 4) */}
              <div className="flex justify-center h-full border-x border-slate-100/50 bg-slate-50/30">
                <div className="w-[1px] h-full" />
              </div>

              {/* 4. RIGHT BLOCK (D, E, F) */}
              {rightSide.map((l) => (
                <Seat 
                  key={l} 
                  seatId={`${rowNum}${l}`} 
                  passenger={getPassenger(`${rowNum}${l}`)} 
                  label={l}
                  delay={(r * 0.02) + 0.05}
                />
              ))}

            </React.Fragment>
          );
        })}
      </div>

      {/* 🏷️ FOOTER LEGEND */}
      <div className="mt-16 pt-8 border-t border-[#F2F2F7] flex justify-center gap-12">
          <LegendItem color="bg-[#1C1C1E]" label="Manifested" />
          <LegendItem color="bg-white border-[#D1D1D6]" label="Vacant" />
          <LegendItem color="bg-[#E8F2FF] border-[#007AFF]" label="Priority" />
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: INDIVIDUAL SEAT ---
function Seat({ seatId, passenger, label, delay }) {
  const isVIP = passenger?.Category?.toUpperCase() === 'VIP' || passenger?.class === 'BUSINESS';

  return (
    <div className="flex justify-center group relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        whileHover={{ y: -4, scale: 1.08 }}
        className={`
          w-10 h-12 md:w-14 md:h-16 rounded-2xl border-2 transition-all duration-500 flex flex-col items-center justify-center cursor-crosshair shadow-sm
          ${passenger ? 
            (isVIP ? 
              'bg-[#E8F2FF] border-[#007AFF] text-[#007AFF]' : 
              'bg-[#1C1C1E] border-[#1C1C1E] text-white shadow-xl'
            ) : 
            'bg-white border-[#E5E5EA] text-[#D1D1D6] hover:border-[#AEAEB2] hover:bg-slate-50'}
        `}
      >
        <Armchair size={20} strokeWidth={passenger ? 2.5 : 1.5} />
        <span className={`text-[9px] font-black mt-1 uppercase ${passenger ? "opacity-60" : "opacity-20"}`}>
          {label}
        </span>

        {/* 📟 INTELLIGENT TOOLTIP */}
        {passenger && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-5 hidden group-hover:block z-[100] pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-white border border-[#D1D1D6] p-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] min-w-[200px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isVIP ? 'bg-[#007AFF]' : 'bg-[#34C759]'} animate-pulse`} />
                <p className="text-xs font-extrabold text-[#1C1C1E] uppercase truncate">{passenger.name}</p>
              </div>
              <div className="flex justify-between items-center border-t border-[#F2F2F7] pt-2 mt-2">
                 <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest">{seatId}</p>
                 <span className="text-[9px] px-2 py-0.5 bg-[#F2F2F7] rounded-md text-[#1C1C1E] font-extrabold uppercase">Confirmed</span>
              </div>
            </motion.div>
            <div className="w-3 h-3 bg-white border-r border-b border-[#D1D1D6] rotate-45 mx-auto -mt-1.5" />
          </div>
        )}
      </motion.div>
    </div>
  );
}

function LegendItem({ color, label }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-lg border shadow-sm ${color}`} />
            <span className="text-xs font-black uppercase tracking-widest text-[#8E8E93]">{label}</span>
        </div>
    );
}