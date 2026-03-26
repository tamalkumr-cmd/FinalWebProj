import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { motion } from "framer-motion";
import { 
  Plane, Globe, ArrowRight, 
  Upload, Activity, Cloud, Navigation,
  Cpu, User, Zap, Database
} from "lucide-react";
import { FLEET_MODELS } from "../constants/fleet";

export default function CreateListing() {
  const navigate = useNavigate();
  
  // ✈️ ADVANCED OPERATOR STATE
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

  // Sync Hardware Selection
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
      
      console.log("LOG: Initiating_Fleet_Deployment...");
      await api.createListing(data);
      navigate("/dashboard");
    } catch (err) {
      console.error("DEPLOYMENT_SYNC_FAILURE", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-mono selection:bg-cyan-500 selection:text-black">
      
      {/* HUD DECOR */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[9px] font-black text-cyan-500 tracking-[0.4em] uppercase">
                Status: Config_Mode
              </div>
              <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Fleet_Registry_v2.4</div>
            </div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
              Initialize_<span className="text-cyan-500">Mission</span>
            </h1>
          </motion.div>

          <button onClick={() => navigate("/dashboard")} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest border border-white/5 px-6 py-3 rounded-2xl bg-white/5 backdrop-blur-md transition-all">
            [ Abort_Mission ]
          </button>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: HARDWARE & CREW */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* VIZUAL SIGNATURE */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
              <SectionLabel label="Visual_ID" icon={<Cloud size={12}/>} />
              <div className="relative aspect-video rounded-3xl border-2 border-dashed border-white/10 bg-black/40 flex items-center justify-center overflow-hidden group transition-all hover:border-cyan-500/40">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" alt="Vessel Preview" />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-slate-600">
                    <Upload size={30} strokeWidth={1} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Upload_Profile_Image</span>
                  </div>
                )}
                <input type="file" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            {/* HARDWARE SELECTION */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 backdrop-blur-xl">
              <SectionLabel label="Hardware_Config" icon={<Cpu size={12}/>} />
              <div className="grid grid-cols-2 gap-4">
                {['BOEING', 'AIRBUS'].map(brand => (
                  <button 
                    key={brand} type="button"
                    onClick={() => handleManufacturerChange(brand)}
                    className={`py-3 rounded-xl font-black text-[9px] border transition-all ${formData.manufacturer === brand ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-white/5 text-slate-500 border-white/5'}`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vessel_Model</label>
                  <select 
                    className="bg-black border-b border-white/10 py-2 text-white font-bold focus:outline-none focus:border-cyan-500"
                    value={formData.aircraftModel}
                    onChange={(e) => {
                       const selected = FLEET_MODELS[formData.manufacturer].find(m => m.model === e.target.value);
                       setFormData({...formData, aircraftModel: selected.model, engineType: selected.engine, seatsCount: selected.cap});
                    }}
                  >
                    {FLEET_MODELS[formData.manufacturer].map(m => <option key={m.model} value={m.model}>{m.model}</option>)}
                  </select>
                </div>
                <InputField label="Assigned_Engine" value={formData.engineType} readOnly icon={<Zap size={14}/>} />
              </div>
            </div>

            {/* CREW DATA */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 backdrop-blur-xl">
              <SectionLabel label="Crew_Manifest" icon={<User size={12}/>} />
              <InputField label="Pilot_In_Command" placeholder="Capt. Name" onChange={e => setFormData({...formData, pilotName: e.target.value})} required />
              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pilot_Brief</label>
                <textarea 
                  className="bg-transparent border-b border-white/10 py-2 text-xs text-white font-bold focus:outline-none focus:border-cyan-500 min-h-[60px]"
                  placeholder="Experience/Bio..."
                  onChange={e => setFormData({...formData, pilotBio: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: MISSION PARAMETERS */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                <InputField label="Operator_Callsign" icon={<Plane size={14}/>} placeholder="SKY-VECTOR-9" onChange={e => setFormData({...formData, airline: e.target.value})} required />
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mission_Type</label>
                  <select 
                    className="bg-black border-b border-white/10 py-2 text-white font-bold focus:outline-none"
                    onChange={e => setFormData({...formData, vesselType: e.target.value})}
                  >
                    <option value="PASSENGER">PASSENGER_UNIT</option>
                    <option value="CARGO">FREIGHT_CARGO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                {/* LOGISTICS */}
                <div className="space-y-8">
                  <InputField label="Origin_Station" placeholder="MUMBAI_HUB" onChange={e => setFormData({...formData, source: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-6">
                    <InputField label="Lat" placeholder="19.07" onChange={e => setFormData({...formData, sourceLat: e.target.value})} required />
                    <InputField label="Lng" placeholder="72.87" onChange={e => setFormData({...formData, sourceLng: e.target.value})} required />
                  </div>
                </div>

                <div className="space-y-8">
                  <InputField label="Target_Terminal" placeholder="DELHI_INTL" onChange={e => setFormData({...formData, destination: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-6">
                    <InputField label="Lat" placeholder="28.61" onChange={e => setFormData({...formData, destLat: e.target.value})} required />
                    <InputField label="Lng" placeholder="77.20" onChange={e => setFormData({...formData, destLng: e.target.value})} required />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/5">
                <InputField label="Fuel_Load (L)" type="number" onChange={e => setFormData({...formData, fuelLoad: e.target.value})} required />
                <InputField label="Departure" type="datetime-local" onChange={e => setFormData({...formData, departure: e.target.value})} required />
                <InputField label="Arrival" type="datetime-local" onChange={e => setFormData({...formData, arrival: e.target.value})} required />
              </div>
            </div>

            {/* SUBMIT */}
            <button disabled={isSubmitting} className="w-full h-24 bg-cyan-500 rounded-[2rem] flex items-center justify-center gap-4 text-black font-black uppercase italic group hover:bg-white transition-all shadow-[0_0_40px_rgba(6,182,212,0.2)]">
              {isSubmitting ? <Activity className="animate-spin" /> : <><span className="text-xl">Commit_Mission_Briefing</span> <ArrowRight className="group-hover:translate-x-2 transition-transform" /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const SectionLabel = ({ label, icon }) => (
  <div className="flex items-center gap-3 mb-6 opacity-40">
    {icon}
    <span className="text-[9px] font-black uppercase tracking-[0.4em]">{label}</span>
  </div>
);

const InputField = ({ label, icon, ...props }) => (
  <div className="flex flex-col gap-2 group">
    <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2 group-focus-within:text-cyan-400 transition-colors">
      {icon} {label}
    </label>
    <input 
      {...props} 
      className="bg-transparent border-b border-white/10 py-2 text-xs text-white font-bold focus:outline-none focus:border-cyan-500 transition-all placeholder:text-slate-800"
    />
  </div>
);