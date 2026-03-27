import React from 'react';
import { motion } from 'framer-motion';
import { Armchair } from 'lucide-react';

export default function SeatMapPreview({ allocatedManifest, totalSeats }) {
  const rows = Math.ceil(totalSeats / 6);
  const leftSide = ['A', 'B', 'C'];
  const rightSide = ['D', 'E', 'F'];

  const getPassenger = (id) => allocatedManifest?.find(p => p.seat === id);

  return (
    <div className="w-full bg-white border border-[#D1D1D6] p-10 rounded-[4rem] shadow-2xl shadow-black/5 overflow-hidden">
      
      {/* ✈️ AIRCRAFT NOSE */}
      <div className="w-full mb-16 flex flex-col items-center">
        <div className="w-64 h-14 bg-[#F2F2F7] rounded-t-[5rem] border-t-2 border-x-2 border-[#D1D1D6] flex items-center justify-center relative overflow-hidden">
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-[#007AFF]/20"
          />
          <span className="text-[10px] font-black tracking-[0.6em] text-[#8E8E93] uppercase italic">Flight_Deck_Primary</span>
        </div>
        <div className="w-[2px] h-16 bg-gradient-to-b from-[#D1D1D6] to-transparent" />
      </div>

      {/* 💺 TACTICAL GRID WITH HARD AISLE GAP */}
      <div 
        className="grid gap-y-4 max-w-2xl mx-auto items-center"
        style={{ 
          // Column logic: [Row #] [A B C] [Aisle] [D E F]
          gridTemplateColumns: "40px 1fr 1fr 1fr 60px 1fr 1fr 1fr" 
        }}
      >
        
        {/* --- HEADER LABELS --- */}
        <div /> {/* Row Num Spacer */}
        {leftSide.map(l => <div key={l} className="text-center text-[11px] font-black text-[#AEAEB2] uppercase italic">{l}</div>)}
        <div /> {/* Aisle Spacer */}
        {rightSide.map(l => <div key={l} className="text-center text-[11px] font-black text-[#AEAEB2] uppercase italic">{l}</div>)}

        {/* --- ROWS GENERATION --- */}
        {Array.from({ length: rows }).map((_, r) => {
          const rowNum = r + 1;

          return (
            <React.Fragment key={r}>
              
              {/* 1. ROW IDENTIFIER */}
              <div className="text-[11px] font-black text-[#D1D1D6] italic text-right pr-4">
                {String(rowNum).padStart(2, '0')}
              </div>

              {/* 2. LEFT BLOCK (A, B, C) */}
              {leftSide.map((l) => (
                <Seat 
                  key={l} 
                  seatId={`${rowNum}${l}`} 
                  passenger={getPassenger(`${rowNum}${l}`)} 
                  label={l}
                  delay={(r * 0.01)}
                />
              ))}

              {/* 3. THE PHYSICAL AISLE (Gap) */}
              <div className="h-12 flex items-center justify-center">
                <div className="w-[1px] h-full bg-slate-100/50" />
              </div>

              {/* 4. RIGHT BLOCK (D, E, F) */}
              {rightSide.map((l) => (
                <Seat 
                  key={l} 
                  seatId={`${rowNum}${l}`} 
                  passenger={getPassenger(`${rowNum}${l}`)} 
                  label={l}
                  delay={(r * 0.01) + 0.02}
                />
              ))}

            </React.Fragment>
          );
        })}
      </div>

      {/* 🏷️ FOOTER LEGEND */}
      <div className="mt-20 pt-10 border-t border-[#F2F2F7] flex justify-center gap-16">
          <LegendItem color="bg-[#1C1C1E]" label="Manifested" />
          <LegendItem color="bg-white border-[#D1D1D6]" label="Vacant" />
          <LegendItem color="bg-[#E8F2FF] border-[#007AFF]" label="Priority" />
      </div>
    </div>
  );
}

function Seat({ seatId, passenger, label, delay }) {
  const isVIP = passenger?.Category?.toUpperCase() === 'VIP' || passenger?.class?.toUpperCase() === 'BUSINESS';

  return (
    <div className="flex justify-center group relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ scale: 1.1, zIndex: 50 }}
        className={`
          w-10 h-12 md:w-12 md:h-14 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer shadow-sm
          ${passenger ? 
            (isVIP ? 
              'bg-[#E8F2FF] border-[#007AFF] text-[#007AFF]' : 
              'bg-[#1C1C1E] border-[#1C1C1E] text-white'
            ) : 
            'bg-white border-[#F2F2F7] text-[#D1D1D6] hover:border-blue-200'}
        `}
      >
        <Armchair size={16} strokeWidth={passenger ? 3 : 1.5} />
        <span className="text-[8px] font-black mt-1">{label}</span>

        {passenger && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 hidden group-hover:block z-[100]">
            <div className="bg-[#1C1C1E] text-white p-3 rounded-2xl shadow-2xl min-w-[160px] border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-tighter truncate">{passenger.name}</p>
              <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                <span className="text-[9px] font-bold text-blue-400">{seatId}</span>
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Verified</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function LegendItem({ color, label }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-md border ${color}`} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#AEAEB2]">{label}</span>
        </div>
    );
}