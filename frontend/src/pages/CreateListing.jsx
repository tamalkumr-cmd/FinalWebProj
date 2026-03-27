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
    <div className="min-h-screen bg-[#F0F7FF] text-[#001F3F] font-sans selection:bg-orange-500 selection:text-white p-4 md:p-8">
      
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-white/50">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-400 hover:text-[#007BFF] transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-6">
               <ChevronLeft size={14} /> Return_To_Terminal
            </button>
            <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none text-[#001F3F]">
              Initialize_<span className="text-blue-200">Manifest</span>
            </h1>
          </motion.div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden lg:block">
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Protocol: ICAO_V4</p>
              <p className="text-[11px] font-black text-[#007BFF] uppercase italic">Status: <span className="animate-pulse">Cloud_Sync_Active</span></p>
            </div>
            <button onClick={() => navigate("/dashboard")} className="px-8 py-4 bg-white border border-white text-blue-300 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-red-500 transition-all shadow-xl shadow-blue-900/5">
               [ Abort_Uplink ]
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* --- LEFT: HARDWARE & SIGNATURE --- */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* 📸 VISUAL SIGNATURE */}
            <div className="space-y-6">
              <SectionLabel label="Vessel_Signature" icon={<Terminal size={14}/>} />
              <div className="relative aspect-[4/5] rounded-[3rem] border-8 border-white bg-white shadow-2xl flex flex-col items-center justify-center overflow-hidden group cursor-pointer transition-all duration-700">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt="Vessel Preview" />
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <Upload size={32} strokeWidth={2} className="text-[#007BFF]" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-200">Uplink_Profile_Image</span>
                  </div>
                )}
                <input type="file" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            {/* ⚙️ HARDWARE CONFIG */}
            <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[3rem] p-10 space-y-10 shadow-xl shadow-blue-900/5">
              <SectionLabel label="Hardware_Dossier" icon={<Cpu size={14}/>} />
              <div className="flex gap-4">
                {['BOEING', 'AIRBUS'].map(brand => (
                  <button 
                    key={brand} type="button"
                    onClick={() => handleManufacturerChange(brand)}
                    className={`flex-1 py-5 rounded-2xl font-black text-[11px] border transition-all duration-500 ${formData.manufacturer === brand ? 'bg-[#001F3F] text-white border-[#001F3F] shadow-2xl shadow-blue-900/40 scale-105' : 'bg-white text-blue-200 border-blue-50 hover:border-blue-100'}`}
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
            <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[3rem] p-10 space-y-10 shadow-xl shadow-blue-900/5">
              <SectionLabel label="Command_Staff" icon={<User size={14}/>} />
              <InputField label="Pilot_In_Command" placeholder="INPUT_PIC_NAME" onChange={e => setFormData({...formData, pilotName: e.target.value})} required />
              <div className="space-y-3">
                <label className="text-[12px] font-black text-[#003366] uppercase tracking-widest italic ml-2">Experience_Logs</label>
                <textarea 
                  className="w-full bg-[#F4F9FF] border border-blue-100 rounded-2xl p-6 text-sm text-[#001F3F] focus:ring-4 focus:ring-blue-50 outline-none transition-all placeholder:text-blue-100 min-h-[120px] font-bold italic"
                  placeholder="INPUT_FLIGHT_HOURS_AND_RANK..."
                  onChange={e => setFormData({...formData, pilotBio: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* --- RIGHT: MISSION PARAMETERS --- */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[4rem] p-12 relative overflow-hidden shadow-2xl shadow-blue-900/5">
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <Globe size={400} className="text-[#001F3F]" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16 relative z-10">
                <InputField label="Operator_Callsign" icon={<Plane size={16}/>} placeholder="SKY-VECTOR-9" onChange={e => setFormData({...formData, airline: e.target.value})} required />
                <SelectField 
                   label="Mission_Category" 
                   value={formData.vesselType}
                   onChange={e => setFormData({...formData, vesselType: e.target.value})}
                   options={["PASSENGER", "CARGO"]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-20 relative z-10">
                {/* ORIGIN */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4 text-blue-300 italic"><Navigation size={16} /> <span className="text-[12px] uppercase font-black tracking-[0.3em]">Departure_Sector</span></div>
                  <InputField label="Station_ID" placeholder="MUMBAI_HUB" onChange={e => setFormData({...formData, source: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-6">
                    <InputField label="Vector_Lat" placeholder="19.07" onChange={e => setFormData({...formData, sourceLat: e.target.value})} required />
                    <InputField label="Vector_Lng" placeholder="72.87" onChange={e => setFormData({...formData, sourceLng: e.target.value})} required />
                  </div>
                </div>

                {/* TARGET */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4 text-blue-300 italic"><ShieldAlert size={16} /> <span className="text-[12px] uppercase font-black tracking-[0.3em]">Arrival_Sector</span></div>
                  <InputField label="Terminal_ID" placeholder="DELHI_INTL" onChange={e => setFormData({...formData, destination: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-6">
                    <InputField label="Vector_Lat" placeholder="28.61" onChange={e => setFormData({...formData, destLat: e.target.value})} required />
                    <InputField label="Vector_Lng" placeholder="77.20" onChange={e => setFormData({...formData, destLng: e.target.value})} required />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20 pt-16 border-t border-blue-50 relative z-10">
                <InputField label="Fuel_Manifest (L)" type="number" onChange={e => setFormData({...formData, fuelLoad: e.target.value})} required />
                <InputField label="Departure_Chrono" type="datetime-local" onChange={e => setFormData({...formData, departure: e.target.value})} required />
                <InputField label="Arrival_Chrono" type="datetime-local" onChange={e => setFormData({...formData, arrival: e.target.value})} required />
              </div>
            </div>

            {/* --- ACTION BAR --- */}
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 flex items-center gap-6 px-10 py-10 bg-white border border-white rounded-[3rem] shadow-xl shadow-blue-900/5">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Info size={20} className="text-[#007BFF]" />
                    </div>
                    <p className="text-[11px] font-black text-blue-300 uppercase tracking-widest leading-relaxed">
                        Notice: Mission data will be synchronized with global ATC relays upon commitment. Ensure hardware integrity before uplink.
                    </p>
                </div>
                <button 
                  disabled={isSubmitting} 
                  className="w-full md:w-auto px-16 h-32 bg-[#FF7F50] text-white rounded-[3rem] flex items-center justify-center gap-8 font-black uppercase italic group hover:bg-[#E06940] transition-all active:scale-95 shadow-2xl shadow-orange-500/30"
                >
                  {isSubmitting ? (
                    <Activity className="animate-spin" size={32} />
                  ) : (
                    <>
                      <span className="text-2xl tracking-tighter">Commit_Briefing</span> 
                      <ArrowRight size={32} className="group-hover:translate-x-4 transition-transform duration-500" />
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

// --- COMMAND TACTICAL COMPONENTS ---

const SectionLabel = ({ label, icon }) => (
  <div className="flex items-center gap-4 mb-4">
    <div className="p-3 border border-blue-50 rounded-2xl bg-white text-[#007BFF] shadow-sm">{icon}</div>
    <span className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-300 italic">{label}</span>
  </div>
);

const InputField = ({ label, icon, ...props }) => (
  <div className="flex flex-col gap-4 group">
    <label className="text-[12px] font-black text-[#003366] uppercase tracking-widest italic ml-2 group-focus-within:text-[#007BFF] transition-colors flex items-center gap-2">
      {icon} {label}
    </label>
    <input 
      {...props} 
      className="bg-[#F4F9FF] border border-blue-100 rounded-2xl p-6 text-sm text-[#001F3F] focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all placeholder:text-blue-100 italic font-black shadow-inner"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-4">
    <label className="text-[12px] font-black text-[#003366] uppercase tracking-widest italic ml-2">{label}</label>
    <div className="relative">
        <select 
          value={value} 
          onChange={onChange}
          className="w-full bg-[#F4F9FF] border border-blue-100 rounded-2xl p-6 text-sm text-[#001F3F] focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all cursor-pointer font-black italic shadow-inner appearance-none"
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-200">
            <Settings size={16} />
        </div>
    </div>
  </div>
);