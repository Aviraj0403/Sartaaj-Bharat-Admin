import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';

const AdminOrderDetails = ({ order, onClose, loading }) => {
  const receiptRef = useRef();

const handlePrint = () => {
  const tableHTML = receiptRef.current.querySelector("table")?.outerHTML || "";
  const finalAmount = order.totalAmount - (order.discountAmount || 0);

  const printWindow = window.open("", "_blank", "width=900,height=650");

  printWindow.document.write(`
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: "Segoe UI", Arial, sans-serif; padding:22px; color:#222; }
          .header { display:flex; align-items:center; gap:16px; border-bottom:2px dashed #f97316; padding-bottom:10px; margin-bottom:14px; }
          .header img { width:85px; }
          .header h1 { margin:0; font-size:22px; color:#f97316; }
          .header p { margin:0; font-size:12px; color:#555; }
          .box { border:1px solid #ddd; padding:8px 10px; margin-bottom:10px; }
          .box-title { font-size:13px; font-weight:700; margin-bottom:6px; }
          .grid { display:grid; grid-template-columns:1fr 1fr; gap:4px 14px; font-size:12.5px; line-height:1.4; }
          .grid p { margin:0; }
          .grid p span { font-weight:700; } /* make labels bold */
          table { width:100%; border-collapse:collapse; margin-top:10px; font-size:12.5px; }
          table th, table td { border:1px solid #ddd; padding:6px; }
          table th { background:#fff3e8; font-weight:700; }
          .footer { margin-top:24px; border-top:1px dashed #ccc; padding-top:8px; text-align:center; font-size:11.5px; color:#666; }
          button { display:none !important; }
          .total-box { border:1px solid #ddd; padding:8px 10px; font-size:13px; font-weight:700; margin-top:10px; text-align:right; }
        </style>
      </head>
      <body>
        <div class="header">
          <img id="logo" src="https://gurmeetkaurstore.com/logo-cosmetic2.jpg" />
          <div>
            <h1>Gurmeet Kaur Store</h1>
            <p>Order Receipt / Tax Invoice</p>
          </div>
        </div>

        <div class="box">
          <div class="box-title">Order Details</div>
          <div class="grid">
            <p><span>Order ID:</span> ${order._id}</p>
            <p><span>Status:</span> ${order.orderStatus}</p>
            <p><span>Date:</span> ${new Date(order.createdAt).toLocaleString()}</p>
            <p><span>Payment:</span> ${order.paymentMethod}</p>
            <p><span>Payment Status:</span> ${order.paymentStatus}</p>
          </div>
        </div>

        <div class="box">
          <div class="box-title">Shipping Information</div>
          <div class="grid">
            <p><span>Name:</span> ${order.shippingAddress?.name || ""}</p>
            <p><span>Phone:</span> ${order.shippingAddress?.phoneNumber || ""}</p>
            <p><span>Street:</span> ${order.shippingAddress?.street || ""}</p>
            <p><span>City/State:</span> ${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${order.shippingAddress?.postalCode || ""}</p>
            <p><span>Country:</span> ${order.shippingAddress?.country || ""}</p>
            <p><span>Email:</span> ${order.user?.email || ""}</p>
          </div>
        </div>

        ${tableHTML}

        <div class="total-box">
          Total Amount: ₹${finalAmount.toFixed(2)}
          ${order.discountAmount > 0 ? `(Saved ₹${order.discountAmount.toFixed(2)})` : ""}
        </div>

        <div class="footer">
          Thank you for shopping with Gurmeet Kaur Store<br/>
          support@gurmeetkaurstore.com
        </div>

        <script>
          const logo = document.getElementById("logo");
          logo.onload = function() { window.print(); window.close(); };
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