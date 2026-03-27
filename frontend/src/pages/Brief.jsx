import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { sendBrief } from "../api";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Send, 
  Activity, 
  User, 
  Mail, 
  FileText,
  ShieldCheck,
  Globe
} from "lucide-react";

export default function Brief() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const plan = params.get("plan");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idea, setIdea] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("SYNCING_DATA...");

    try {
      await sendBrief({ name, email, idea, plan });
      setStatus("✅ MISSION_DEBRIEF_SUCCESSFUL");
      setName("");
      setEmail("");
      setIdea("");
      setIsSubmitting(false);
    } catch (err) {
      setStatus("❌ UPLINK_FAILED_RETRY");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-[#001F3F] font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-10 border-b border-white/50">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-blue-400 hover:text-[#007BFF] transition-colors text-[10px] font-black uppercase tracking-[0.3em] mb-6"
            >
               <ChevronLeft size={14} /> Return_To_Terminal
            </button>
            <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none text-[#001F3F]">
              Project_<span className="text-blue-200">Brief</span>
            </h1>
          </motion.div>

          <div className="text-right hidden lg:block">
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Sector: Intel_Gathering</p>
            <p className="text-[11px] font-black text-[#007BFF] uppercase italic">
              Plan_Tier: <span className="text-[#001F3F]">{plan || "Standard"}</span>
            </p>
          </div>
        </header>

        {/* --- FORM CONTAINER --- */}
        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Side: Status & Security Card */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[3rem] p-10 shadow-xl shadow-blue-900/5">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 border border-blue-50 rounded-2xl bg-white text-[#007BFF] shadow-sm">
                    <ShieldCheck size={18}/>
                  </div>
                  <span className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-300 italic">Auth_Status</span>
                </div>
                
                <p className="text-[11px] font-black text-blue-300 uppercase tracking-widest leading-relaxed">
                  Your project requirements will be encrypted and transmitted to the central command node for review.
                </p>

                {status && (
                  <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-black text-[#007BFF] uppercase tracking-tighter animate-pulse text-center">
                      {status}
                    </p>
                  </div>
                )}
             </div>
          </div>

          {/* Right Side: Input Parameters */}
          <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl border border-white rounded-[4rem] p-12 relative overflow-hidden shadow-2xl shadow-blue-900/5">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
              <Globe size={400} className="text-[#001F3F]" />
            </div>

            <div className="relative z-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-4">
                  <label className="text-[14px] font-black text-[#001F3F] uppercase tracking-widest italic ml-2 flex items-center gap-2">
                    <User size={14} className="text-blue-300"/> Operator_Identity
                  </label>
                  <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="NAME_OR_ID"
                    required
                    className="bg-[#F4F9FF] border border-blue-100 rounded-2xl p-6 text-sm text-[#001F3F] focus:ring-4 focus:ring-blue-50 outline-none transition-all font-black italic shadow-inner"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-[14px] font-black text-[#001F3F] uppercase tracking-widest italic ml-2 flex items-center gap-2">
                    <Mail size={14} className="text-blue-300"/> Comms_Channel
                  </label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="EMAIL_ADDRESS"
                    required
                    className="bg-[#F4F9FF] border border-blue-100 rounded-2xl p-6 text-sm text-[#001F3F] focus:ring-4 focus:ring-blue-50 outline-none transition-all font-black italic shadow-inner"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[14px] font-black text-[#001F3F] uppercase tracking-widest italic ml-2 flex items-center gap-2">
                  <FileText size={14} className="text-blue-300"/> Mission_Objectives
                </label>
                <textarea 
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="DESCRIBE_PROJECT_PARAMETERS..."
                  required
                  rows={6}
                  className="bg-[#F4F9FF] border border-blue-100 rounded-[2rem] p-8 text-sm text-[#001F3F] focus:ring-4 focus:ring-blue-50 outline-none transition-all font-black italic shadow-inner resize-none"
                />
              </div>

              <button 
                disabled={isSubmitting}
                className="w-full h-24 bg-[#FF7F50] text-white rounded-[2.5rem] flex items-center justify-center gap-6 font-black uppercase italic group hover:bg-[#E06940] transition-all active:scale-95 shadow-2xl shadow-orange-500/30"
              >
                {isSubmitting ? (
                  <Activity className="animate-spin" size={24} />
                ) : (
                  <>
                    <span className="text-xl tracking-tighter">Transmit_Intel</span> 
                    <Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
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