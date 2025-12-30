import React, { useEffect, useState } from 'react';
import axios from '../../utils/Axios';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import LeadDetailsModal from './LeadDetailsModal';

const AdminOrderLeads = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);

  // filters & pagination
  const [status, setStatus] = useState('all');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/orders/leads', {
        paymentStatus: status,
        page,
        limit,
        month: month || undefined,
        year: year || undefined,
      });

      setLeads(res.data.orderLeads || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, limit]);

  const applyFilters = () => {
    setPage(1);
    fetchLeads();
  };

  const clearFilters = () => {
    setStatus('all');
    setMonth('');
    setYear('');
    setPage(1);
    fetchLeads();
  };

  const badge = (s) =>
    s === 'Failed'
      ? 'bg-red-100 text-red-600 border border-red-200'
      : 'bg-orange-100 text-orange-600 border border-orange-200';

  return (
    <div className="p-6 bg-white rounded-xl shadow border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Order Leads</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Month</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Year</option>
          {Array.from({ length: 6 }, (_, i) => {
            const y = new Date().getFullYear() - i;
            return (
              <option key={y} value={y}>
                {y}
              </option>
            );
          })}
        </select>

        <div className="flex gap-2">
          <button
            onClick={applyFilters}
            className="flex-1 bg-orange-500 text-white rounded px-4 py-2 hover:bg-orange-600"
          >
            Apply
          </button>
          <button
            onClick={clearFilters}
            className="flex-1 bg-gray-300 rounded px-4 py-2"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading leads...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No leads found
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-orange-50">
              <tr>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-center">View</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((lead, i) => (
                <tr key={i} className="hover:bg-orange-50">
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${badge(lead.orderStatus)}`}>
                      {lead.orderStatus}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">
                    ₹{lead.amount} <span className="text-xs">{lead.currency}</span>
                  </td>
                  <td className="p-3">
                    {lead.shippingAddress?.phoneNumber || 'N/A'}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="p-2 rounded hover:bg-orange-100"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {pagination.currentPage} of {pagination.totalPages}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              <ChevronLeft />
            </button>

            <button
              onClick={() =>
                setPage((p) =>
                  Math.min(p + 1, pagination.totalPages)
                )
              }
              disabled={page === pagination.totalPages}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      )}

      {selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
};

export default AdminOrderLeads;
