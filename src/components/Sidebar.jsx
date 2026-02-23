import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBoxOpen,
  FaPlusSquare,
  FaClipboardList,
  FaUsers,
  FaTags,
  FaChartBar,
  FaTruck,
  FaShippingFast,
} from "react-icons/fa";
import { MdDashboard, MdCategory } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import { useAuth } from "../context/AuthContext.jsx";
import { FaBoxesStacked } from 'react-icons/fa6';
import { motion } from "framer-motion";

function Sidebar({ className, toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside
      className={`${className} text-white p-6 h-full overflow-y-auto no-scrollbar scroll-smooth`}
    >
      {/* Close on mobile */}
      <div className="lg:hidden mb-6 flex justify-end">
        <button
          onClick={toggleSidebar}
          className="text-sartaaj-red hover:bg-sartaaj-red/10 rounded-full p-2 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center mb-10 space-x-4 p-4 rounded-2xl bg-white/5 border border-white/10"
      >
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-full flex items-center justify-center p-[2px]">
            <div className="w-full h-full bg-obsidian rounded-full flex items-center justify-center overflow-hidden">
              <FaUsers className="text-neon-cyan text-2xl" />
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-obsidian rounded-full" />
        </div>
        <div>
          <p className="font-bold text-white tracking-wide">{user?.userName || "Admin"}</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Verified Admin</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="space-y-8">
        <NavSection title="Main Console">
          <NavItem to="/admin/dashboard" label="Dashboard" icon={<MdDashboard size={20} />} onClick={toggleSidebar} />
        </NavSection>

        <NavSection title="Inventory Control">
          <NavItem to="/admin/adminProducts" label="All Products" icon={<FaBoxOpen size={20} />} onClick={toggleSidebar} />
          <NavItem to="/admin/addProduct" label="Add Product" icon={<FaPlusSquare size={20} />} onClick={toggleSidebar} />
          <NavItem to="/admin/categories" label="Categories" icon={<MdCategory size={20} />} onClick={toggleSidebar} />
        </NavSection>

        <NavSection title="Logistics & Orders">
          <NavItem to="orders" label="All Orders" icon={<FaClipboardList size={20} />} onClick={toggleSidebar} />
          <NavItem to="shipping" label="Shipping Manager" icon={<FaTruck size={20} />} onClick={toggleSidebar} />
          <NavItem to="shipping-analytics" label="Shipping Analytics" icon={<FaShippingFast size={20} />} onClick={toggleSidebar} />
        </NavSection>

        <NavSection title="Users & Access">
          <NavItem to="users" label="User List" icon={<FaUsers size={20} />} onClick={toggleSidebar} />
        </NavSection>

        <NavSection title="Marketing">
          <NavItem to="offers" label="Offers & Deals" icon={<FaTags size={20} />} onClick={toggleSidebar} />
          <NavItem to="banners" label="Banners" icon={<FaTags size={20} />} onClick={toggleSidebar} />
        </NavSection>

        <NavSection title="Intelligence Reports">
          <NavItem to="sales-report" label="Sales Report" icon={<FaChartBar size={20} />} onClick={toggleSidebar} />
          <NavItem to="stocks" label="Stock Manager" icon={<FaBoxesStacked size={20} />} onClick={toggleSidebar} />
          <NavItem to="PaymentDetails" label="Payment Detail" icon={<FaChartBar size={20} />} onClick={toggleSidebar} />
          <NavItem to="orphaned-payments" label="Missing Order Payments" icon={<FaChartBar size={20} />} onClick={toggleSidebar} />
        </NavSection>

        {/* Logout */}
        <div className="pt-6 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sartaaj-red hover:bg-sartaaj-red/10 rounded-xl p-4 w-full text-left transition-all duration-300 group"
          >
            <motion.div whileHover={{ scale: 1.2, rotate: 15 }}>
              <IoMdLogOut size={22} />
            </motion.div>
            <span className="font-bold tracking-wide">Terminate Session</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}

// Helper Components
const NavSection = ({ title, children }) => (
  <div className="mb-2">
    <h2 className="uppercase text-[10px] text-gray-500 font-bold px-4 mb-4 tracking-[0.2em]">{title}</h2>
    <div className="flex flex-col gap-1">{children}</div>
  </div>
);

const NavItem = ({ to, label, icon, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `group relative px-4 py-3 rounded-xl flex items-center gap-4 transition-all duration-300 ${isActive
        ? "bg-sartaaj-gradient text-white neon-glow shadow-lg"
        : "text-gray-400 hover:text-white hover:bg-white/5"
      }`
    }
  >
    {({ isActive }) => (
      <>
        <div className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
          {icon}
        </div>
        <span className={`text-sm font-bold tracking-wide ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
          {label}
        </span>
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
          />
        )}
      </>
    )}
  </NavLink>
);

export default Sidebar;
