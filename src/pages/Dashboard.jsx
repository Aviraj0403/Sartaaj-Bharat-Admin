import React ,{ useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Printer, TrendingUp, Users, Package, DollarSign, Download, BarChart3, 
  Activity, Zap, Star, Award, ArrowUpRight, Eye, RefreshCw, Calendar,
  Filter, Settings, Bell, Search, Sparkles, Target, Globe
} from 'lucide-react';
import SalesChart from '../pages/report/SalesChart';
import WeeklyStatsPieChart from '../pages/Graph/WeeklyStatsPieChart';
import { getTodayOrders, getTotalRevenue, getTotalOrders, getWeeklyStats, getMonthlyStats, getTotalUsers ,getTotalProducts} from '../services/dashboartdApi'; // Import the necessary API functions
import ModernLineChart from './Graph/ModernLineChart';

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
      console.log('📦 New order received: ', order);
      setOrders((prevOrders) => [order, ...prevOrders]);
    });

    socket.on('connect', () => {
      console.log('📡 Connected to WebSocket server');
    });

    socket.on('disconnect', (reason) => {
      console.warn('📡 Disconnected from WebSocket:', reason);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('📡 Reconnected after', attemptNumber, 'attempts');
      fetchData();
    });

    socket.on('connect_error', (error) => {
      console.error('📡 Connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch data from all APIs
  const fetchData = async () => {
    try {
      setLoading(true);

      const todayOrdersResponse = await getTodayOrders();
      const totalRevenueResponse = await getTotalRevenue();
      const totalOrdersResponse = await getTotalOrders();
      const weeklyStatsResponse = await getWeeklyStats();
      const monthlyStatsResponse = await getMonthlyStats();
      const totalUsersResponse = await getTotalUsers();
      const totalProductsResponse = await getTotalProducts();
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
            body { padding: 20px; font-family: Arial, sans-serif; }
            h2 { font-size: 24px; margin-bottom: 20px; color: #ea580c; }
            .order-card { 
              border: 1px solid #ddd; 
              padding: 15px; 
              margin-bottom: 15px; 
              border-radius: 12px;
              page-break-inside: avoid;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .order-header { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 10px;
              font-weight: bold;
            }
            .order-details { font-size: 14px; line-height: 1.6; }
            .badge { 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 12px;
              font-weight: bold;
            }
            .badge-pending { background: #fed7aa; color: #c2410c; }
            .badge-delivered { background: #dcfce7; color: #15803d; }
            .badge-cancelled { background: #fee2e2; color: #b91c1c; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <h2>Today's Orders - ${new Date().toLocaleDateString()}</h2>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-400/30 via-purple-500/20 to-indigo-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-purple-600/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-gradient-to-br from-pink-400/20 via-rose-500/15 to-orange-600/25 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500"></div>
        
        {/* Secondary floating elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full mix-blend-multiply filter blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-amber-400/20 to-orange-600/20 rounded-full mix-blend-multiply filter blur-2xl animate-bounce delay-700"></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-indigo-400/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-ping delay-300"></div>
        <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-cyan-400/40 rounded-full animate-ping delay-700"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Premium Header Section */}
        <div className="mb-8">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
            {/* Left Header Content */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl xl:text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                    Executive Dashboard
                  </h1>
                  <p className="text-gray-600 text-lg mt-1">Real-time business intelligence & analytics</p>
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">Live Data</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Updated: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl shadow-lg border border-emerald-200/50">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">Premium Analytics</span>
                </div>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
              </button>
              <button className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
                <Settings className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
              </button>
              <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                <span className="font-semibold">Export Report</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <PremiumKPICard 
            title="Total Revenue" 
            value={`₹${totalRevenue.toLocaleString()}`} 
            color="indigo" 
            icon={<DollarSign className="w-8 h-8" />}
            trend="+12.5%"
            subtitle="vs last month"
            sparkline={[65, 78, 66, 44, 56, 67, 75]}
          />
          <PremiumKPICard 
            title="Today's Orders" 
            value={orders.length} 
            color="emerald" 
            icon={<Package className="w-8 h-8" />}
            trend="+8.2%"
            subtitle="vs yesterday"
            sparkline={[45, 52, 38, 24, 33, 26, 21]}
          />
          <PremiumKPICard 
            title="Products Available" 
            value={totalProducts.toLocaleString()} 
            color="purple" 
            icon={<BarChart3 className="w-8 h-8" />}
            trend="+5.1%"
            subtitle="inventory growth"
            sparkline={[35, 41, 62, 42, 13, 18, 29]}
          />
          <PremiumKPICard 
            title="Active Customers" 
            value={totalUsers.toLocaleString()} 
            color="rose" 
            icon={<Users className="w-8 h-8" />}
            trend="+15.3%"
            subtitle="user engagement"
            sparkline={[24, 13, 98, 39, 48, 38, 58]}
          />
        </div>

      {/* Today's Orders */}
   <section className="z-10 relative mt-8 sm:mt-12">
  <div className="flex justify-between items-center mb-4 sm:mb-6">
    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
      Today's Orders {orders.length > 0 && `(${orders.length})`}
    </h3>
    {orders.length > 0 && (
      <button
        onClick={handlePrintOrders}
        className="flex items-center px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition-colors"
      >
        <Printer size={18} className="mr-2" />
        Print Orders
      </button>
    )}
  </div>

  {loading ? (
    <div className="text-center text-gray-500 py-10 sm:py-20">
      <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4">Loading orders...</p>
    </div>
  ) : (
    <div ref={ordersRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {orders.length > 0 ? (
        orders.map((order) => (
          <div
            key={order._id}
            className="order-card bg-white p-6 rounded-lg shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow"
          >
            <div className="space-y-4">
              {/* Customer & Status */}
              <div className="order-header flex justify-between items-start">
                <h4 className="text-base sm:text-lg font-semibold text-gray-800">
                  {order?.shippingAddress?.name || 'N/A'}
                </h4>
                <span
                  className={`badge px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    order.orderStatus === 'Delivered'
                      ? 'bg-green-100 text-green-600'
                      : order.orderStatus === 'Cancelled'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  {order.orderStatus || 'Pending'}
                </span>
              </div>

              {/* Order Details */}
              <div className="order-details text-sm text-gray-600">
                <p>
                  <span className="font-medium">Order ID:</span>{' '}
                  {order?._id ? order._id.slice(0, 10) + '...' : 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Time:</span>{' '}
                  {order?.placedAt ? new Date(order.placedAt).toLocaleString() : 'N/A'}
                </p>
              </div>

              {/* Payment Method & Status */}
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium">Payment:</span> {order?.paymentMethod || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {order.paymentStatus || 'N/A'}
                  </span>
                </p>
              </div>

              {/* Items */}
              <div className="border-t border-gray-300 pt-4">
                <h5 className="text-lg font-semibold text-gray-800 mb-2">Items:</h5>
                <div className="overflow-auto max-h-60">
                  {order?.items?.length > 0 ? (
                    <ul className="space-y-4 text-sm text-gray-700">
                      {order.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex justify-between items-center py-3 px-4 rounded-lg bg-gray-50 shadow-sm hover:bg-gray-100 transition duration-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:space-x-4 w-full">
                            <div className="flex flex-col sm:flex-row w-full">
                              <span className="font-medium text-gray-800 w-full sm:w-auto">
                                {item?.selectedVariant?.name || item?.product?.name || 'Unknown'}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-600 sm:ml-4">
                                ({item?.selectedVariant?.size}/{item?.selectedVariant?.color})
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-end items-end text-sm space-x-1 sm:space-x-3">
                              <span className="font-semibold text-gray-900">
                                {item?.quantity || 0} × ₹
                                {item?.selectedVariant?.price || item?.product?.price || 0}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-gray-500">No items available</div>
                  )}
                </div>
              </div>

              {/* Total */}
              <p className="text-base sm:text-lg font-bold text-gray-900 border-t pt-2">
                Total: ₹{order?.totalAmount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-600">
          <p className="text-lg font-medium">No orders yet today.</p>
          <p className="text-sm text-gray-500 mt-2">New orders will appear here automatically.</p>
        </div>
      )}
    </div>
  )}
</section>


        {/* Premium Analytics Section */}
        <section className="mb-12">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Activity className="w-8 h-8 text-indigo-600" />
                Advanced Analytics
              </h2>
              <p className="text-gray-600 text-lg">Comprehensive business performance insights</p>
            </div>
            
            {/* Analytics Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
                <Calendar className="w-4 h-4 text-gray-600" />
                <select className="bg-transparent text-sm font-medium text-gray-700 border-none outline-none">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                </select>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 group">
                <Filter className="w-4 h-4 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                <span className="text-sm font-medium text-gray-700">Filters</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group">
                <Eye className="w-4 h-4 group-hover:animate-pulse" />
                <span className="font-semibold">View Details</span>
              </button>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="group transform hover:scale-[1.02] transition-all duration-500">
              <WeeklyStatsPieChart statsData={weeklyStats} />
            </div>
            <div className="group transform hover:scale-[1.02] transition-all duration-500">
              <ModernLineChart statsData={weeklyStats} />
            </div>
          </div>
        </section>

        {/* Enhanced Sales Performance */}
        <section className="mb-12">
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 hover:shadow-3xl transition-all duration-500 group">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Sales Performance</h3>
                  <p className="text-gray-600 text-lg">Monthly revenue trends and target analysis</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl shadow-lg border border-emerald-200/50">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">+18.5% Growth</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl shadow-lg border border-blue-200/50">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-700 font-bold">Target Achieved</span>
                </div>
              </div>
            </div>
            <SalesChart />
          </div>
        </section>
      </div>
    </div>
  );
}

// Premium KPI Card Component with Sparkline
const PremiumKPICard = ({ title, value, color, icon, trend, subtitle, sparkline }) => {
  const colorMap = {
    indigo: {
      gradient: 'from-indigo-500 via-indigo-600 to-purple-700',
      light: 'from-indigo-50 to-purple-50',
      accent: 'text-indigo-600',
      shadow: 'shadow-indigo-500/25',
      border: 'border-indigo-200/50'
    },
    emerald: {
      gradient: 'from-emerald-500 via-green-600 to-teal-700',
      light: 'from-emerald-50 to-teal-50',
      accent: 'text-emerald-600',
      shadow: 'shadow-emerald-500/25',
      border: 'border-emerald-200/50'
    },
    purple: {
      gradient: 'from-purple-500 via-purple-600 to-pink-700',
      light: 'from-purple-50 to-pink-50',
      accent: 'text-purple-600',
      shadow: 'shadow-purple-500/25',
      border: 'border-purple-200/50'
    },
    rose: {
      gradient: 'from-rose-500 via-pink-600 to-red-700',
      light: 'from-rose-50 to-pink-50',
      accent: 'text-rose-600',
      shadow: 'shadow-rose-500/25',
      border: 'border-rose-200/50'
    },
  };

  const colors = colorMap[color];

  // Simple sparkline SVG
  const SparklineChart = ({ data }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg className="w-20 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          points={points}
          className={colors.accent}
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline
          fill={`url(#gradient-${color})`}
          stroke="none"
          points={`0,100 ${points} 100,100`}
          className={colors.accent}
        />
      </svg>
    );
  };

  return (
    <div className={`group relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-xl border ${colors.border} hover:shadow-2xl ${colors.shadow} transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden`}>
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.light} opacity-50 group-hover:opacity-70 transition-opacity duration-500`}></div>
      
      {/* Floating Decorative Elements */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${colors.gradient} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 animate-pulse`}></div>
      <div className={`absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-full opacity-5 group-hover:opacity-15 transition-opacity duration-500 animate-pulse delay-300`}></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with Icon and Trend */}
        <div className="flex items-start justify-between mb-6">
          <div className={`p-4 bg-gradient-to-br ${colors.gradient} rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          
          {trend && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 px-3 py-1 bg-green-100/80 backdrop-blur-sm rounded-lg shadow-sm">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-700">{trend}</span>
              </div>
              <span className="text-xs text-gray-500 mt-1">{subtitle}</span>
            </div>
          )}
        </div>
        
        {/* Title and Value */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{title}</h3>
          <p className="text-4xl font-bold text-gray-900 mb-1">{value}</p>
        </div>

        {/* Sparkline Chart */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <SparklineChart data={sparkline} />
          </div>
          <div className="ml-4">
            <div className={`p-2 ${colors.light} bg-gradient-to-br rounded-lg`}>
              <Zap className={`w-4 h-4 ${colors.accent}`} />
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">Performance</span>
            <span className="text-xs font-semibold text-gray-700">85%</span>
          </div>
          <div className="w-full bg-gray-200/50 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 bg-gradient-to-r ${colors.gradient} rounded-full transition-all duration-1000 ease-out transform origin-left`} 
              style={{width: '85%'}}
            ></div>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>
    </div>
  );
};
