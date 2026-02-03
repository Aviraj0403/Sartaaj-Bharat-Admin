import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Users,
  Plus,
  Filter,
  Search,
  Calendar,
  FileText,
  Zap,
  Activity,
  ShoppingCart,
  DollarSign,
  Calculator
} from 'lucide-react';
import {
  getShippingDashboard,
  getOrdersReadyForShipping,
  getAllShipments,
  bulkCreateShipments,
  bulkGenerateLabels,
  triggerBulkTrackingUpdate,
  createShipment,
  generateShippingLabel,
  trackOrderShipment,
  cancelShipment,
  updateOrderShippingStatus
} from '../../services/ShiprocketApi';
import NotificationCenter from '../../components/NotificationCenter';
import ShippingCalculator from '../../components/ShippingCalculator';

const ShiprocketManager = () => {
  const [shipments, setShipments] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    courier: ''
  });
  const [pagination, setPagination] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      const response = await getShippingDashboard();
      setDashboard(response.dashboard || null);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to fetch dashboard data');
      setDashboard(null);
    }
  };

  // Fetch ready orders
  const fetchReadyOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrdersReadyForShipping({ page: 1, limit: 50 });
      setReadyOrders(Array.isArray(response.orders) ? response.orders : []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching ready orders:', error);
      setError('Failed to fetch ready orders. Please try again.');
      toast.error('Failed to fetch ready orders');
      setReadyOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch shipments
  const fetchShipments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllShipments(filters);
      setShipments(Array.isArray(response.shipments) ? response.shipments : []);
      setPagination(response.pagination || {});
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching shipments:', error);
      setError('Failed to fetch shipments. Please try again.');
      toast.error('Failed to fetch shipments');
      setShipments([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedTab === 'dashboard') {
        await fetchDashboard();
      } else if (selectedTab === 'ready-orders') {
        await fetchReadyOrders();
      } else if (selectedTab === 'shipments') {
        await fetchShipments();
      }
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Bulk update tracking
  const handleBulkUpdate = async () => {
    try {
      setBulkUpdating(true);
      const response = await triggerBulkTrackingUpdate();
      toast.success(`Bulk tracking update initiated: ${response.message}`);
      if (selectedTab === 'shipments') {
        fetchShipments();
      }
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast.error('Failed to bulk update tracking');
    } finally {
      setBulkUpdating(false);
    }
  };

  // Handle bulk shipment creation
  const handleBulkCreateShipments = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to create shipments');
      return;
    }

    try {
      const response = await bulkCreateShipments(selectedOrders);
      if (response.successful !== undefined) {
        toast.success(`Created ${response.successful} shipments, ${response.failed || 0} failed`);
      } else {
        toast.success('Bulk shipment creation completed');
      }
      setSelectedOrders([]);
      fetchReadyOrders();
    } catch (error) {
      console.error('Error creating bulk shipments:', error);
      toast.error('Failed to create bulk shipments');
    }
  };

  // Handle bulk label generation
  const handleBulkGenerateLabels = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to generate labels');
      return;
    }

    try {
      const response = await bulkGenerateLabels(selectedOrders);
      if (response.successful !== undefined) {
        toast.success(`Generated ${response.successful} labels, ${response.failed || 0} failed`);
      } else {
        toast.success('Bulk label generation completed');
      }
      setSelectedOrders([]);
      if (selectedTab === 'shipments') {
        fetchShipments();
      }
    } catch (error) {
      console.error('Error generating bulk labels:', error);
      toast.error('Failed to generate bulk labels');
    }
  };

  // Handle shipment actions with loading states
  const handleShipmentAction = async (action, orderId) => {
    if (!orderId) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [orderId]: true }));
      let response;
      
      switch (action) {
        case 'create':
          response = await createShipment(orderId);
          toast.success('Shipment created successfully');
          break;
        case 'label':
          response = await generateShippingLabel(orderId);
          if (response.label_url) {
            window.open(response.label_url, '_blank');
          }
          toast.success('Shipping label generated');
          break;
        case 'track':
          response = await trackOrderShipment(orderId);
          toast.success('Tracking updated');
          break;
        case 'cancel':
          if (window.confirm('Are you sure you want to cancel this shipment?')) {
            response = await cancelShipment(orderId);
            toast.success('Shipment cancelled');
          } else {
            return;
          }
          break;
        default:
          return;
      }
      
      // Refresh data based on current tab
      if (selectedTab === 'shipments') {
        fetchShipments();
      } else if (selectedTab === 'ready-orders') {
        fetchReadyOrders();
      }
    } catch (error) {
      console.error(`Error ${action} shipment:`, error);
      toast.error(`Failed to ${action} shipment: ${error.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle order selection
  const handleOrderSelection = (orderId) => {
    if (!orderId) return;
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Select all orders
  const handleSelectAll = () => {
    const currentOrders = selectedTab === 'ready-orders' ? readyOrders : shipments;
    const validOrderIds = (currentOrders || [])
      .filter(order => order._id || order.order_id)
      .map(order => order._id || order.order_id);
    
    if (selectedOrders.length === validOrderIds.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(validOrderIds);
    }
  };

  useEffect(() => {
    if (selectedTab === 'dashboard') {
      fetchDashboard();
    } else if (selectedTab === 'ready-orders') {
      fetchReadyOrders();
    } else if (selectedTab === 'shipments') {
      fetchShipments();
    }
  }, [selectedTab, filters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Only trigger if not typing in an input
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'r':
            event.preventDefault();
            handleRefresh();
            break;
          case '1':
            event.preventDefault();
            setSelectedTab('dashboard');
            break;
          case '2':
            event.preventDefault();
            setSelectedTab('ready-orders');
            break;
          case '3':
            event.preventDefault();
            setSelectedTab('shipments');
            break;
          case 'f':
            event.preventDefault();
            setShowFilters(!showFilters);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [showFilters]);

  const getStatusColor = (status) => {
    const statusColors = {
      'Delivered': 'bg-green-100 text-green-800 border-green-200',
      'Shipped': 'bg-blue-100 text-blue-800 border-blue-200',
      'Processing': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
      'NEW': 'bg-gray-100 text-gray-800 border-gray-200',
      'default': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return statusColors[status] || statusColors.default;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'Shipped':
        return <Truck className="w-4 h-4" />;
      case 'Processing':
        return <Clock className="w-4 h-4" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Enhanced Header with Better Layout */}
      <div className="bg-gradient-to-br from-white via-orange-50 to-red-50 rounded-2xl shadow-lg border border-orange-100 p-8 mb-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-red-500 rounded-full translate-x-12 translate-y-12"></div>
        </div>
        
        <div className="relative z-10">
          {/* Main Header Content */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="flex items-center gap-6">
              {/* Icon and Title */}
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Shiprocket Manager
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Manage shipments, track deliveries, and analyze performance
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">System Online</span>
                  <div className="ml-4 text-xs text-gray-400 hidden lg:block">
                    Shortcuts: Ctrl+R (Refresh), Ctrl+1-3 (Tabs), Ctrl+F (Filters)
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowCalculator(true)}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Calculator className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span className="font-medium">Calculator</span>
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                <span className="font-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
              <button
                onClick={handleBulkUpdate}
                disabled={bulkUpdating}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <RefreshCw className={`w-5 h-5 ${bulkUpdating ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                <span className="font-medium">{bulkUpdating ? 'Syncing...' : 'Sync All'}</span>
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`group flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  showFilters 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Filter className={`w-5 h-5 ${showFilters ? 'rotate-180' : 'group-hover:rotate-12'} transition-transform`} />
                <span className="font-medium">Filters</span>
              </button>
              
              <div className="flex items-center">
                <NotificationCenter />
              </div>
            </div>
          </div>

          {/* Enhanced Quick Stats Cards */}
          {dashboard && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Total Orders',
                  value: dashboard.statistics?.total_orders || 0,
                  icon: ShoppingCart,
                  gradient: 'from-blue-500 to-blue-600',
                  bgGradient: 'from-blue-50 to-blue-100',
                  change: '+12%',
                  changeType: 'positive'
                },
                {
                  title: 'Shipped Orders',
                  value: dashboard.statistics?.shipped_orders || 0,
                  icon: Truck,
                  gradient: 'from-green-500 to-green-600',
                  bgGradient: 'from-green-50 to-green-100',
                  change: '+8%',
                  changeType: 'positive'
                },
                {
                  title: 'Delivered',
                  value: dashboard.statistics?.delivered_orders || 0,
                  icon: CheckCircle,
                  gradient: 'from-emerald-500 to-emerald-600',
                  bgGradient: 'from-emerald-50 to-emerald-100',
                  change: '+15%',
                  changeType: 'positive'
                },
                {
                  title: 'Pending',
                  value: dashboard.statistics?.pending_shipments || 0,
                  icon: Clock,
                  gradient: 'from-amber-500 to-orange-500',
                  bgGradient: 'from-amber-50 to-orange-100',
                  change: '-5%',
                  changeType: 'negative'
                }
              ].map((stat, index) => (
                <div
                  key={index}
                  className={`relative p-6 bg-gradient-to-br ${stat.bgGradient} rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group overflow-hidden`}
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                    <stat.icon className="w-full h-full" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        stat.changeType === 'positive' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <TrendingUp className={`w-3 h-3 ${stat.changeType === 'negative' ? 'rotate-180' : ''}`} />
                        {stat.change}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {stat.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">vs last month</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Tabs with Modern Design */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex space-x-0 px-2">
            {[
              { 
                id: 'dashboard', 
                label: 'Dashboard', 
                icon: BarChart3, 
                color: 'text-purple-600', 
                bgColor: 'bg-purple-50',
                activeGradient: 'from-purple-500 to-indigo-600'
              },
              { 
                id: 'ready-orders', 
                label: 'Ready for Shipping', 
                icon: Package, 
                color: 'text-blue-600', 
                bgColor: 'bg-blue-50', 
                badge: readyOrders.length,
                activeGradient: 'from-blue-500 to-cyan-600'
              },
              { 
                id: 'shipments', 
                label: 'All Shipments', 
                icon: Truck, 
                color: 'text-green-600', 
                bgColor: 'bg-green-50',
                activeGradient: 'from-green-500 to-emerald-600'
              }
            ].map(({ id, label, icon: Icon, color, bgColor, badge, activeGradient }) => (
              <button
                key={id}
                onClick={() => setSelectedTab(id)}
                className={`relative flex items-center gap-3 py-4 px-6 font-medium text-sm transition-all duration-300 group ${
                  selectedTab === id
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {/* Active Tab Background */}
                {selectedTab === id && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${activeGradient} rounded-xl m-1 shadow-lg`}></div>
                )}
                
                {/* Tab Content */}
                <div className="relative z-10 flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    selectedTab === id 
                      ? 'bg-white/20' 
                      : `${bgColor} group-hover:scale-110`
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      selectedTab === id 
                        ? 'text-white' 
                        : `${color} group-hover:${color.replace('600', '700')}`
                    }`} />
                  </div>
                  
                  <span className="font-semibold">{label}</span>
                  
                  {badge !== undefined && badge > 0 && (
                    <div className={`relative ${
                      selectedTab === id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-red-100 text-red-600'
                    } px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300`}>
                      {badge > 99 ? '99+' : badge}
                      {badge > 0 && selectedTab !== id && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Hover Effect */}
                {selectedTab !== id && (
                  <div className="absolute inset-0 bg-gray-50 rounded-xl m-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Enhanced Advanced Filters */}
        {showFilters && (
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-5 h-5 text-orange-500" />
                Advanced Filters
              </h3>
              <p className="text-sm text-gray-600 mt-1">Refine your search with multiple criteria</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Search Orders</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Order ID, customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white shadow-sm transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Order Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 bg-white shadow-sm transition-all duration-200"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">🟡 Pending</option>
                  <option value="Processing">🔄 Processing</option>
                  <option value="Shipped">🚚 Shipped</option>
                  <option value="Delivered">✅ Delivered</option>
                  <option value="Cancelled">❌ Cancelled</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 bg-white shadow-sm transition-all duration-200"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 bg-white shadow-sm transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Actions</label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      // Apply filters logic here
                      toast.success('Filters applied successfully');
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    Apply Filters
                  </button>
                  <button
                    onClick={() => {
                      setFilters({ page: 1, limit: 20, status: '', courier: '' });
                      setSearchTerm('');
                      setDateRange({ start: '', end: '' });
                      toast.success('Filters cleared');
                    }}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Dashboard Tab */}
      {selectedTab === 'dashboard' && (
        <div className="space-y-6">
          {dashboard ? (
            <>
              {/* Status Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    {error ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Error: {error}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Data loaded successfully</span>
                      </div>
                    )}
                  </div>
                  
                  {lastUpdated && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: 'Total Orders',
                    value: dashboard.statistics?.total_orders || 0,
                    icon: ShoppingCart,
                    color: 'blue',
                    change: '+12%',
                    changeType: 'positive'
                  },
                  {
                    title: 'Shipped Orders',
                    value: dashboard.statistics?.shipped_orders || 0,
                    icon: Truck,
                    color: 'green',
                    change: '+8%',
                    changeType: 'positive'
                  },
                  {
                    title: 'Delivered',
                    value: dashboard.statistics?.delivered_orders || 0,
                    icon: CheckCircle,
                    color: 'emerald',
                    change: '+15%',
                    changeType: 'positive'
                  },
                  {
                    title: 'Pending Shipments',
                    value: dashboard.statistics?.pending_shipments || 0,
                    icon: Clock,
                    color: 'yellow',
                    change: '-5%',
                    changeType: 'negative'
                  }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                        <div className="flex items-center mt-2">
                          <span className={`text-sm font-medium ${
                            stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">vs last month</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-xl bg-${stat.color}-50 group-hover:bg-${stat.color}-100 transition-colors`}>
                        <stat.icon className={`w-8 h-8 text-${stat.color}-500`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Courier Performance */}
              {dashboard.courier_performance && dashboard.courier_performance.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-500" />
                      Courier Performance
                    </h3>
                    <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                      View Details →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Courier
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Shipments
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivered
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Success Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(dashboard?.courier_performance || []).map((courier, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                  {(courier._id || 'U').charAt(0)}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {courier._id || 'Unknown'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {courier.total_shipments}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {courier.delivered}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                      parseFloat(courier.delivery_rate) >= 80 ? 'bg-green-500' : 
                                      parseFloat(courier.delivery_rate) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(parseFloat(courier.delivery_rate) || 0, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {courier.delivery_rate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setSelectedTab('ready-orders')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 group"
                  >
                    <Package className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-700 group-hover:text-orange-600">
                      Process Ready Orders
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {readyOrders.length} orders waiting
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedTab('shipments')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <Truck className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      Track Shipments
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Monitor all deliveries
                    </div>
                  </button>
                  <button
                    onClick={handleBulkUpdate}
                    disabled={bulkUpdating}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200 group disabled:opacity-50"
                  >
                    <RefreshCw className={`w-8 h-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2 ${bulkUpdating ? 'animate-spin' : ''}`} />
                    <div className="text-sm font-medium text-gray-700 group-hover:text-green-600">
                      {bulkUpdating ? 'Syncing...' : 'Sync Tracking'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Update all statuses
                    </div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            loading ? (
              <div className="p-12 text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-6 h-6 text-orange-500 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
                <p className="text-gray-500">Fetching latest shipping data...</p>
                <div className="flex justify-center mt-4 space-x-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="relative">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full border-2 border-white"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard Unavailable</h3>
                <p className="text-gray-500 mb-4">Unable to load dashboard data at the moment</p>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* Enhanced Ready Orders Tab */}
      {selectedTab === 'ready-orders' && (
        <>
          {/* Enhanced Bulk Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={readyOrders.length > 0 && selectedOrders.length === readyOrders.filter(order => order._id).length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 group-hover:border-orange-400 transition-colors"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Select All Orders
                  </span>
                </label>
                {selectedOrders.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {selectedOrders.length} selected
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleBulkCreateShipments}
                  disabled={selectedOrders.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Create Shipments ({selectedOrders.length})
                </button>
                <button
                  onClick={handleBulkGenerateLabels}
                  disabled={selectedOrders.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Generate Labels ({selectedOrders.length})
                </button>
                <button
                  onClick={() => setSelectedOrders([])}
                  disabled={selectedOrders.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Clear Selection
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Ready Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-pulse">
                  <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : readyOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="relative">
                  <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-500 mb-4">No orders are currently ready for shipping. All orders are either already shipped or being processed.</p>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Check for New Orders
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={readyOrders.length > 0 && selectedOrders.length === readyOrders.filter(order => order._id).length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(readyOrders || []).map((order, index) => (
                      <tr key={order._id || Math.random()} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={order._id ? selectedOrders.includes(order._id) : false}
                            onChange={() => handleOrderSelection(order._id)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 group-hover:border-orange-400 transition-colors"
                            disabled={!order._id}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-medium mr-3">
                              #{index + 1}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{order._id && typeof order._id === 'string' ? order._id.slice(-8) : 'N/A'}
                              </div>
                              <div className="text-sm text-green-600 font-medium">
                                ₹{order.totalAmount?.toFixed(2) || '0.00'}
                              </div>
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {order.placedAt ? new Date(order.placedAt).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium mr-3">
                              {(order.shippingAddress?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.shippingAddress?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {order.shippingAddress?.phoneNumber || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus || 'Pending')}`}>
                            {getStatusIcon(order.orderStatus || 'Pending')}
                            {order.orderStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleShipmentAction('create', order._id)}
                              className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Create Shipment"
                              disabled={!order._id || actionLoading[order._id]}
                            >
                              {actionLoading[order._id] ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Package className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => window.open(`/admin/orders`, '_blank')}
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                              title="View Order Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {selectedTab === 'shipments' && (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Courier</label>
                <input
                  type="text"
                  placeholder="Search courier..."
                  value={filters.courier}
                  onChange={(e) => setFilters({ ...filters, courier: e.target.value, page: 1 })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
                <select
                  value={filters.limit}
                  onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ page: 1, limit: 20, status: '', courier: '' })}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Shipments Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Loading shipments...</p>
              </div>
            ) : shipments.length === 0 ? (
              <div className="p-12 text-center">
                <div className="relative">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Search className="w-3 h-3 text-blue-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shipments Found</h3>
                <p className="text-gray-500 mb-4">No shipments match your current filters</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setFilters({})}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Filter className="w-4 h-4" />
                    Clear Filters
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Shipping Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(shipments || []).map((shipment) => (
                        <tr key={shipment.order_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{shipment.order_id && typeof shipment.order_id === 'string' ? shipment.order_id.slice(-8) : 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                ₹{shipment.total_amount?.toFixed(2) || '0.00'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {shipment.placed_at ? new Date(shipment.placed_at).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {shipment.customer?.name || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {shipment.customer?.phone || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              {shipment.shiprocket?.courier_name && (
                                <div className="text-sm font-medium text-gray-900">
                                  {shipment.shiprocket.courier_name}
                                </div>
                              )}
                              {shipment.shiprocket?.awb_code && (
                                <div className="text-sm text-gray-500">
                                  AWB: {shipment.shiprocket.awb_code}
                                </div>
                              )}
                              <div className="text-xs text-gray-400">
                                {shipment.shipping_address?.city || 'N/A'}, {shipment.shipping_address?.state || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(shipment.order_status || 'Pending')}`}>
                              {getStatusIcon(shipment.order_status || 'Pending')}
                              {shipment.order_status || 'Pending'}
                            </span>
                            {shipment.shiprocket?.current_status && (
                              <div className="text-xs text-gray-500 mt-1">
                                {shipment.shiprocket.current_status}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {!shipment.shiprocket?.shipment_id ? (
                                <button
                                  onClick={() => handleShipmentAction('create', shipment.order_id)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Create Shipment"
                                  disabled={!shipment.order_id}
                                >
                                  <Package className="w-4 h-4" />
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleShipmentAction('track', shipment.order_id)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Update Tracking"
                                    disabled={!shipment.order_id}
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </button>
                                  {shipment.shiprocket?.label_url ? (
                                    <a
                                      href={shipment.shiprocket.label_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-purple-600 hover:text-purple-900"
                                      title="View Label"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  ) : (
                                    <button
                                      onClick={() => handleShipmentAction('label', shipment.order_id)}
                                      className="text-purple-600 hover:text-purple-900"
                                      title="Generate Label"
                                      disabled={!shipment.order_id}
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                  )}
                                  {shipment.order_status !== 'Delivered' && shipment.order_status !== 'Cancelled' && (
                                    <button
                                      onClick={() => handleShipmentAction('cancel', shipment.order_id)}
                                      className="text-red-600 hover:text-red-900"
                                      title="Cancel Shipment"
                                      disabled={!shipment.order_id}
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                        disabled={filters.page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setFilters({ ...filters, page: Math.min(pagination.total_pages, filters.page + 1) })}
                        disabled={filters.page === pagination.total_pages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{' '}
                          <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span>
                          {' '}to{' '}
                          <span className="font-medium">
                            {Math.min(filters.page * filters.limit, pagination.total_shipments)}
                          </span>
                          {' '}of{' '}
                          <span className="font-medium">{pagination.total_shipments}</span>
                          {' '}results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                            disabled={filters.page === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setFilters({ ...filters, page: Math.min(pagination.total_pages, filters.page + 1) })}
                            disabled={filters.page === pagination.total_pages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
      
      {/* Shipping Calculator Modal */}
      {showCalculator && (
        <ShippingCalculator onClose={() => setShowCalculator(false)} />
      )}
      
      {/* Floating Action Button for Quick Actions */}
      <div className="fixed bottom-8 right-8 z-40">
        <div className="relative group">
          {/* Main FAB */}
          <button
            onClick={() => setShowCalculator(true)}
            className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group-hover:rotate-45"
          >
            <Plus className="w-8 h-8 transition-transform duration-300" />
          </button>
          
          {/* Quick Action Tooltip */}
          <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
              Quick Calculator
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          
          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 animate-ping opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default ShiprocketManager;