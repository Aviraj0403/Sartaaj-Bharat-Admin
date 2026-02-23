import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  Printer, TrendingUp, Users, Package, DollarSign, Download, BarChart3,
  Activity, Zap, Star, Award, ArrowUpRight, Eye, RefreshCw, Calendar,
  Filter, Settings, Bell, Search, Sparkles, Target, Globe, Shield, Clock
} from 'lucide-react';
import SalesChart from '../pages/report/SalesChart';
import WeeklyStatsPieChart from '../pages/Graph/WeeklyStatsPieChart';
import { getTodayOrders, getTotalRevenue, getTotalOrders, getWeeklyStats, getMonthlyStats, getTotalUsers, getTotalProducts } from '../services/dashboartdApi';
import ModernLineChart from './Graph/ModernLineChart';
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const ordersRef = useRef();

  const socketURL = 'https://api.gurmeetkaurstore.com';

  useEffect(() => {
    const socket = io(socketURL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(socket);

    fetchData();

    socket.on('newOrder', (order) => {
      setOrders((prevOrders) => [order, ...prevOrders]);
      toast.success('New Order Received 📦');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [
        todayOrdersResponse,
        totalRevenueResponse,
        totalOrdersResponse,
        weeklyStatsResponse,
        monthlyStatsResponse,
        totalUsersResponse,
        totalProductsResponse
      ] = await Promise.all([
        getTodayOrders(),
        getTotalRevenue(),
        getTotalOrders(),
        getWeeklyStats(),
        getMonthlyStats(),
        getTotalUsers(),
        getTotalProducts()
      ]);

      setOrders(todayOrdersResponse.orders || []);
      setTotalRevenue(totalRevenueResponse || 0);
      setTotalOrders(totalOrdersResponse || 0);
      setWeeklyStats(weeklyStatsResponse || []);
      setMonthlyStats(monthlyStatsResponse || []);
      setTotalUsers(totalUsersResponse || 0);
      setTotalProducts(totalProductsResponse || 0);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintOrders = () => {
    const printContent = ordersRef.current.innerHTML;
    const printWindow = window.open('', '', 'width=800,height=600');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Today's Orders</title>
          <style>
            body { padding: 40px; font-family: 'Outfit', sans-serif; background: #fff; color: #000; }
            h2 { font-size: 32px; font-weight: 900; margin-bottom: 30px; letter-spacing: -1px; }
            .order-card { 
                border: 2px solid #f0f0f0; 
                padding: 25px; 
                margin-bottom: 25px; 
                border-radius: 20px;
                page-break-inside: avoid;
            }
            .order-header { display: flex; justify-content: space-between; margin-bottom: 15px; font-weight: 800; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; }
            .order-details { font-size: 15px; line-height: 1.8; color: #444; }
            .badge { padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 900; text-transform: uppercase; }
            .badge-pending { background: #fff7ed; color: #c2410c; }
            .badge-delivered { background: #f0fdf4; color: #15803d; }
          </style>
        </head>
        <body>
          <h2>MISSION REPORT: ORDERS - ${new Date().toLocaleDateString()}</h2>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="space-y-12">
      {/* Premium Header Metrics */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-neon-cyan" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Global Command Center</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">OPERATIONAL <span className="text-neon-cyan">METRICS</span></h2>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-bold text-gray-400">Last Sync: Just Now</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchData}
              className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan hover:text-obsidain transition-all"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <PremiumKPICard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            color="cyan"
            icon={<DollarSign />}
            trend="+12.5%"
            subtitle="vs last month"
            sparkline={[65, 78, 66, 44, 56, 67, 75]}
          />
          <PremiumKPICard
            title="Today's Orders"
            value={orders.length}
            color="purple"
            icon={<Package />}
            trend="+8.2%"
            subtitle="vs yesterday"
            sparkline={[45, 52, 38, 24, 33, 26, 21]}
          />
          <PremiumKPICard
            title="Total Products"
            value={totalProducts.toLocaleString()}
            color="gold"
            icon={<BarChart3 />}
            trend="+5.1%"
            subtitle="inventory growth"
            sparkline={[35, 41, 62, 42, 13, 18, 29]}
          />
          <PremiumKPICard
            title="Total Users"
            value={totalUsers.toLocaleString()}
            color="red"
            icon={<Users />}
            trend="+15.3%"
            subtitle="user engagement"
            sparkline={[24, 13, 98, 39, 48, 38, 58]}
          />
        </div>
      </section>

      {/* Analytics Engine */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="glass-card rounded-3xl p-8 border border-white/5">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">REVENUE ANALYSIS</h3>
                <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Growth trajectory & forecasting</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-lg bg-neon-cyan/10 text-neon-cyan text-[10px] font-black uppercase border border-neon-cyan/20">Live Sync</span>
              </div>
            </div>
            <SalesChart />
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card rounded-3xl p-8 border border-white/5 h-full">
            <h3 className="text-xl font-black tracking-tight text-white mb-6 uppercase">Weekly Distribution</h3>
            <WeeklyStatsPieChart statsData={weeklyStats} />
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-neon-cyan" />
                  <span className="text-sm font-bold">System Health</span>
                </div>
                <span className="text-xs font-black text-green-400">OPTIMAL</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-neon-purple" />
                  <span className="text-sm font-bold">Sales Target</span>
                </div>
                <span className="text-xs font-black text-neon-purple">88%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Orders Terminal */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sartaaj-gradient rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">REAL-TIME <span className="text-neon-purple">ORDERS</span></h3>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">Incoming data stream</p>
            </div>
          </div>
          {orders.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrintOrders}
              className="flex items-center gap-2 px-6 py-3 bg-white text-obsidian rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neon-cyan transition-colors"
            >
              <Printer size={18} />
              Export Report
            </motion.button>
          )}
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center glass-card rounded-3xl gap-4">
            <div className="w-12 h-12 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Initializing Data Stream...</p>
          </div>
        ) : (
          <div ref={ordersRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all group overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-sartaaj-gradient opacity-[0.02] -rotate-45 translate-x-12 -translate-y-12" />
                    <div className="space-y-6 relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-black tracking-tight group-hover:text-neon-cyan transition-colors">
                            {order?.shippingAddress?.name || 'UNDISCLOSED'}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                            ID: #{order?._id?.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${order.orderStatus === 'Delivered'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : order.orderStatus === 'Cancelled'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                            : 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                          }`}>
                          {order.orderStatus || 'PENDING'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Payment</p>
                          <p className="text-xs font-bold">{order?.paymentMethod || 'UNKNOWN'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Status</p>
                          <span className={`text-[10px] font-black ${order.paymentStatus === 'Paid' ? 'text-green-400' : 'text-sartaaj-red'}`}>
                            {order.paymentStatus || 'UNPAID'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Payload Items</p>
                        <div className="max-h-32 overflow-y-auto pr-2 space-y-2 no-scrollbar">
                          {order?.items?.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-white/5 border border-white/5 text-[11px]">
                              <span className="font-bold truncate max-w-[120px]">{item?.selectedVariant?.name || item?.product?.name}</span>
                              <span className="font-black text-neon-cyan">x{item?.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 flex justify-between items-center border-t border-white/5">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Total Valuation</span>
                        <p className="text-xl font-black text-white">₹{order?.totalAmount?.toLocaleString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full h-48 flex flex-col items-center justify-center glass-card rounded-3xl opacity-50">
                  <Globe className="w-12 h-12 mb-4 text-gray-600" />
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-500">No active signals detected</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}

const PremiumKPICard = ({ title, value, color, icon, trend, subtitle, sparkline }) => {
  const colorMap = {
    cyan: {
      accent: 'text-neon-cyan',
      glow: 'shadow-neon-cyan/20',
      border: 'border-neon-cyan/20',
      gradient: 'from-neon-cyan to-blue-600'
    },
    purple: {
      accent: 'text-neon-purple',
      glow: 'shadow-neon-purple/20',
      border: 'border-neon-purple/20',
      gradient: 'from-neon-purple to-pink-600'
    },
    gold: {
      accent: 'text-royal-gold',
      glow: 'shadow-royal-gold/20',
      border: 'border-royal-gold/20',
      gradient: 'from-royal-gold to-orange-600'
    },
    red: {
      accent: 'text-sartaaj-red',
      glow: 'shadow-sartaaj-red/20',
      border: 'border-sartaaj-red/20',
      gradient: 'from-sartaaj-red to-rose-600'
    }
  };

  const colors = colorMap[color];

  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      className={`glass-card p-8 rounded-3xl border border-white/10 relative overflow-hidden group shadow-2xl ${colors.glow}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-[0.03] rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:opacity-[0.1] transition-all`} />

      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div className={`w-14 h-14 rounded-2xl bg-white/5 border ${colors.border} flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-transform`}>
            {React.cloneElement(icon, { className: `w-7 h-7 ${colors.accent}` })}
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-black">
              <ArrowUpRight size={12} />
              {trend}
            </div>
            <p className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-wider">{subtitle}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{title}</h3>
          <p className="text-4xl font-black tracking-tighter text-white">{value}</p>
        </div>

        <div className="flex items-end justify-between gap-4 h-12">
          <svg className="w-full h-full opacity-50 transition-opacity group-hover:opacity-100" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M0,100 C10,95 20,80 30,85 C40,90 50,70 60,75 C70,80 80,60 90,65 L100,100"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={colors.accent}
            />
          </svg>
          <Zap className={`w-5 h-5 ${colors.accent} animate-pulse`} />
        </div>
      </div>
    </motion.div>
  );
};
