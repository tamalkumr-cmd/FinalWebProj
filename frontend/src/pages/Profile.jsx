import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Briefcase, Hash, RefreshCw, 
  Fingerprint, UploadCloud, ShieldCheck, 
  ChevronRight, BadgeCheck, Terminal
} from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState({ 
    name: '', 
    empId: '', 
    designation: 'FLIGHT_OFFICER', 
    bio: '', 
    photoUrl: null 
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Apple System Font Stack
  const fontStack = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif";

  useEffect(() => {
    api.getProfile().then(data => {
      if (data) {
        setProfile({
          ...data,
          name: data.name || '',
          empId: data.empId || '',
          bio: data.bio || '',
          designation: data.designation || 'FLIGHT_OFFICER',
          photoUrl: data.photoUrl || null
        });
      }
      setLoading(false);
    }).catch((err) => {
      console.error("LOAD_ERROR", err);
      setLoading(false);
    });
  }, []);

  const handlePhotoIngest = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await api.uploadPhoto(formData); 
      if (response.url) {
        setProfile(prev => ({ ...prev, photoUrl: response.url }));
      }
    } catch (err) {
      console.error("UPLOAD_ERROR", err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile(profile);
      alert("BIOMETRIC_DATA_STABILIZED");
    } catch (err) {
      console.error("SYNC_ERROR", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F2F2F7]">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full mb-4"
      />
      <div className="text-slate-900 font-bold tracking-widest uppercase text-[10px]">
        Syncing_Personnel_Node...
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: fontStack }} className="max-w-5xl mx-auto p-6 md:p-12 text-slate-900 selection:bg-indigo-500 selection:text-white">
      
      {/* 💳 HEADER & ID CARD INTERFACE */}
      <header className="flex flex-col md:flex-row items-center gap-10 mb-16 pb-12 border-b border-slate-200">
        <div 
          className="relative w-44 h-44 rounded-[2.5rem] bg-white border-4 border-white shadow-2xl overflow-hidden group cursor-pointer"
          onClick={() => !uploading && fileInputRef.current.click()}
        >
          {profile.photoUrl ? (
            <img src={profile.photoUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Profile" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
               <User size={60} className="text-slate-300" />
            </div>
          )}
          
          {/* Active Scan Line */}
          <motion.div 
            animate={{ top: ["-5%", "105%"] }} 
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 right-0 h-[3px] bg-indigo-500 shadow-[0_0_20px_#4f46e5] z-20 opacity-50"
          />

          <div className={`absolute inset-0 bg-indigo-900/40 backdrop-blur-sm flex flex-col items-center justify-center gap-2 transition-all duration-500 ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {uploading ? <RefreshCw className="animate-spin text-white" /> : <UploadCloud className="text-white" size={32} />}
            <span className="text-[10px] font-extrabold text-white uppercase tracking-widest">{uploading ? 'Syncing...' : 'Update_Visual'}</span>
          </div>
          
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handlePhotoIngest} />
        </div>

        <div className="text-center md:text-left space-y-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="px-4 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200">Active_Duty</span>
            <span className="px-4 py-1 bg-white border border-slate-200 text-slate-400 text-[10px] font-black rounded-full uppercase tracking-widest">Clearance_B9</span>
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 italic uppercase leading-none">
            Personnel_<span className="text-indigo-600">Dossier</span>
          </h1>
          <p className="text-slate-400 text-sm font-bold tracking-[0.2em] uppercase flex items-center justify-center md:justify-start gap-3">
            <Terminal size={14} /> Master_Record // {profile.id?.slice(-12).toUpperCase() || 'UNINITIALIZED'}
          </p>
        </div>
      </header>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* INPUT: CALLSIGN */}
        <div className="space-y-3 group">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Identity_Callsign</label>
          <div className="relative">
             <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
             <input 
               className="w-full bg-white border border-slate-200 p-6 pl-14 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-bold text-xl text-slate-900" 
               value={profile.name} 
               placeholder="NAME_UNSET"
               onChange={(e) => setProfile({...profile, name: e.target.value})} 
             />
          </div>
        </div>

        {/* INPUT: EMP ID */}
        <div className="space-y-3 group">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Registry_Serial</label>
          <div className="relative">
             <Hash size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
             <input 
               className="w-full bg-white border border-slate-200 p-6 pl-14 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-bold text-xl text-slate-900 placeholder:text-slate-200" 
               value={profile.empId} 
               placeholder="E_XXXX_00"
               onChange={(e) => setProfile({...profile, empId: e.target.value})} 
             />
          </div>
        </div>

        {/* TEXTAREA: BIO */}
        <div className="md:col-span-2 space-y-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mission_Experience_Log</label>
          <div className="relative">
             <textarea 
               className="w-full bg-white border border-slate-200 p-8 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all font-bold text-lg text-slate-900 h-48 resize-none leading-relaxed placeholder:text-slate-200"
               value={profile.bio}
               onChange={(e) => setProfile({...profile, bio: e.target.value})}
               placeholder="RECORDS_EMPTY: INPUT_FLIGHT_HOURS_AND_MISSION_LOGS..."
             />
             <div className="absolute bottom-6 right-8 opacity-10">
               <ShieldCheck size={60} />
             </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button 
          type="submit"
          disabled={saving || uploading}
          className="md:col-span-2 relative group overflow-hidden bg-slate-900 hover:bg-indigo-600 text-white p-8 rounded-[2rem] font-bold uppercase text-lg tracking-[0.4em] transition-all duration-500 shadow-2xl shadow-indigo-200 disabled:opacity-50 active:scale-[0.98]"
        >
          <div className="flex items-center justify-center gap-4 relative z-10">
            {saving ? <RefreshCw className="animate-spin" size={24} /> : <BadgeCheck size={24} />}
            {saving ? "Uplinking_To_Core..." : "Authorize_Dossier_Update"}
          </div>
          
          {/* Animated Background Overlay */}
          <motion.div 
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-white/10 skew-x-12"
          />
        </button>
      </form>

      {/* FOOTER HUD */}
      <footer className="mt-16 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">
          <Fingerprint size={16} /> Data_Encryption: RSA_4096_Locked
        </div>
        <div className="flex gap-10">
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">Status: Synchronized</span>
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Node: B9_ALFA</span>
        </div>
      </footer>
    </div>
  );
}