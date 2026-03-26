import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { motion } from 'framer-motion';
import { 
  User, Briefcase, Hash, RefreshCw, 
  Fingerprint, UploadCloud, AlertTriangle 
} from 'lucide-react';

export default function Profile() {
  // 🛡️ Initialize with empty strings to keep inputs "controlled"
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

  // 📸 HANDLE PHOTO UPLOAD TO CLOUDINARY
  const handlePhotoIngest = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file); // Matches upload.single("photo") in backend

    try {
      const response = await api.uploadPhoto(formData); 
      if (response.url) {
        setProfile(prev => ({ ...prev, photoUrl: response.url }));
        console.log("VISUAL_SYNC_COMPLETE");
      }
    } catch (err) {
      console.error("UPLOAD_ERROR", err);
      alert("PHOTO_UPLOAD_FAILED: Check Cloudinary Config");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile(profile);
      alert("CORE_SYNC_COMPLETE");
    } catch (err) {
      console.error("SYNC_ERROR", err);
      alert("SYNC_FAILURE: Core rejected changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617] font-mono">
      <div className="text-cyan-500 animate-pulse tracking-[0.5em] uppercase text-xs">
        Decrypting_Bio_Data...
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-10 font-mono text-white selection:bg-cyan-500 selection:text-black">
      
      {/* 🚀 HEADER & BIOMETRIC VISUAL */}
      <div className="flex items-center gap-8 mb-12 pb-8 border-b border-white/5">
        <div 
          className="relative w-32 h-32 rounded-3xl bg-black border-2 border-white/10 overflow-hidden group cursor-pointer"
          onClick={() => !uploading && fileInputRef.current.click()}
        >
          {profile.photoUrl ? (
            <img src={profile.photoUrl} className="w-full h-full object-cover" alt="Profile" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900/50">
               <User size={40} className="text-slate-700" />
            </div>
          )}
          
          {/* Scanning Animation */}
          <motion.div 
            animate={{ top: ["-5%", "105%"] }} 
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_15px_cyan] z-20"
          />

          <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 transition-opacity ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {uploading ? <RefreshCw className="animate-spin text-cyan-400" /> : <UploadCloud className="text-white" />}
            <span className="text-[8px] font-black uppercase">{uploading ? 'Uploading...' : 'Update_Visual'}</span>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            hidden 
            accept="image/*" 
            onChange={handlePhotoIngest} 
          />
        </div>

        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Personnel_Dossier</h1>
          <p className="text-cyan-500 text-[10px] font-bold tracking-[0.4em] uppercase mt-2">
            Security_Clearance: B9 // UID: {profile.id?.slice(0, 8) || 'PENDING'}
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Callsign</label>
          <div className="relative">
             <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
             <input 
               className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl outline-none focus:border-cyan-500 transition-all font-bold text-sm" 
               value={profile.name} 
               onChange={(e) => setProfile({...profile, name: e.target.value})} 
             />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Employee_ID</label>
          <div className="relative">
             <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
             <input 
               className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl outline-none focus:border-cyan-500 transition-all font-bold text-sm" 
               value={profile.empId} 
               onChange={(e) => setProfile({...profile, empId: e.target.value})} 
             />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Personnel_Bio</label>
          <textarea 
             className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-cyan-500 h-32 resize-none font-bold text-sm"
             value={profile.bio}
             onChange={(e) => setProfile({...profile, bio: e.target.value})}
             placeholder="ENTER_MISSION_EXPERIENCE..."
          />
        </div>

        <button 
          type="submit"
          disabled={saving || uploading}
          className="md:col-span-2 bg-cyan-600 hover:bg-cyan-500 text-black p-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(8,145,170,0.2)] disabled:opacity-50"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : <Fingerprint size={18} />}
          {saving ? "SYNCING_WITH_CORE..." : "COMMIT_CHANGES_TO_DOSSIER"}
        </button>
      </form>
    </div>
  );
}