import React, { useState } from 'react';
import { Truck, Package, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from '../utils/Axios';

const QuickShipButton = ({ order, onUpdate, size = 'sm' }) => {
  const [loading, setLoading] = useState(false);

  const createShipment = async () => {
    if (!order?._id) {
      toast.error('Order ID not found');
      return;
    }

    // Check if order is in correct status
    if (order.orderStatus !== 'Processing' && order.orderStatus !== 'Pending') {
      toast.error('Order must be in Processing status to ship');
      return;
    }

    // Check if shipment already exists
    if (order.shipping?.shiprocket?.order_id) {
      toast.error('Shipment already created for this order');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/shipping/create-shipment/${order._id}`);
      
      if (response.data.success) {
        toast.success('🚚 Shipment created successfully!');
        onUpdate && onUpdate(); // Refresh order data
      } else {
        toast.error(response.data.message || 'Failed to create shipment');
      }
    } catch (error) {
      console.error('Create shipment error:', error);
      toast.error(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if already shipped or cancelled
  if (order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
    return null;
  }

  // Show different states based on shipping status
  if (order.shipping?.shiprocket?.order_id) {
    return (
      <div className={`flex items-center gap-1 ${size === 'sm' ? 'text-xs' : 'text-sm'} text-green-600`}>
        <Package className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>Shipped</span>
      </div>
    );
  }

  // Show create shipment button
  if (order.orderStatus === 'Processing' || order.orderStatus === 'Pending') {
    return (
      <button
        onClick={createShipment}
        disabled={loading}
        className={`flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors ${
          size === 'sm' ? 'text-xs' : 'text-sm'
        }`}
        title="Create Shiprocket shipment"
      >
        <Truck className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        {loading ? 'Creating...' : 'Ship Now'}
      </button>
    );
  }

  // Show status message for other states
  return (
    <div className={`flex items-center gap-1 ${size === 'sm' ? 'text-xs' : 'text-sm'} text-gray-500`}>
      <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>Not Ready</span>
    </div>
  );
};

export default QuickShipButton;