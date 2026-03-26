import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { motion } from "framer-motion";
import { 
  Plane, Globe, ArrowRight, 
  Upload, Activity, Cloud, Navigation,
  Cpu, User, Zap, Database, Terminal, ShieldAlert,
  ChevronLeft, Settings, Info
} from "lucide-react";
import { FLEET_MODELS } from "../constants/fleet";

export default function CreateListing() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    airline: "", 
    manufacturer: "BOEING", 
    aircraftModel: "737-MAX 8", 
    engineType: "CFM LEAP-1B",
    vesselType: "PASSENGER",
    fuelLoad: 15000,
    seatsCount: 189,
    pilotName: "",
    pilotBio: "",
    source: "", 
    destination: "",
    sourceLat: "", 
    sourceLng: "", 
    destLat: "", 
    destLng: "",
    departure: "", 
    arrival: ""
  });

  const [coverImage, setCoverImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManufacturerChange = (brand) => {
    const firstModel = FLEET_MODELS[brand][0];
    setFormData({
      ...formData,
      manufacturer: brand,
      aircraftModel: firstModel.model,
      engineType: firstModel.engine,
      seatsCount: firstModel.cap
    });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key.includes('Lat') || key.includes('Lng') || key === 'fuelLoad' || key === 'seatsCount') {
            data.append(key, parseFloat(formData[key]) || 0);
        } else {
            data.append(key, formData[key]);
        }
      });
      if (coverImage) data.append("image", coverImage);
      await api.createListing(data);
      navigate("/dashboard");
    } catch (err) {
      console.error("DEPLOYMENT_SYNC_FAILURE", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-mono selection:bg-sky-500 selection:text-white p-4 md:p-8">
      {/* --- CLOUD BACKGROUND DECOR --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-200 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-slate-200">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-sky-600 transition-colors text-[9px] font-black uppercase tracking-widest mb-6">
               <ChevronLeft size={12} /> Return_To_Terminal
            </button>
            <h1 className="text-6xl font-black italic tracking-tighter uppercase leading-none text-slate-900">
              Initialize_<span className="text-slate-300">Manifest</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden lg:block">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol: ICAO_V4</p>
              <p className="text-[10px] font-black text-sky-600 uppercase italic">Status: Cloud_Sync_Active</p>
            </div>
            <button onClick={() => navigate("/dashboard")} className="px-8 py-3 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
               [ Abort_Uplink ]
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- LEFT: HARDWARE & SIGNATURE --- */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* 📸 VISUAL SIGNATURE */}
            <div className="space-y-6">
              <SectionLabel label="Vessel_Signature" icon={<Terminal size={12}/>} />
              <div className="relative aspect-video rounded-[2.5rem] border border-slate-200 bg-white shadow-sm flex flex-col items-center justify-center overflow-hidden group hover:border-sky-300 transition-all duration-700">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt="Vessel Preview" />
                ) : (
                  <>
                    <Upload size={32} strokeWidth={1} className="text-slate-300 group-hover:text-sky-500 transition-colors" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 mt-4 group-hover:text-sky-400">Uplink_Profile_Image</span>
                  </>
                )}
                <input type="file" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            {/* ⚙️ HARDWARE CONFIG */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-10 space-y-10 shadow-sm">
              <SectionLabel label="Hardware_Dossier" icon={<Cpu size={12}/>} />
              <div className="flex gap-4">
                {['BOEING', 'AIRBUS'].map(brand => (
                  <button 
                    key={brand} type="button"
                    onClick={() => handleManufacturerChange(brand)}
                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] border transition-all duration-500 ${formData.manufacturer === brand ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
                  >
                    {brand}_SYSTEMS
                  </button>
                ))}
              </div>
              <div className="space-y-8">
                <SelectField 
                  label="Vessel_Model" 
                  value={formData.aircraftModel}
                  onChange={(e) => {
                     const selected = FLEET_MODELS[formData.manufacturer].find(m => m.model === e.target.value);
                     setFormData({...formData, aircraftModel: selected.model, engineType: selected.engine, seatsCount: selected.cap});
                  }}
                  options={FLEET_MODELS[formData.manufacturer].map(m => m.model)}
                />
                <InputField label="Assigned_Engine" value={formData.engineType} readOnly icon={<Zap size={14}/>} />
              </div>
            </div>

            {/* 👤 CREW MANIFEST */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-10 space-y-10 shadow-sm">
              <SectionLabel label="Command_Staff" icon={<User size={12}/>} />
              <InputField label="Pilot_In_Command" placeholder="INPUT_PIC_NAME" onChange={e => setFormData({...formData, pilotName: e.target.value})} required />
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic ml-2">Experience_Logs</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs text-slate-900 focus:border-sky-300 focus:bg-white outline-none transition-all placeholder:text-slate-300 min-h-[100px] font-bold italic"
                  placeholder="INPUT_FLIGHT_HOURS_AND_RANK..."
                  onChange={e => setFormData({...formData, pilotBio: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* --- RIGHT: MISSION PARAMETERS --- */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-12 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <Globe size={300} className="text-slate-900" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                <InputField label="Operator_Callsign" icon={<Plane size={14}/>} placeholder="SKY-VECTOR-9" onChange={e => setFormData({...formData, airline: e.target.value})} required />
                <SelectField 
                   label="Mission_Category" 
                   value={formData.vesselType}
                   onChange={e => setFormData({...formData, vesselType: e.target.value})}
                   options={["PASSENGER", "CARGO"]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                {/* ORIGIN */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4 text-slate-300 italic"><Navigation size={14} /> <span className="text-[10px] uppercase font-black tracking-widest">Departure_Sector</span></div>
                  <InputField label="Station_ID" placeholder="MUMBAI_HUB" onChange={e => setFormData({...formData, source: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-6">
                    <InputField label="Vector_Lat" placeholder="19.07" onChange={e => setFormData({...formData, sourceLat: e.target.value})} required />
                    <InputField label="Vector_Lng" placeholder="72.87" onChange={e => setFormData({...formData, sourceLng: e.target.value})} required />
                  </div>
                </div>

                {/* TARGET */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4 text-slate-300 italic"><ShieldAlert size={14} /> <span className="text-[10px] uppercase font-black tracking-widest">Arrival_Sector</span></div>
                  <InputField label="Terminal_ID" placeholder="DELHI_INTL" onChange={e => setFormData({...formData, destination: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-6">
                    <InputField label="Vector_Lat" placeholder="28.61" onChange={e => setFormData({...formData, destLat: e.target.value})} required />
                    <InputField label="Vector_Lng" placeholder="77.20" onChange={e => setFormData({...formData, destLng: e.target.value})} required />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20 pt-16 border-t border-slate-100">
                <InputField label="Fuel_Manifest (L)" type="number" onChange={e => setFormData({...formData, fuelLoad: e.target.value})} required />
                <InputField label="Departure_Chrono" type="datetime-local" onChange={e => setFormData({...formData, departure: e.target.value})} required />
                <InputField label="Arrival_Chrono" type="datetime-local" onChange={e => setFormData({...formData, arrival: e.target.value})} required />
              </div>
            </div>

            {/* --- ACTION BAR --- */}
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 flex items-center gap-4 px-10 py-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                    <Info size={16} className="text-sky-500" />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                        Notice: Mission data will be synchronized with global ATC relays upon commitment.
                    </p>
                </div>
                <button 
                  disabled={isSubmitting} 
                  className="w-full md:w-auto px-16 h-28 bg-sky-500 text-white rounded-[2.5rem] flex items-center justify-center gap-6 font-black uppercase italic group hover:bg-slate-900 transition-all active:scale-95 shadow-xl shadow-sky-500/20"
                >
                  {isSubmitting ? (
                    <Activity className="animate-spin" />
                  ) : (
                    <>
                      <span className="text-xl">Commit_Briefing</span> 
                      <ArrowRight size={24} className="group-hover:translate-x-4 transition-transform duration-500" />
                    </>
                  )}
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- LIGHT TACTICAL COMPONENTS ---

const SectionLabel = ({ label, icon }) => (
  <div className="flex items-center gap-4 mb-4">
    <div className="p-2 border border-slate-100 rounded-lg bg-slate-50 text-slate-400">{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 italic">{label}</span>
  </div>
);

const InputField = ({ label, icon, ...props }) => (
  <div className="flex flex-col gap-3 group">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic ml-2 group-focus-within:text-sky-600 transition-colors">
      {icon} {label}
    </label>
    <input 
      {...props} 
      className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs text-slate-900 focus:border-sky-300 focus:bg-white outline-none transition-all placeholder:text-slate-200 italic font-bold"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-3">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic ml-2">{label}</label>
    <select 
      value={value} 
      onChange={onChange}
      className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs text-slate-900 focus:border-sky-300 focus:bg-white outline-none transition-all cursor-pointer font-bold italic"
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);