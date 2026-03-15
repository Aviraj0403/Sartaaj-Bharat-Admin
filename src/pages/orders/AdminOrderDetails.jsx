import React, { useRef, useState } from 'react';
import { X, Printer, Truck, Package, MapPin, Clock, CheckCircle, XCircle, RefreshCw, Download, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  createShipment,
  generateShippingLabel,
  trackOrderShipment,
  cancelShipment
} from '../../services/ShiprocketApi';

const AdminOrderDetails = ({ order, onClose, loading }) => {
  const receiptRef = useRef();
  const [shippingLoading, setShippingLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);

  // Handle shipment actions
  const handleShipmentAction = async (action) => {
    try {
      setShippingLoading(true);
      let response;
      
      switch (action) {
        case 'create':
          response = await createShipment(order._id);
          toast.success('Shipment created successfully');
          break;
        case 'label':
          response = await generateShippingLabel(order._id);
          if (response.label_url) {
            window.open(response.label_url, '_blank');
          }
          toast.success('Shipping label generated');
          break;
        case 'track':
          response = await trackOrderShipment(order._id);
          setTrackingData(response.tracking);
          toast.success('Tracking updated');
          break;
        case 'cancel':
          if (window.confirm('Are you sure you want to cancel this shipment?')) {
            response = await cancelShipment(order._id);
            toast.success('Shipment cancelled');
          }
          break;
        default:
          return;
      }
      
      // Refresh order data if needed
      if (response && window.location.reload) {
        // You might want to call a refresh function here instead
      }
    } catch (error) {
      console.error(`Error ${action} shipment:`, error);
      toast.error(`Failed to ${action} shipment: ${error.message}`);
    } finally {
      setShippingLoading(false);
    }
  };

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

const handlePrint = () => {
  const tableHTML =
    receiptRef.current.querySelector("table")?.outerHTML || "";
  const finalAmount = order.totalAmount - (order.discountAmount || 0);

  const printWindow = window.open("", "_blank", "width=900,height=650");

  printWindow.document.write(`
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>

          /* REMOVE DEFAULT PRINT MARGIN */
          @page {
            margin: 0;
          }

          body {
            margin: 0;
            padding: 16px 22px;
            font-family: "Segoe UI", Arial, sans-serif;
            color: #222;
            font-size: 18x;
            font-weight: 800;
          }

          /* HEADER */
          .header {
            display: flex;
            align-items: center;
            gap: 14px;
            border-bottom: 2px dashed #f97316;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }

          .header img {
            width: 70px;
            height: auto;
          }
            .header-text {
  display: flex;
  flex-direction: column;
  justify-content: center; /* vertical center */
  align-items: flex-start; /* left aligned text */
}


          .header-text h1 {
            margin: 0;
            font-size: 20px;
            color: #f97316;
            font-weight: 800;
          }

          .header-text p {
            margin: 2px 0 0;
            font-size: 18px;
            color: #555;
            font-weight: 700;
          }

          /* BOX */
          .box {
            border: 1px solid #ddd;
            padding: 10px;
            margin-bottom: 12px;
          }

          .box-title {
            font-size: 18px;
            font-weight: 800;
            margin-bottom: 6px;
          }

          /* GRID */
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px 14px;
            font-size: 18px;
            line-height: 1.5;
          }

          .grid p {
            margin: 0;
            font-size: 20px;
            font-weight: 700;
          }

          /* TABLE */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 18px;
            font-weight: 700;
          }

          table th,
          table td {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 18px;
          }

          table th {
            background: #fff3e8;
          }

          /* TOTAL */
          .total-box {
            border: 1px solid #ddd;
            padding: 10px;
            font-size: 20px;
            font-weight: 800;
            margin-top: 12px;
            text-align: right;
          }

          /* WARNING */
          .warning {
            margin-top: 16px;
            padding: 10px;
            background: #fde2e7;
            color: #b91c1c;
            text-align: center;
            font-weight: 800;
            font-size: 20px;
            letter-spacing: 1px;
            border: 1px dashed #f43f5e;
            border-radius: 6px;
          }

          /* FOOTER */
          .footer {
            position: fixed;
            bottom: 10px;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 16px;
            font-weight: 800;
            color: #444;
            line-height: 1.5;
          }

          button {
            display: none !important;
          }

        </style>
      </head>

      <body>
        <!-- HEADER -->
        <div class="header">
          <img id="logo" src="https://gurmeetkaurstore.com/sb.png" />
          <div class="header-text">
            <h1>Gurmeet Kaur Store</h1>
            <p>Order Receipt / Tax Invoice</p>
          </div>
        </div>
        <!-- SHIPPING -->
        <div class="box">
          <div class="box-title">Shipping Information</div>
          <div class="grid">
            <p>Name: ${order.shippingAddress?.name || ""}</p>
            <p>Phone: ${order.shippingAddress?.phoneNumber || ""}</p>
            <p>Address: ${order.shippingAddress?.street || ""}</p>
            <p>City/State: ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${order.shippingAddress?.postalCode || ""}</p>
            <p>Country: ${order.shippingAddress?.country || ""}</p>
            <p>Email: ${order.user?.email || ""}</p>
          </div>
        </div>
          <!-- ORDER DETAILS -->
        <div class="box">
          <div class="box-title">Order Details</div>
          <div class="grid">
            <p>Order ID: GUR-${order._id.slice(-5)}</p>
            <p>Status: ${order.orderStatus}</p>
            <p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
            <p>Payment: ${order.paymentMethod}</p>
            <p>Payment Status: ${order.paymentStatus}</p>
          </div>
        </div>

        <!-- ITEMS -->
        ${tableHTML}

        <!-- TOTAL -->
        <div class="total-box">
          Total Amount: ₹${finalAmount.toFixed(2)}
          ${order.discountAmount > 0 ? `(Saved ₹${order.discountAmount.toFixed(2)})` : ""}
        </div>

        <!-- WARNING -->
        <div class="warning">
          ⚠ FRAGILE GLASS HANDLE WITH CARE ⚠
        </div>

        <!-- FOOTER -->
        <div class="footer">
          11021, 5A Block WEA, Sat Nagar, Karol Bagh, Delhi – 110005 <br/>
          📞 +91 9999398494 &nbsp; | &nbsp; ✉ gurmeetkaurstore@gmail.com
        </div>

        <script>
          const logo = document.getElementById("logo");
          logo.onload = function () {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};





  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-3xl mx-4">
          <div className="text-center text-gray-500 py-10 sm:py-20">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Order Not Found</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-600 hover:text-gray-800 transition transform hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 text-center">No order details available.</p>
        </div>
      </div>
    );
  }

  const finalAmount = order.totalAmount - (order.discountAmount || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={receiptRef}
        className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-bold text-orange-600">Order Receipt</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-600 hover:text-gray-800 transition transform hover:scale-110"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Order Details */}
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Order Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <p><span className="font-medium">Order ID:</span> {order._id}</p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    order.orderStatus === 'Delivered'
                      ? 'bg-green-100 text-green-600 border border-green-200'
                      : order.orderStatus === 'Cancelled'
                      ? 'bg-red-100 text-red-600 border border-red-200'
                      : 'bg-orange-100 text-orange-600 border border-orange-200'
                  }`}
                >
                  {order.orderStatus || 'Pending'}
                </span>
              </div>
              <p><span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleString()}</p>
              <p>
                <span className="font-medium">Payment Status:</span>{' '}
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    order.paymentStatus === 'Paid'
                      ? 'bg-green-100 text-green-600 border border-green-200'
                      : 'bg-red-100 text-red-600 border border-red-200'
                  }`}
                >
                  {order.paymentStatus || 'N/A'}
                </span>
              </p>
              <p><span className="font-medium">Payment Method:</span> {order.paymentMethod || 'N/A'}</p>
            </div>
          </div>

          {/* Shipping Information */}
          {order.shippingAddress && (
            <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Shipping Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>{order.shippingAddress.name || 'N/A'}</p>
                <p>{order.shippingAddress.street || 'N/A'}</p>
                <p>
                  {order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'} -{' '}
                  {order.shippingAddress.postalCode || 'N/A'}
                </p>
                <p>{order.shippingAddress.country || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {order.user?.email || 'N/A'}</p>
                <p><span className="font-medium">Phone:</span> {order.shippingAddress.phoneNumber || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Shiprocket Shipping Management */}
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" />
                Shipping Management
              </h3>
              {order.shipping?.shiprocket?.current_status && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.shipping.shiprocket.current_status)}`}>
                  {getStatusIcon(order.shipping.shiprocket.current_status)}
                  {order.shipping.shiprocket.current_status}
                </span>
              )}
            </div>

            {order.shipping?.shiprocket ? (
              <div className="space-y-4">
                {/* Shipping Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p><span className="font-medium">Courier:</span> {order.shipping.shiprocket.courier_name || 'N/A'}</p>
                    <p><span className="font-medium">AWB Code:</span> {order.shipping.shiprocket.awb_code || 'N/A'}</p>
                    <p><span className="font-medium">Shipment ID:</span> {order.shipping.shiprocket.shipment_id || 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-medium">Weight:</span> {order.shipping.weight || 'N/A'} kg</p>
                    <p><span className="font-medium">Method:</span> {order.shipping.method || 'N/A'}</p>
                    <p><span className="font-medium">Status:</span> {order.shipping.shiprocket.shipment_status || 'N/A'}</p>
                  </div>
                </div>

                {/* Shipping Actions */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleShipmentAction('track')}
                    disabled={shippingLoading}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${shippingLoading ? 'animate-spin' : ''}`} />
                    Update Tracking
                  </button>
                  
                  {order.shipping.shiprocket.label_url ? (
                    <a
                      href={order.shipping.shiprocket.label_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                    >
                      <Download className="w-3 h-3" />
                      View Label
                    </a>
                  ) : (
                    <button
                      onClick={() => handleShipmentAction('label')}
                      disabled={shippingLoading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 disabled:opacity-50"
                    >
                      <Download className="w-3 h-3" />
                      Generate Label
                    </button>
                  )}

                  {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                    <button
                      onClick={() => handleShipmentAction('cancel')}
                      disabled={shippingLoading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50"
                    >
                      <XCircle className="w-3 h-3" />
                      Cancel Shipment
                    </button>
                  )}
                </div>

                {/* Tracking History */}
                {trackingData?.tracking_history && trackingData.tracking_history.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">Tracking History</h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {trackingData.tracking_history.map((update, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium">{update.current_status}</p>
                            <p className="text-gray-500">{update.activity}</p>
                            <p className="text-gray-400">{new Date(update.date).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Package className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-3">No shipment created yet</p>
                {order.orderStatus === 'Processing' && (
                  <button
                    onClick={() => handleShipmentAction('create')}
                    disabled={shippingLoading}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Package className="w-4 h-4" />
                    {shippingLoading ? 'Creating...' : 'Create Shipment'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-gray-600">
                <thead>
                  <tr className="bg-orange-50">
                    <th className="py-2 px-2 sm:px-4 text-left">Item</th>
                    <th className="py-2 px-2 sm:px-4 text-left">Quantity</th>
                    <th className="py-2 px-2 sm:px-4 text-left">Unit</th>
                    <th className="py-2 px-2 sm:px-4 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-2 sm:px-4">{item.food?.name || item.selectedVariant?.name || 'Unknown'}</td>
                      <td className="py-2 px-2 sm:px-4">{item.quantity}</td>
                      <td className="py-2 px-2 sm:px-4">{item.selectedVariant?.size || 'N/A'}/{item.selectedVariant?.color }</td>
                      <td className="py-2 px-2 sm:px-4 text-right">
                        ₹{((item.selectedVariant?.price || item.food?.price || 0) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Total</h3>
            {order.discountAmount > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Original Total:</span>
                  <span className="line-through">₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base text-green-600 font-semibold">
                  <span>You Paid:</span>
                  <span>₹{finalAmount.toFixed(2)}</span>
                </div>
                <p className="text-right text-xs text-green-600">
                  You saved ₹{order.discountAmount.toFixed(2)}{' '}
                  {order.discountCode ? `(Code: ${order.discountCode})` : ''}
                </p>
              </div>
            ) : (
              <div className="flex justify-between text-sm sm:text-base text-orange-600 font-semibold">
                <span>Total Amount:</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
          <button
            onClick={onClose}
            className="flex items-center px-3 sm:px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            aria-label="Close order details"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            <Printer size={18} className="mr-2" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;