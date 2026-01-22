import React ,{ useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Printer, TrendingUp, Users, Package, DollarSign, Download, BarChart3 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-600/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-cyan-600/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 mt-2">Real-time business insights and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
              <span className="text-sm text-gray-600">Last updated: </span>
              <span className="font-semibold text-gray-900">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
        <DashboardCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`} 
          color="blue" 
          icon={<DollarSign className="w-8 h-8" />}
          trend="+12.5%"
        />
        <DashboardCard 
          title="Today's Orders" 
          value={orders.length} 
          color="green" 
          icon={<Package className="w-8 h-8" />}
          trend="+8.2%"
        />
        <DashboardCard 
          title="Products Available" 
          value={totalProducts.toLocaleString()} 
          color="purple" 
          icon={<BarChart3 className="w-8 h-8" />}
          trend="+5.1%"
        />
        <DashboardCard 
          title="Customers Served" 
          value={totalUsers.toLocaleString()} 
          color="orange" 
          icon={<Users className="w-8 h-8" />}
          trend="+15.3%"
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


      {/* Enhanced Charts Section */}
      <section className="relative z-10 mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive business performance metrics</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="group">
            <WeeklyStatsPieChart statsData={weeklyStats} />
          </div>
          <div className="group">
            <ModernLineChart statsData={weeklyStats} />
          </div>
        </div>
      </section>



      {/* Enhanced Sales Chart */}
      <section className="relative z-10 mb-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sales Performance</h3>
              <p className="text-gray-600">Monthly revenue trends and targets</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-semibold">+18.5% vs last month</span>
            </div>
          </div>
          <SalesChart />
        </div>
      </section>
    </div>
  );
}

const DashboardCard = ({ title, value, color, icon, trend }) => {
  const colorMap = {
    blue: {
      gradient: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
      light: 'bg-blue-50',
      accent: 'text-blue-600',
      shadow: 'shadow-blue-500/25'
    },
    green: {
      gradient: 'bg-gradient-to-br from-emerald-500 via-green-600 to-green-700',
      light: 'bg-emerald-50',
      accent: 'text-emerald-600',
      shadow: 'shadow-emerald-500/25'
    },
    purple: {
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700',
      light: 'bg-purple-50',
      accent: 'text-purple-600',
      shadow: 'shadow-purple-500/25'
    },
    orange: {
      gradient: 'bg-gradient-to-br from-orange-500 via-orange-600 to-red-600',
      light: 'bg-orange-50',
      accent: 'text-orange-600',
      shadow: 'shadow-orange-500/25'
    },
  };

  const colors = colorMap[color];

  return (
    <div className={`group relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl ${colors.shadow} transition-all duration-300 transform hover:scale-105 hover:-translate-y-1`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl"></div>
      
      {/* Floating Icon */}
      <div className={`absolute -top-4 -right-4 w-16 h-16 ${colors.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-300`}>
        {icon}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 ${colors.light} rounded-xl`}>
            <div className={`${colors.accent}`}>
              {icon}
            </div>
          </div>
          {trend && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700">{trend}</span>
            </div>
          )}
        </div>
        
        <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div className={`h-2 ${colors.gradient} rounded-full transition-all duration-1000 ease-out`} style={{width: '75%'}}></div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
};
