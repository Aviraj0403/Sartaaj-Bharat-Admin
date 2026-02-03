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
  DollarSign
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

const ShiprocketManager = () => {
  const [shipments, setShipments] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
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
      const response = await getOrdersReadyForShipping({ page: 1, limit: 50 });
      setReadyOrders(Array.isArray(response.orders) ? response.orders : []);
    } catch (error) {
      console.error('Error fetching ready orders:', error);
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
      const response = await getAllShipments(filters);
      setShipments(Array.isArray(response.shipments) ? response.shipments : []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast.error('Failed to fetch shipments');
      setShipments([]);
      setPagination({});
    } finally {
      setLoading(false);
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

  // Handle shipment actions
  const handleShipmentAction = async (action, orderId) => {
    try {
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
    const validOrderIds = currentOrders
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
      {/* Enhanced Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shiprocket Manager</h1>
              <p className="text-gray-600 mt-1">Manage shipments, track deliveries, and analyze performance</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          {dashboard && (
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{dashboard.statistics?.total_orders || 0}</div>
                <div className="text-xs text-blue-500">Total Orders</div>
              </div>
              <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{dashboard.statistics?.shipped_orders || 0}</div>
                <div className="text-xs text-green-500">Shipped</div>
              </div>
              <div className="text-center px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{dashboard.statistics?.pending_shipments || 0}</div>
                <div className="text-xs text-yellow-500">Pending</div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleBulkUpdate}
              disabled={bulkUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 ${bulkUpdating ? 'animate-spin' : ''}`} />
              {bulkUpdating ? 'Updating...' : 'Sync All'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'ready-orders', label: 'Ready for Shipping', icon: Package },
            { id: 'shipments', label: 'All Shipments', icon: Truck }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {selectedTab === 'dashboard' && (
        <div className="space-y-6">
          {dashboard ? (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Orders</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {dashboard.statistics?.total_orders || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Truck className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Shipped Orders</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {dashboard.statistics?.shipped_orders || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Delivered</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {dashboard.statistics?.delivered_orders || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Pending Shipments</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {dashboard.statistics?.pending_shipments || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Courier Performance */}
              {dashboard.courier_performance && dashboard.courier_performance.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Courier Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Courier
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Shipments
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivered
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivery Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboard.courier_performance.map((courier, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {courier._id || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {courier.total_shipments}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {courier.delivered}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {courier.delivery_rate}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2 animate-pulse" />
              <p className="text-gray-500">Loading dashboard...</p>
            </div>
          )}
        </div>
      )}

      {/* Ready Orders Tab */}
      {selectedTab === 'ready-orders' && (
        <>
          {/* Bulk Actions */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={readyOrders.length > 0 && selectedOrders.length === readyOrders.filter(order => order._id).length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Select All ({selectedOrders.length} selected)
                  </span>
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkCreateShipments}
                  disabled={selectedOrders.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Create Shipments ({selectedOrders.length})
                </button>
                <button
                  onClick={handleBulkGenerateLabels}
                  disabled={selectedOrders.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  Generate Labels ({selectedOrders.length})
                </button>
              </div>
            </div>
          </div>

          {/* Ready Orders Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Loading ready orders...</p>
              </div>
            ) : readyOrders.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No orders ready for shipping</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={readyOrders.length > 0 && selectedOrders.length === readyOrders.filter(order => order._id).length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
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
                    {readyOrders.map((order) => (
                      <tr key={order._id || Math.random()} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={order._id ? selectedOrders.includes(order._id) : false}
                            onChange={() => handleOrderSelection(order._id)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            disabled={!order._id}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{order._id ? order._id.slice(-8) : 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ₹{order.totalAmount?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {order.placedAt ? new Date(order.placedAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.shippingAddress?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.shippingAddress?.phoneNumber || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus || 'Pending')}`}>
                            {getStatusIcon(order.orderStatus || 'Pending')}
                            {order.orderStatus || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleShipmentAction('create', order._id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Create Shipment"
                              disabled={!order._id}
                            >
                              <Package className="w-4 h-4" />
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
              <div className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No shipments found</p>
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
                      {shipments.map((shipment) => (
                        <tr key={shipment.order_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{shipment.order_id ? shipment.order_id.slice(-8) : 'N/A'}
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
    </div>
  );
};

export default ShiprocketManager;