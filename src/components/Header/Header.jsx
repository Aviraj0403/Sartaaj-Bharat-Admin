import React, { useState, useEffect, useRef } from "react";
import { FaAlignLeft, FaUserAstronaut, FaShoppingBasket, FaTerminal } from "react-icons/fa";
import { MdMenu, MdRefresh } from "react-icons/md";
import { useAuth } from "../../context/AuthContext.jsx";
import { redisCache } from "../../services/dashboartdApi.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

function Header({ toggleSidebar, openSidebar }) {
  const { user, logout } = useAuth();
  const [isOpenProfile, setIsOpenProfile] = useState(false);
  const [isCacheClearing, setIsCacheClearing] = useState(false);
  const profileRef = useRef();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsOpenProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRebootCache = async () => {
    setIsCacheClearing(true);
    const result = await redisCache();
    setIsCacheClearing(false);
    if (result) {
      toast.success('System Cache Synchronized');
    } else {
      toast.error('Synchronization Failed');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-20 transition-all duration-500 ease-in-out">
        <div className={`h-full mx-4 sm:mx-8 mt-4 rounded-2xl glass border border-white/10 px-6 flex justify-between items-center shadow-2xl`}>
          {/* LEFT SIDE: Logo + Sidebar Toggle */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-sartaaj-gradient rounded-xl flex items-center justify-center neon-glow group-hover:rotate-12 transition-transform shadow-lg">
                <FaShoppingBasket size={22} className="text-white" />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-white group-hover:text-glow transition-all">
                SARTAAJ<span className="text-neon-cyan text-glow">BHARAT</span>
              </h1>
            </div>

            {/* Sidebar Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5"
            >
              {openSidebar ? (
                <FaAlignLeft size={22} />
              ) : (
                <MdMenu size={24} />
              )}
            </motion.button>
          </div>

          {/* RIGHT SIDE: Branch, Cache, Profile */}
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <div className="w-2 h-2 bg-neon-purple rounded-full animate-ping" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Node: Delhi_S1</p>
            </div>

            {/* Cache Reboot Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRebootCache}
              disabled={isCacheClearing}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 ${isCacheClearing
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-white/5 hover:bg-white/10 text-neon-cyan border border-neon-cyan/30 hover:border-neon-cyan shadow-[0_0_15px_rgba(0,242,255,0.1)] hover:shadow-[0_0_20px_rgba(0,242,255,0.2)]"
                } hidden sm:flex`}
            >
              <MdRefresh size={18} className={isCacheClearing ? "animate-spin" : ""} />
              {isCacheClearing ? "Syncing..." : "Sync Cache"}
            </motion.button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpenProfile((prev) => !prev)}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 p-1.5 pr-4 rounded-xl border border-white/10 transition-all group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all">
                  <FaUserAstronaut className="text-white" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-bold text-white leading-none mb-1">{user?.userName || "Admin"}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Senior Dev</p>
                </div>
              </motion.button>

              <AnimatePresence>
                {isOpenProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-64 glass-card rounded-2xl overflow-hidden z-50 p-2"
                  >
                    <div className="p-4 border-b border-white/5 bg-white/5 rounded-xl mb-2">
                      <p className="text-sm font-bold text-white">{user?.userName || "Admin"}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email || "admin@sartaaj.com"}</p>
                    </div>

                    <button
                      onClick={logout}
                      className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm font-bold text-sartaaj-red hover:bg-sartaaj-red/10 rounded-xl transition-all group"
                    >
                      <FaTerminal size={14} className="group-hover:rotate-12 transition-transform" />
                      Terminate System
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default Header;
