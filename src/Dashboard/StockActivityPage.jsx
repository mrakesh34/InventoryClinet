import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiTrendingUp, HiTrendingDown, HiRefresh, HiFilter, HiX, HiDownload } from 'react-icons/hi';
import { useSearchParams } from 'react-router-dom';
import { exportToCSV } from '../utils/csvExport';
import API_BASE from '../utils/api';

const typeConfig = {
  stock_in: {
    label: 'Stock In',
    icon: HiTrendingUp,
    row: 'bg-green-50/40',
    badge: 'bg-green-100 text-green-700',
    arrow: 'text-green-600',
    emoji: '📥',
  },
  stock_out: {
    label: 'Stock Out',
    icon: HiTrendingDown,
    row: 'bg-red-50/40',
    badge: 'bg-red-100 text-red-700',
    arrow: 'text-red-600',
    emoji: '📤',
  },
};

const StockActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');   // all | stock_in | stock_out
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 30;

  // Read optional vendor filter from URL query params
  const [searchParams, setSearchParams] = useSearchParams();
  const vendorId = searchParams.get('vendor');
  const vendorName = searchParams.get('name');

  const fetchActivity = async (p = 1, f = 'all', vid = vendorId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bookstore-token');
      const typeParam = f !== 'all' ? `&type=${f}` : '';
      const vendorParam = vid ? `&vendorId=${vid}` : '';
      const res = await fetch(
        `${API_BASE}/stock-activity?page=${p}&limit=${LIMIT}${typeParam}${vendorParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to fetch activity');
      const data = await res.json();
      setActivities(data.activities);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message || 'Error loading activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchActivity(page, filter, vendorId); }, [page, filter, vendorId]);

  const handleFilterChange = (f) => {
    setFilter(f);
    setPage(1);
  };

  const clearVendorFilter = () => {
    setSearchParams({});
    setPage(1);
  };

  const totalPages = Math.ceil(total / LIMIT);
  const stockInCount  = activities.filter(a => a.type === 'stock_in').length;
  const stockOutCount = activities.filter(a => a.type === 'stock_out').length;

  const handleExportCSV = () => {
    exportToCSV(
      activities,
      'stock_activity',
      [
        { key: 'type',        label: 'Type' },
        { key: 'bookTitle',   label: 'Book Title' },
        { key: 'quantity',    label: 'Quantity' },
        { key: 'stockBefore', label: 'Stock Before' },
        { key: 'stockAfter',  label: 'Stock After' },
        { key: 'performedBy', label: 'Performed By' },
        { key: 'note',        label: 'Note' },
        { key: 'createdAt',   label: 'Date' },
      ]
    );
  };

  return (
    <div className="w-full px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📋 Stock Activity</h1>
          <p className="text-gray-500 mt-1">Full history of stock changes — admin restocks and user purchases.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={activities.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
          >
            <HiDownload className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => fetchActivity(page, filter, vendorId)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition-colors"
          >
            <HiRefresh className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Vendor filter banner */}
      {vendorId && vendorName && (
        <div className="flex items-center gap-3 mb-6 px-5 py-3.5 bg-violet-50 border border-violet-200 rounded-2xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {vendorName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-violet-800">Filtered by vendor: <span className="font-bold">{vendorName}</span></p>
            <p className="text-xs text-violet-500">Showing stock activity for this vendor's books only</p>
          </div>
          <button
            onClick={clearVendorFilter}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-violet-300 text-violet-700 rounded-lg text-xs font-semibold hover:bg-violet-50 transition-colors"
          >
            <HiX className="w-3.5 h-3.5" /> Clear Filter
          </button>
        </div>
      )}

      {/* Summary cards (from current page) */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Total Events</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{total}</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4">
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Stock In (this page)</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{stockInCount}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
          <p className="text-xs text-red-600 font-semibold uppercase tracking-wide">Stock Out (this page)</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stockOutCount}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5">
        <HiFilter className="w-4 h-4 text-gray-400" />
        {[
          { key: 'all',      label: 'All Activity' },
          { key: 'stock_in', label: '📥 Stock In (Admin)' },
          { key: 'stock_out',label: '📤 Stock Out (Purchase)' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filter === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-sm">No activity recorded yet.</p>
              <p className="text-xs mt-1">Activity will appear here when stock is added or books are purchased.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-100">
                <tr>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Book</th>
                  <th className="px-5 py-4">Qty</th>
                  <th className="px-5 py-4">Stock Before → After</th>
                  <th className="px-5 py-4">Performed By</th>
                  <th className="px-5 py-4">Note</th>
                  <th className="px-5 py-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activities.map(act => {
                  const cfg = typeConfig[act.type] || typeConfig.stock_in;
                  const Icon = cfg.icon;
                  const date = new Date(act.createdAt);
                  return (
                    <tr key={act._id} className={`hover:brightness-95 transition-all ${cfg.row}`}>
                      {/* Type */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badge}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Book */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          {act.book?.imageURL ? (
                            <img src={act.book.imageURL} alt=""
                              className="w-8 h-11 object-cover rounded-lg shadow-sm"
                              onError={e => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="w-8 h-11 bg-gray-100 rounded-lg flex items-center justify-center text-base">📚</div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800 max-w-[160px] truncate">{act.bookTitle}</p>
                            {act.book?.category && (
                              <p className="text-xs text-gray-400">{act.book.category}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Qty */}
                      <td className="px-5 py-4">
                        <span className={`font-bold text-base ${act.type === 'stock_in' ? 'text-green-600' : 'text-red-500'}`}>
                          {act.type === 'stock_in' ? '+' : '−'}{act.quantity}
                        </span>
                      </td>

                      {/* Before → After */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="px-2 py-0.5 bg-gray-100 rounded font-bold text-gray-600">{act.stockBefore}</span>
                          <span className={`font-bold ${cfg.arrow}`}>→</span>
                          <span className={`px-2 py-0.5 rounded font-bold ${act.stockAfter === 0 ? 'bg-red-100 text-red-700' : act.stockAfter <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                            {act.stockAfter}
                          </span>
                        </div>
                      </td>

                      {/* Performed by */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {act.performedBy?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-xs text-gray-600 max-w-[130px] truncate">{act.performedBy}</span>
                        </div>
                      </td>

                      {/* Note */}
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-500 max-w-[180px] truncate block" title={act.note}>
                          {act.note || '—'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-xs font-medium text-gray-700">{date.toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 disabled:opacity-40 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">Page {page} / {totalPages}</span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 disabled:opacity-40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default StockActivityPage;
