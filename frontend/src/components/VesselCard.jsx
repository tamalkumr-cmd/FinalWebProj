import { motion } from "framer-motion";
import { Plane, Navigation, Calendar, Activity } from "lucide-react";

export default function VesselCard({ flight }) {
  // Get the first image from the array or a fallback
  const displayImage = flight.images?.[0]?.url || "https://images.unsplash.com/photo-1544016768-982d1554f0b9?q=80&w=1000&auto=format&fit=crop";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-md hover:border-cyan-500/50 transition-all duration-500"
    >
      {/* AIRCRAFT IMAGE SECTION */}
      <div className="relative h-48 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] to-transparent z-10" />
        <img 
          src={displayImage} 
          alt={flight.airline}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
        />
        {/* HUD OVERLAY ON IMAGE */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <div className="px-2 py-1 bg-black/60 border border-white/10 rounded text-[8px] font-black text-white uppercase tracking-widest backdrop-blur-md">
            ID: {flight.id.slice(0, 8)}
          </div>
          <div className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded text-[8px] font-black text-cyan-400 uppercase tracking-widest backdrop-blur-md flex items-center gap-1">
            <Activity size={10} className="animate-pulse" /> Live_Tracking_Active
          </div>
        </div>
      </div>

      {/* MISSION DATA SECTION */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">
              {flight.airline}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">
              Asset_Type: {flight.aircraftModel || "B737-MAX"}
            </p>
          </div>
          <Plane className="text-cyan-500 group-hover:rotate-45 transition-transform duration-500" size={20} />
        </div>

        {/* VECTOR TRACKING */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
          <div className="space-y-1">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Origin</span>
            <p className="text-sm font-bold text-white uppercase tracking-tighter flex items-center gap-2">
              <Navigation size={12} className="text-cyan-500" /> {flight.source}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Target</span>
            <p className="text-sm font-bold text-white uppercase tracking-tighter flex items-center gap-2 justify-end">
              {flight.destination} <Navigation size={12} className="text-blue-500 rotate-90" />
            </p>
          </div>
        </div>

        {/* TIME & SEATS */}
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar size={12} />
            <span>{new Date(flight.departure).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-500/50">Capacity:</span>
            <span>{flight.seatsCount} Units</span>
          </div>
        </div>

        {/* OPERATOR ACTION */}
        <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.3em] group-hover:bg-cyan-500 group-hover:text-black transition-all duration-300">
          Mission_Full_Briefing
        </button>
      </div>
    </motion.div>
  );
}