import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Signin() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!usernameOrEmail.trim() || !password.trim()) {
      setMessage({ type: "error", text: "Security credentials required." });
      return;
    }

    setIsLoading(true);

    const credentials = {
      email: usernameOrEmail,
      userName: usernameOrEmail,
      password,
    };

    const response = await login(credentials);

    if (response.success) {
      toast.success('Access Granted. Welcome, Commander.');
      setTimeout(() => navigate("/admin/dashboard"), 1000);
    } else {
      setMessage({
        type: "error",
        text: response.message || "Access Denied: Invalid Credentials",
      });
      toast.error('Authentication Failure');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-6 relative overflow-hidden font-outfit">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-neon-cyan/20 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-neon-purple/20 rounded-full blur-[150px] animate-pulse delay-1000" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '40px 40px' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card rounded-[40px] p-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col items-center mb-10">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 1 }}
              className="w-20 h-20 bg-sartaaj-gradient rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,242,255,0.4)]"
            >
              <ShieldCheck size={40} className="text-white" />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2">SARTAAJ<span className="text-neon-cyan">BHARAT</span></h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Secure Admin Command Center</p>
          </div>

          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`mb-6 flex items-center gap-3 p-4 rounded-2xl text-xs font-bold border ${message.type === "error"
                  ? "bg-beast-red/10 text-beast-red border-beast-red/20"
                  : "bg-green-500/10 text-green-400 border-green-500/20"
                  }`}
              >
                {message.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                <span>{message.text.toUpperCase()}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Identity Token</label>
              <div className="relative group">
                <input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan transition-all group-hover:border-white/20"
                  placeholder="USERNAME / EMAIL"
                />
                <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-neon-cyan transition-colors" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Secure Passcode</label>
              <div className="relative group">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neon-purple transition-all group-hover:border-white/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((prev) => !prev)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-sartaaj-gradient text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(188,19,254,0.3)] hover:shadow-[0_15px_40px_rgba(188,19,254,0.5)] transition-all"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Zap size={18} fill="currentColor" />
                  Initiate System
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck size={12} className="text-neon-cyan" />
              End-to-End Encrypted Terminal
            </p>
          </div>
        </div>
      </motion.div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{ backgroundColor: '#0a0a0b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
      />
    </div>
  );
}
