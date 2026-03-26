import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Map as MapIcon, LogOut, Navigation, 
  Database, RefreshCcw, ChevronRight, Plus, FileText, 
  ShieldCheck, MessageSquare, Fingerprint, Activity, 
  Zap, Search, ArrowUpRight
} from "lucide-react";

// --- 🛰️ MODULE IMPORTS ---
import FlightMap from "./FlightMap";
import FlightOperations from "./FlightOperations";
import Profile from "./Profile";
import ChatPage from "./ChatPage";

export default function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("inventory"); 
  const [flights, setFlights] = useState([]);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeFlight, setActiveFlight] = useState(null);
  
  // --- 🔍 FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("departure");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [f, p] = await Promise.all([api.fetchListings(), api.getProfile()]);
      setFlights(Array.isArray(f) ? f : (f?.listings || []));
      setProfile(p || {});
    } catch (e) {
      console.error("DASHBOARD_SYNC_ERROR", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // --- 🛰️ ACTION HANDLERS ---
  const handleManageOps = (flight) => {
    setActiveFlight(flight);
    setTab("ops");
  };

  // --- ⚙️ FILTER LOGIC ---
  const filteredFlights = useMemo(() => {
    let result = flights.filter(f => 
      f.airline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.source?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return result.sort((a, b) => {
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "departure") return new Date(a.departure) - new Date(b.departure);
      return 0;
    });
  }, [flights, searchQuery, sortBy]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-mono flex overflow-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* 🛠️ SIDEBAR NAVIGATION */}
      <aside className="w-20 hover:w-64 transition-all duration-500 group border-r border-white/5 bg-[#020617] flex flex-col p-4 z-50 shadow-2xl">
        <div className="flex items-center gap-4 mb-10 px-2">
          <div className="min-w-[40px] h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Navigation className="text-black" size={20} />
          </div>
          <span className="font-black text-xl tracking-tighter text-white opacity-0 group-hover:opacity-100 transition-opacity uppercase italic">Sky_Link.os</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={<LayoutDashboard size={18}/>} label="OPERATIONS" active={tab === "flights"} onClick={() => setTab("flights")} />
          <NavItem icon={<Database size={18}/>} label="INVENTORY" active={tab === "inventory"} onClick={() => setTab("inventory")} />
          <NavItem icon={<MapIcon size={18}/>} label="LIVE_RADAR" active={tab === "map"} onClick={() => setTab("map")} />
          <NavItem icon={<MessageSquare size={18}/>} label="COMMS_LINK" active={tab === "chat"} onClick={() => setTab("chat")} />
          <NavItem icon={<Fingerprint size={18}/>} label="PERSONNEL" active={tab === "profile"} onClick={() => setTab("profile")} />
        </nav>

        <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="p-4 text-slate-600 hover:text-red-500 flex items-center gap-4 transition-colors border-t border-white/5 group/out">
          <LogOut size={18} />
          <span className="font-black text-[10px] opacity-0 group-hover:opacity-100 uppercase tracking-widest">Disconnect</span>
        </button>
      </aside>

      {/* 🖥️ MAIN INTERFACE */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md z-40">
          <div>
            <h2 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.4em]">Sector_Overview</h2>
            <p className="text-xl font-black text-white italic tracking-tighter uppercase">Command_Terminal <span className="text-slate-600 font-normal lowercase">// {tab}</span></p>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden lg:flex gap-6 border-r border-white/10 pr-8">
                <StatusNode label="SIGNAL" value="98%" color="text-emerald-500" icon={<Activity size={10}/>} />
                <StatusNode label="FLEET" value={flights.length} color="text-cyan-400" icon={<Zap size={10}/>} />
             </div>
             <div onClick={() => setTab("profile")} className="w-10 h-10 rounded-full border border-white/10 overflow-hidden cursor-pointer group shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                <img src={profile.photoUrl || "https://ui-avatars.com/api/?name=User"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Avatar" />
             </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
          <AnimatePresence mode="wait">
            <motion.div 
              key={tab} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* --- 📦 TAB: INVENTORY (ROW-WISE LOG) --- */}
              {tab === "inventory" && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/[0.02] p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
                    <div className="relative w-full md:w-96">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                      <input 
                        type="text" 
                        placeholder="FILTER_BY_CALLSIGN_OR_DESTINATION..." 
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:border-cyan-500 outline-none transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                      <select 
                        className="flex-1 md:w-48 bg-black/40 border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase outline-none focus:border-cyan-500 text-slate-400"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="departure">SORT: DEPARTURE</option>
                        <option value="price">SORT: PRICE_VALUE</option>
                      </select>
                      <button onClick={() => navigate("/create-listing")} className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:shadow-[0_0_20px_cyan] transition-all">
                        <Plus size={14} /> New_Asset
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                          <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Vessel_Identity</th>
                          <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Route_Vector</th>
                          <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-500">Status_Telemetry</th>
                          <th className="p-6 text-[9px] font-black uppercase tracking-widest text-slate-500 text-right">Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredFlights.length > 0 ? filteredFlights.map(f => (
                          <InventoryRow 
                            key={f.id} 
                            f={f} 
                            onView={() => navigate(`/product/${f.id}`)} 
                            onManage={() => handleManageOps(f)}
                          />
                        )) : (
                          <tr><td colSpan="4" className="p-20 text-center text-slate-600 font-black uppercase text-xs tracking-[0.5em]">No_Vessels_Detected</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- 🚀 TAB: OPERATIONS (CARD VIEW) --- */}
              {tab === "flights" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFlights.map(f => (
                    <FleetCard key={f.id} f={f} onClick={() => navigate(`/product/${f.id}`)} onManage={() => handleManageOps(f)} />
                  ))}
                </div>
              )}

              {/* --- 🗺️ OTHER TABS --- */}
              {tab === "map" && <div className="h-[75vh] rounded-[3rem] overflow-hidden border border-white/5"><FlightMap flights={flights} /></div>}
              {tab === "chat" && <ChatPage currentUser={profile} />}
              {tab === "profile" && <Profile />}
              {tab === "ops" && <FlightOperations selectedFlight={activeFlight} />}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- 🛠️ SUB-COMPONENTS ---

function InventoryRow({ f, onView, onManage }) {
  const isAirborne = new Date(f.departure) < new Date() && new Date(f.arrival) > new Date();

  return (
    <tr className="hover:bg-white/[0.03] transition-colors group">
      <td className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden grayscale group-hover:grayscale-0 transition-all">
            <img src={f.images?.[0]?.url || "/placeholder.jpg"} className="w-full h-full object-cover" alt="ship" />
          </div>
          <div>
            <p className="text-sm font-black text-white italic uppercase">{f.airline}</p>
            <p className="text-[8px] text-slate-500 font-bold tracking-tighter uppercase">{f.aircraftModel || "CLASS_UNKNOWN"}</p>
          </div>
        </div>
      </td>
      <td className="p-6">
        <div className="flex items-center gap-3 text-[10px] font-black">
          <span className="text-white">{f.source}</span>
          <ChevronRight size={12} className="text-cyan-500" />
          <span className="text-white">{f.destination}</span>
        </div>
        <p className="text-[7px] text-slate-600 mt-1 font-bold uppercase tracking-widest">
            Departure: {new Date(f.departure).toLocaleDateString()}
        </p>
      </td>
      <td className="p-6">
        <div className="space-y-2">
          <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase border ${
            isAirborne ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
          }`}>
            {isAirborne ? "● Airborne" : "○ Hangar_Ready"}
          </span>
          <div className="space-y-1 w-28">
            <div className="flex justify-between text-[7px] font-bold uppercase tracking-tighter">
               <span className="text-slate-500">Fuel</span>
               <span className="text-cyan-500">{f.fuelLoad || 100}%</span>
            </div>
            <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: `${f.fuelLoad || 100}%` }} className="h-full bg-cyan-500" />
            </div>
          </div>
        </div>
      </td>
      <td className="p-6 text-right">
        <div className="flex justify-end gap-2">
            <button onClick={onView} className="p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all">
                <ArrowUpRight size={16} />
            </button>
            <button onClick={onManage} className="p-3 bg-cyan-500/10 hover:bg-cyan-500 hover:text-black text-cyan-500 rounded-xl transition-all border border-cyan-500/20">
                <ShieldCheck size={16} />
            </button>
        </div>
      </td>
    </tr>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]" : "text-slate-500 hover:text-white hover:bg-white/5"}`}>
      {icon}
      <span className="font-black text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{label}</span>
    </button>
  );
}

function StatusNode({ label, value, color, icon }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-[8px] text-slate-600 font-black uppercase">{label}</span>
      </div>
      <span className={`font-black ${color}`}>{value}</span>
    </div>
  );
}

function FleetCard({ f, onClick, onManage }) {
    return (
      <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] hover:bg-white/[0.08] transition-all group flex flex-col justify-between h-full">
        <div className="cursor-pointer" onClick={onClick}>
            <img src={f.images?.[0]?.url || "/placeholder.jpg"} className="w-full h-32 object-cover rounded-2xl mb-4 grayscale group-hover:grayscale-0 transition-all" alt="vessel" />
            <h4 className="font-black text-white italic uppercase truncate">{f.airline}</h4>
            <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-500 uppercase">
                <span>{f.source} → {f.destination}</span>
                <span className="text-cyan-500">${f.price}</span>
            </div>
        </div>
        <button onClick={onManage} className="mt-4 w-full bg-cyan-500/10 hover:bg-cyan-500 hover:text-black text-cyan-500 py-3 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2">
            <ShieldCheck size={12} /> Alloc_Seats
        </button>
      </div>
    );
}

function LoadingScreen() {
  return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full mb-4" />
      <p className="text-[10px] font-black tracking-[0.5em] text-cyan-500 uppercase animate-pulse">Syncing_Mainframe</p>
    </div>
  );
}