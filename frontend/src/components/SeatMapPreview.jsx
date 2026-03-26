import React from 'react';
import { motion } from 'framer-motion';
import { Armchair, User } from 'lucide-react';

export default function SeatMapPreview({ allocatedManifest, totalSeats }) {
  const rows = Math.ceil(totalSeats / 6);
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const getPassenger = (id) => allocatedManifest.find(p => p.seat === id);

  return (
    <div className="w-full bg-black/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-2xl overflow-y-auto max-h-[70vh] custom-scrollbar">
      
      {/* 🛸 FRONT OF AIRCRAFT INDICATOR */}
      <div className="w-full mb-12 flex flex-col items-center">
        <div className="w-40 h-10 bg-cyan-500/20 rounded-t-full border-t-2 border-cyan-500/50 flex items-center justify-center">
          <span className="text-[8px] font-black tracking-[0.5em] text-cyan-400 uppercase">Cockpit_Entry</span>
        </div>
        <div className="w-[2px] h-10 bg-gradient-to-b from-cyan-500 to-transparent" />
      </div>

      {/* 💺 7-COLUMN TACTICAL GRID (3 Seats | Aisle | 3 Seats) */}
      <div className="grid grid-cols-7 gap-y-6 gap-x-2 md:gap-x-4 max-w-2xl mx-auto">
        
        {/* Header Labels */}
        <div /> {/* Empty for row numbers */}
        {['A', 'B', 'C'].map(l => <div key={l} className="text-center text-[10px] font-black text-slate-700">{l}</div>)}
        <div className="text-center text-[8px] font-black text-cyan-900/30 uppercase tracking-tighter">Aisle</div>
        {['D', 'E', 'F'].map(l => <div key={l} className="text-center text-[10px] font-black text-slate-700">{l}</div>)}

        {Array.from({ length: rows }).map((_, r) => (
          <React.Fragment key={r}>
            
            {/* ROW IDENTIFIER */}
            <div className="flex items-center justify-center text-[10px] font-black text-slate-500 italic">
              {String(r + 1).padStart(2, '0')}
            </div>

            {/* SEATS MAPPING */}
            {letters.map((l, i) => {
              const seatId = `${r + 1}${l}`;
              const passenger = getPassenger(seatId);
              const isVIP = passenger?.Category?.toUpperCase() === 'VIP';

              return (
                <React.Fragment key={l}>
                  {/* INSERT AISLE GAP AFTER COLUMN C (Index 2) */}
                  {i === 3 && <div className="w-6 md:w-10" />} 

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (r * 0.03) + (i * 0.01) }}
                    className={`
                      relative w-10 h-12 md:w-12 md:h-14 rounded-xl border-2 transition-all duration-500 flex flex-col items-center justify-center group cursor-crosshair
                      ${passenger ? 
                        (isVIP ? 
                          'bg-purple-600 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)]' : 
                          'bg-cyan-500 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                        ) : 
                        'bg-white/5 border-white/10 opacity-20 hover:opacity-40'}
                    `}
                  >
                    <Armchair size={16} className={passenger ? "text-black" : "text-slate-600"} />
                    <span className={`text-[7px] font-black mt-1 ${passenger ? "text-black/60" : "text-slate-800"}`}>
                      {l}
                    </span>

                    {/* HUD TOOLTIP */}
                    {passenger && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 hidden group-hover:block z-[100] w-40 pointer-events-none">
                        <div className="bg-black/90 backdrop-blur-md border border-cyan-500 p-3 rounded-2xl shadow-2xl">
                           <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full animate-pulse ${isVIP ? 'bg-purple-500' : 'bg-cyan-500'}`} />
                              <p className="text-[9px] font-black text-white truncate">{passenger.name}</p>
                           </div>
                           <p className="text-[7px] text-slate-500 uppercase font-bold tracking-widest">{isVIP ? 'Priority_Asset' : 'Standard_Unit'}</p>
                        </div>
                        <div className="w-3 h-3 bg-black border-r border-b border-cyan-500 rotate-45 mx-auto -mt-1.5" />
                      </div>
                    )}
                  </motion.div>
                </React.Fragment>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}