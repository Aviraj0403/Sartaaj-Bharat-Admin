import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header, Sidebar, RouterCumb, ProgressBar, Footer } from "../components";
import { useWindowContext } from "../context/windowContext";
import { motion, AnimatePresence } from "framer-motion";

const AdminLayout = () => {
  const [openSidebar, setOpenSidebar] = useState(true);
  const { divRef, progressWidth } = useWindowContext();

  const toggleSidebar = () => setOpenSidebar((prev) => !prev);

  useEffect(() => {
    const handleResize = () => {
      setOpenSidebar(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-obsidian text-white relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Sidebar */}
      <Sidebar
        className={`
          lg:fixed absolute left-0 z-40 w-72 h-screen
          transition-all duration-500 ease-in-out border-r border-white/5
          ${openSidebar ? "translate-x-0" : "-translate-x-full"}
          glass
        `}
        toggleSidebar={toggleSidebar}
      />

      {/* Main content area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-500 ease-in-out z-10 ${openSidebar ? "lg:ml-72" : "ml-0"
          }`}
      >
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} openSidebar={openSidebar} />

        {/* Content Container */}
        <div className="mt-20 px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
          <div className="mb-6">
            <ProgressBar progressWidth={progressWidth} />
            <div className="mt-4">
              <RouterCumb />
            </div>
          </div>

          <main
            ref={divRef || null}
            className="flex-grow rounded-2xl glass-card p-6 mb-8 overflow-y-auto"
          >
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Mobile Overlay */}
      {openSidebar && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default AdminLayout;
