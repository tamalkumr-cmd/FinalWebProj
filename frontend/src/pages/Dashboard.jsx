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
      if (sortBy === "price") return b.price - a.price;
      if (sortBy === "departure") return new Date(a.departure) - new Date(b.departure);
      return 0;
    });
  }, [flights, searchQuery, sortBy]);

  if (loading) return <LoadingScreen />;

  // 🍏 SAN FRANCISCO FONT STACK & GREY-BLUE THEME
  const fontStack = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";

  return (
    <div 
      style={{ fontFamily: fontStack }}
      className="min-h-screen bg-[#F0F2F5] text-slate-900 flex overflow-hidden selection:bg-indigo-500 selection:text-white"
    >
      {/* --- BACKGROUND ANIMATION --- */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#CBD5E1_0%,transparent_100%)]" />
      </div>
      
      {/* 🛠️ SIDEBAR: TITANIUM BLUE STRIP */}
      <aside className="w-24 hover:w-72 transition-all duration-500 group border-r border-slate-300 bg-[#FFFFFF]/90 backdrop-blur-2xl flex flex-col p-5 z-50 shadow-2xl">
        <div className="flex items-center gap-5 mb-16 px-2">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="min-w-[48px] h-12 rounded-2xl flex items-center justify-center bg-indigo-600 shadow-lg shadow-indigo-200"
          >
            <Radar className="text-white" size={24} />
          </motion.div>
          <span className="font-bold text-2xl tracking-tight text-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-500 uppercase italic whitespace-nowrap">Sky_Link.os</span>
        </div>

        <nav className="flex-1 space-y-4">
          <NavItem icon={<LayoutDashboard size={24}/>} label="OPERATIONS" active={tab === "flights"} onClick={() => setTab("flights")} />
          <NavItem icon={<Database size={24}/>} label="MANIFEST" active={tab === "inventory"} onClick={() => setTab("inventory")} />
          <NavItem icon={<Globe size={24}/>} label="AIRSPACE" active={tab === "map"} onClick={() => setTab("map")} />
          <NavItem icon={<MessageSquare size={24}/>} label="COMMS_LINK" active={tab === "chat"} onClick={() => setTab("chat")} />
          <NavItem icon={<Fingerprint size={24}/>} label="USER_ID" active={tab === "profile"} onClick={() => setTab("profile")} />
        </nav>

        <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="p-5 text-slate-400 hover:text-red-500 flex items-center gap-5 transition-all border-t border-slate-200 group/out">
          <LogOut size={24} />
          <span className="font-bold text-sm opacity-0 group-hover:opacity-100 uppercase tracking-widest">Terminate</span>
        </button>
      </aside>

      {/* 🖥️ MAIN INTERFACE: BLUE-GREY COMMAND DECK */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-28 border-b border-slate-300 flex items-center justify-between px-12 bg-white/70 backdrop-blur-xl z-40">
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-indigo-500 uppercase tracking-[0.4em]">Command_Authority // Sector_Blue</h2>
            <p className="text-4xl font-extrabold text-slate-900 italic tracking-tight uppercase leading-none">
              Control_Monitor <span className="text-slate-400 font-medium lowercase">// {tab}</span>
            </p>
          </div>

          <div className="flex items-center gap-10">
             <div className="hidden lg:flex gap-10 border-r border-slate-200 pr-10">
                <StatusNode label="SIGNAL" value="OPTIMAL" color="text-emerald-600" icon={<Zap size={14} className="fill-emerald-600" />} />
                <StatusNode label="ASSETS" value={flights.length} color="text-indigo-600" icon={<Navigation size={14}/>} />
             </div>
             <motion.div 
               whileHover={{ scale: 1.1, rotate: 5 }}
               onClick={() => setTab("profile")} 
               className="w-14 h-14 rounded-full border-4 border-white shadow-2xl cursor-pointer overflow-hidden bg-slate-300"
             >
                <img src={profile.photoUrl || "https://ui-avatars.com/api/?name=User"} className="w-full h-full object-cover" alt="Bio" />
             </motion.div>
          </div>
        </header>

        <div className="flex-1 p-12 overflow-y-auto relative bg-[#F0F4F8]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={tab} 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* --- 📦 TAB: INVENTORY --- */}
              {tab === "inventory" && (
                <div className="space-y-12">
                  <div className="flex flex-col md:flex-row gap-8 justify-between items-center bg-white/80 border border-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-300/20 backdrop-blur-md">
                    <div className="relative w-full md:w-[600px]">
                      <Search size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search Fleet Registry..." 
                        className="w-full bg-[#E2E8F0]/50 border border-slate-300 rounded-2xl py-5 pl-16 pr-8 text-lg font-medium focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-6 w-full md:w-auto">
                      <select 
                        className="flex-1 md:w-64 bg-white border border-slate-300 rounded-2xl p-5 text-sm font-bold uppercase outline-none focus:border-indigo-500 text-slate-600 appearance-none cursor-pointer shadow-sm"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                      >
                        <option value="departure">Filter: Chronology</option>
                        <option value="price">Filter: Asset Value</option>
                      </select>
                      <button onClick={() => navigate("/create-listing")} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold text-sm uppercase flex items-center gap-4 hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
                        <Plus size={20} /> Enroll Asset
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <th className="p-10 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">Vessel Identity</th>
                          <th className="p-10 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">Vector Path</th>
                          <th className="p-10 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">Sync Status</th>
                          <th className="p-10 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFlights.length > 0 ? filteredFlights.map((f, i) => (
                          <InventoryRow key={f.id} f={f} index={i} onView={() => navigate(`/product/${f.id}`)} onManage={() => handleManageOps(f)} />
                        )) : (
                          <tr><td colSpan="4" className="p-40 text-center text-slate-300 font-bold text-2xl tracking-tighter">No active vessels detected</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- 🚀 TAB: TELEMETRY --- */}
              {tab === "flights" && (
                <motion.div 
                  initial="hidden" animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                >
                  {filteredFlights.map(f => (
                    <FleetCard key={f.id} f={f} onClick={() => navigate(`/product/${f.id}`)} onManage={() => handleManageOps(f)} />
                  ))}
                </motion.div>
              )}

              {/* --- MODULES --- */}
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-indigo-50/50 transition-all group"
    >
      <td className="p-10">
        <div className="flex items-center gap-8">
          <div className="w-20 h-20 rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm group-hover:shadow-indigo-200 transition-all duration-500">
            <img src={f.images?.[0]?.url || "/placeholder.jpg"} className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700" alt="ship" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{f.airline}</p>
            <p className="text-xs text-indigo-500 font-extrabold uppercase mt-1 tracking-widest">{f.aircraftModel || "SIG_GEN_4"}</p>
          </div>
        </div>
      </td>
      <td className="p-10">
        <div className="flex items-center gap-6 text-xl font-bold text-slate-700">
          <span>{f.source}</span>
          <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
          <span>{f.destination}</span>
        </div>
        <p className="text-xs text-slate-400 mt-2 font-bold uppercase">
            ETD: {new Date(f.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </td>
      <td className="p-10">
        <div className="space-y-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase border tracking-widest ${
            isAirborne ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-400 border-slate-200"
          }`}>
            {isAirborne ? "In Transit" : "Ground"}
          </span>
          <div className="space-y-2 w-40">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: `${f.fuelLoad || 100}%` }} className="h-full bg-indigo-600" />
            </div>
          </div>
        </div>
      </td>
      <td className="p-10 text-right">
        <div className="flex justify-end gap-5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
            <button onClick={onView} className="p-5 bg-white hover:bg-indigo-600 hover:text-white rounded-2xl shadow-xl border border-slate-100 transition-all">
                <ArrowUpRight size={24} />
            </button>
            <button onClick={onManage} className="p-5 bg-white hover:bg-indigo-600 hover:text-white rounded-2xl shadow-xl border border-slate-100 transition-all">
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
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        whileHover={{ y: -12 }}
        className="bg-white border border-slate-200 p-8 rounded-[3rem] hover:shadow-2xl transition-all duration-500 group flex flex-col justify-between h-full relative overflow-hidden shadow-xl shadow-slate-300/10"
      >
        <div className="cursor-pointer" onClick={onClick}>
            <div className="overflow-hidden rounded-[2rem] mb-8 aspect-video bg-slate-100">
                <img src={f.images?.[0]?.url || "/placeholder.jpg"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" alt="vessel" />
            </div>
            <h4 className="text-3xl font-bold text-slate-900 tracking-tight leading-none mb-4">{f.airline}</h4>
            <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>{f.source} → {f.destination}</span>
                <span className="text-indigo-600 text-base">${f.price}</span>
            </div>
        </div>
        <button onClick={onManage} className="mt-10 w-full bg-slate-900 hover:bg-indigo-600 text-white py-6 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all shadow-lg">
            Manage Registry
        </button>
      </motion.div>
    );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-6 p-5 rounded-2xl transition-all duration-500 ${active ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-300 scale-105" : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"}`}>
      {icon}
      <span className="font-bold text-base tracking-tight uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">{label}</span>
    </button>
  );
}

function StatusNode({ label, value, color, icon }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <span className={`font-black text-xl tracking-tighter ${color}`}>{value}</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="h-screen bg-[#F3F4F6] flex flex-col items-center justify-center">
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} 
        className="w-20 h-20 border-8 border-slate-200 border-t-indigo-600 rounded-full mb-10 shadow-2xl bg-white" 
      />
      <p className="text-base font-bold text-slate-900 uppercase tracking-[0.6em] animate-pulse">Syncing_Mainframe</p>
    </div>
  );
}