import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Map as MapIcon, LogOut, Navigation, 
  Database, RefreshCcw, ChevronRight, Plus, FileText, 
  ShieldCheck, MessageSquare, Fingerprint, Activity, 
  Zap, Search, ArrowUpRight, Radar, Terminal, Globe, ArrowRight
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

  const handleManageOps = (flight) => {
    setActiveFlight(flight);
    setTab("ops");
  };

  const filteredFlights = useMemo(() => {
    let result = flights.filter(f => 
      f.airline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.source?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return result.sort((a, b) => {
      // Logic for price sorting removed - defaulting to chronology
      if (sortBy === "departure") return new Date(a.departure) - new Date(b.departure);
      return 0;
    });
  }, [flights, searchQuery, sortBy]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-[#001F3F] flex overflow-hidden selection:bg-[#007BFF] selection:text-white font-sans">
      
      {/* 🛠️ SIDEBAR: DEEP NAVY COMMAND STRIP */}
      <aside className="w-24 hover:w-72 transition-all duration-500 group border-r border-blue-200 bg-[#003366] flex flex-col p-5 z-50 shadow-[10px_0_30px_rgba(0,51,102,0.1)]">
        <div className="flex items-center gap-5 mb-16 px-2">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="min-w-[48px] h-12 rounded-2xl flex items-center justify-center bg-[#007BFF] shadow-lg shadow-blue-500/30"
          >
            <Radar className="text-white" size={24} />
          </motion.div>
          <span className="font-black text-2xl tracking-tighter text-white opacity-0 group-hover:opacity-100 transition-all duration-500 uppercase whitespace-nowrap">SKYLINK GLOBAL</span>
        </div>

        <nav className="flex-1 space-y-4">
          <NavItem icon={<LayoutDashboard size={24}/>} label="OPERATIONS" active={tab === "flights"} onClick={() => setTab("flights")} />
          <NavItem icon={<Database size={24}/>} label="FLEET MANIFEST" active={tab === "inventory"} onClick={() => setTab("inventory")} />
          <NavItem icon={<Globe size={24}/>} label="AIRSPACE MAP" active={tab === "map"} onClick={() => setTab("map")} />
          <NavItem icon={<MessageSquare size={24}/>} label="COMMS LINK" active={tab === "chat"} onClick={() => setTab("chat")} />
          <NavItem icon={<Fingerprint size={24}/>} label="USER IDENTITY" active={tab === "profile"} onClick={() => setTab("profile")} />
        </nav>

        <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="p-5 text-blue-300/50 hover:text-orange-400 flex items-center gap-5 transition-all border-t border-blue-800 group/out">
          <LogOut size={24} />
          <span className="font-bold text-sm opacity-0 group-hover:opacity-100 uppercase tracking-widest">Sign Out</span>
        </button>
      </aside>

      {/* 🖥️ MAIN INTERFACE: CLEAN VIBRANT DECK */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        <header className="h-28 border-b border-blue-100 flex items-center justify-between px-12 bg-white/90 backdrop-blur-2xl z-40">
          <div className="space-y-1">
            <h2 className="text-[10px] font-black text-[#007BFF] uppercase tracking-[0.4em]">Command Authority // Sector Blue</h2>
            <p className="text-4xl font-extrabold text-[#001F3F] tracking-tighter uppercase leading-none">
              Control Monitor <span className="text-blue-200 font-medium lowercase">/ {tab}</span>
            </p>
          </div>

          <div className="flex items-center gap-10">
             <div className="hidden lg:flex gap-10 border-r border-blue-50 pr-10">
                <StatusNode label="SIGNAL" value="OPTIMAL" color="text-green-500" icon={<Zap size={14} className="fill-green-500" />} />
                <StatusNode label="ASSETS" value={flights.length} color="text-[#007BFF]" icon={<Navigation size={14}/>} />
             </div>
             <motion.div 
               whileHover={{ scale: 1.05 }}
               onClick={() => setTab("profile")} 
               className="w-14 h-14 rounded-full border-4 border-[#F0F7FF] shadow-xl cursor-pointer overflow-hidden bg-blue-100 ring-2 ring-blue-50"
             >
                <img src={profile.photoUrl || "https://ui-avatars.com/api/?name=User"} className="w-full h-full object-cover" alt="User" />
             </motion.div>
          </div>
        </header>

        <div className="flex-1 p-12 overflow-y-auto relative bg-[#F9FBFF]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={tab} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "circOut" }}
            >
              {/* --- 📦 TAB: INVENTORY (THE MANIFEST) --- */}
              {tab === "inventory" && (
                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row gap-8 justify-between items-center bg-white border border-blue-100 p-8 rounded-[2.5rem] shadow-sm">
                    <div className="relative w-full md:w-[600px]">
                      <Search size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-blue-300" />
                      <input 
                        type="text" 
                        placeholder="Search Fleet Registry..." 
                        className="w-full bg-[#F4F9FF] border border-blue-100 rounded-2xl py-5 pl-16 pr-8 text-lg font-semibold focus:ring-4 focus:ring-blue-50 focus:border-[#007BFF] outline-none transition-all placeholder:text-blue-200 text-[#003366]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                      <select 
                        className="flex-1 md:w-64 bg-white border border-blue-100 rounded-2xl p-5 text-xs font-black uppercase tracking-widest outline-none focus:border-[#007BFF] text-[#003366] cursor-pointer shadow-sm"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="departure">Filter: Chronology</option>
                      </select>
                      <button onClick={() => navigate("/create-listing")} className="bg-[#FF7F50] text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-[#E06940] transition-all shadow-lg shadow-orange-200 active:scale-95">
                        <Plus size={20} /> Enroll Asset
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-blue-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/5">
                    <table className="w-full text-left">
                      <thead className="bg-[#F0F7FF] border-b border-blue-100">
                        <tr>
                          <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Vessel Identity</th>
                          <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Vector Path</th>
                          <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Sync Status</th>
                          <th className="p-10 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-50">
                        {filteredFlights.length > 0 ? filteredFlights.map((f, i) => (
                          <InventoryRow key={f.id} f={f} index={i} onView={() => navigate(`/product/${f.id}`)} onManage={() => handleManageOps(f)} />
                        )) : (
                          <tr><td colSpan="4" className="p-40 text-center text-blue-200 font-black text-2xl tracking-tighter uppercase">No assets detected</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- 🚀 TAB: TELEMETRY (CARDS) --- */}
              {tab === "flights" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {filteredFlights.map(f => (
                    <FleetCard key={f.id} f={f} onClick={() => navigate(`/product/${f.id}`)} onManage={() => handleManageOps(f)} />
                  ))}
                </div>
              )}

              {/* MODULE OVERLAYS */}
              {tab === "map" && <div className="h-[75vh] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl"><FlightMap flights={flights} /></div>}
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

function InventoryRow({ f, onView, onManage, index }) {
  const isAirborne = new Date(f.departure) < new Date() && new Date(f.arrival) > new Date();

  return (
    <motion.tr 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="hover:bg-[#F0F7FF] transition-all group"
    >
      <td className="p-10">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 rounded-3xl bg-white border-2 border-blue-50 overflow-hidden shadow-sm group-hover:border-[#007BFF] transition-all duration-500">
            <img src={f.images?.[0]?.url || "/placeholder.jpg"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="vessel" />
          </div>
          <div>
            <p className="text-2xl font-black text-[#001F3F] tracking-tighter uppercase leading-none">{f.airline}</p>
            <p className="text-[10px] text-[#007BFF] font-black uppercase mt-2 tracking-widest">{f.aircraftModel || "Gen-5 Asset"}</p>
          </div>
        </div>
      </td>
      <td className="p-10">
        <div className="flex items-center gap-6 text-xl font-black text-[#003366]">
          <span>{f.source}</span>
          <ArrowRight size={20} className="text-blue-200 group-hover:text-[#007BFF] transition-colors" />
          <span>{f.destination}</span>
        </div>
        <p className="text-[10px] text-blue-300 mt-2 font-black uppercase tracking-widest">
           Departure: {new Date(f.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </td>
      <td className="p-10">
        <div className="space-y-4">
          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase border tracking-[0.2em] ${
            isAirborne ? "bg-green-500 text-white border-green-400" : "bg-white text-blue-300 border-blue-100"
          }`}>
            {isAirborne ? "In Transit" : "Stationary"}
          </span>
          <div className="w-32 h-1.5 bg-blue-50 rounded-full overflow-hidden">
             <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} className="h-full bg-[#007BFF]" />
          </div>
        </div>
      </td>
      <td className="p-10 text-right">
        <div className="flex justify-end gap-4">
            <button onClick={onView} className="p-5 bg-white text-blue-300 hover:text-[#007BFF] hover:bg-white rounded-2xl shadow-sm border border-blue-50 transition-all hover:shadow-lg">
                <ArrowUpRight size={24} />
            </button>
            <button onClick={onManage} className="p-5 bg-white text-blue-300 hover:text-orange-500 hover:bg-white rounded-2xl shadow-sm border border-blue-50 transition-all hover:shadow-lg">
                <ShieldCheck size={24} />
            </button>
        </div>
      </td>
    </motion.tr>
  );
}

function FleetCard({ f, onClick, onManage }) {
    return (
      <motion.div 
        whileHover={{ y: -10 }}
        className="bg-white border border-blue-100 p-8 rounded-[3rem] hover:shadow-[0_20px_50px_rgba(0,123,255,0.1)] transition-all duration-500 group flex flex-col justify-between h-full relative overflow-hidden shadow-xl shadow-blue-900/5"
      >
        <div className="cursor-pointer" onClick={onClick}>
            <div className="overflow-hidden rounded-[2rem] mb-8 aspect-video bg-blue-50">
                <img src={f.images?.[0]?.url || "/placeholder.jpg"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt="vessel" />
            </div>
            <h4 className="text-3xl font-black text-[#001F3F] tracking-tighter uppercase leading-none mb-4">{f.airline}</h4>
            <div className="flex justify-between mt-4 text-[10px] font-black text-blue-300 uppercase tracking-widest">
                <span>{f.source} → {f.destination}</span>
                {/* Price Span Removed */}
            </div>
        </div>
        <button onClick={onManage} className="mt-10 w-full bg-[#001F3F] hover:bg-[#007BFF] text-white py-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">
            Access Controls
        </button>
      </motion.div>
    );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-6 p-5 rounded-2xl transition-all duration-500 ${active ? "bg-[#007BFF] text-white shadow-xl shadow-blue-500/40 scale-105" : "text-blue-200 hover:text-white hover:bg-white/10"}`}>
      {icon}
      <span className="font-black text-xs tracking-[0.1em] uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">{label}</span>
    </button>
  );
}

function StatusNode({ label, value, color, icon }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">{label}</span>
      </div>
      <span className={`font-black text-xl tracking-tighter uppercase ${color}`}>{value}</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen bg-[#F0F7FF] flex flex-col items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} 
        className="w-20 h-20 border-8 border-blue-50 border-t-[#007BFF] rounded-full mb-10 shadow-2xl bg-white" 
      />
      <p className="text-sm font-black text-[#003366] uppercase tracking-[0.8em] animate-pulse">Initializing System</p>
    </div>
  );
}