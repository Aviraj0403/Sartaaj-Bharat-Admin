import React, { useEffect, useState, useCallback, useRef } from 'react';
import Axios from '../../utils/Axios'; // same Axios instance
import { toast } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import PaymentDetails from './PaymentDetails';

const fetchOrphanedPayments = async (hours) => {
  try {
    const res = await Axios.get('/razorpay/orphaned-payments', { params: { hours } });
    return res.data; // { success, count, payments }
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Failed to load orphaned payments');
    return { success: false, payments: [] };
  }
};

const OrphanedPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [hours, setHours] = useState(1); // filter: older than X hours

  const mounted = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchOrphanedPayments(hours);
    if (res.success) {
      setPayments(res.payments);
    } else {
      setPayments([]);
    }
    setLoading(false);
  }, [hours]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      load();
    }
  }, [load]);

  const viewDetails = async (paymentId) => {
    setLoadingDetails(true);
    try {
      const res = await Axios.get('/razorpay/orders-with-payments', { params: { paymentId } });
      if (res.data.success && res.data.data?.length > 0) {
        setSelected(res.data.data[0]);
      } else {
        toast.error('Payment details not found');
        setSelected(null);
      }
    } catch (e) {
      toast.error('Failed to load details');
      setSelected(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h4 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Orphaned Payments
        </h4>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="number"
            min={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="border rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 w-24"
            disabled={loading}
          />
          <span className="text-gray-600">hours old</span>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading orphaned payments…</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12 text-gray-600">No orphaned payments found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gradient-to-r from-orange-100 to-orange-200">
              <tr>
                {['Payment ID', 'User', 'Amount', 'Razorpay Payment ID', 'Created At', 'Hours Old', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p, i) => (
                <tr
                  key={p.paymentId}
                  className={`hover:bg-orange-50 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{p.paymentId.slice(-8)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{p.userId?.name || 'Guest'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">₹{Number(p.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{p.razorpayPaymentId || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {new Date(p.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{p.hoursOld}</td>
                  <td className="px-4 py-3 text-sm flex justify-center">
                    <button
                      onClick={() => viewDetails(p.paymentId)}
                      className="text-gray-600 hover:text-gray-800 transition transform hover:scale-110"
                      aria-label="View details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {(loadingDetails || selected) && (
        <PaymentDetails
          payment={selected}
          onClose={() => setSelected(null)}
          loading={loadingDetails}
        />
      )}
    </div>
  );
};

export default OrphanedPayments;
