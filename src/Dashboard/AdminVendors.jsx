import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  HiSearch, HiBadgeCheck, HiX, HiChartBar,
  HiTrendingUp, HiTrendingDown,
  HiShoppingBag, HiCheckCircle, HiBookOpen, HiRefresh, HiArchive,
} from 'react-icons/hi';
import API_BASE from '../utils/api';
import toast from 'react-hot-toast';

/* ─── Type Config ─────────────────────────────────────────────── */
const typeConfig = {
  stock_in:  { label: 'Stock In',  badge: 'bg-green-100 text-green-700', icon: HiTrendingUp,   sign: '+', cls: 'text-green-600' },
  stock_out: { label: 'Stock Out', badge: 'bg-red-100 text-red-700',     icon: HiTrendingDown, sign: '−', cls: 'text-red-500'   },
};

/* ─── Vendor Activity Modal ─────────────────────────────────── */
const VendorActivityModal = ({ vendor, onClose }) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('bookstore-token');
      const headers = { Authorization: `Bearer ${token}` };

      const [summaryRes, activityRes] = await Promise.all([
        fetch(`${API_BASE}/vendor/activity-summary`, { headers }),
        fetch(`${API_BASE}/stock-activity?limit=30&vendorId=${vendor._id}`, { headers }),
      ]);

      const summaries    = summaryRes.ok  ? await summaryRes.json()  : [];
      const activityData = activityRes.ok ? await activityRes.json() : { activities: [] };

      const vendorSummary = summaries.find(s => s._id === vendor._id) || {};
      setData({ ...vendorSummary, activities: activityData.activities || [] });
    } catch {
      toast.error('Failed to load vendor activity');
    } finally {
      setLoading(false);
    }
  }, [vendor._id]);

  useEffect(() => { load(); }, [load]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const deliveryRate = data?.ordersReceived > 0
    ? Math.round((data.ordersDelivered / data.ordersReceived) * 100)
    : 0;

  const modal = (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-violet-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold text-base">
              {vendor.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-base">{vendor.name}</h2>
              <p className="text-xs text-gray-500">{vendor.email}</p>
            </div>
            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded-full">
              <HiBadgeCheck className="w-3 h-3" /> Approved
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <HiRefresh className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-violet-100 text-gray-500 transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Modal Body ── */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-400 border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Overview</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                <div className="bg-blue-50 rounded-xl py-3 px-3 flex items-center gap-2.5">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <HiBookOpen className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-700 leading-none">{data?.totalBooks ?? 0}</p>
                    <p className="text-[10px] text-blue-400 font-semibold mt-0.5">Books</p>
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl py-3 px-3 flex items-center gap-2.5">
                  <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                    <HiShoppingBag className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-orange-600 leading-none">{data?.ordersReceived ?? 0}</p>
                    <p className="text-[10px] text-orange-400 font-semibold mt-0.5">Orders Received</p>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-xl py-3 px-3 flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                    <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-emerald-600 leading-none">{data?.ordersDelivered ?? 0}</p>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                      Delivered
                      {data?.ordersReceived > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-bold">
                          {deliveryRate}%
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl py-3 px-3 flex items-center gap-2.5">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <HiTrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-green-700 leading-none">+{data?.totalStockIn ?? 0}</p>
                    <p className="text-[10px] text-green-500 font-semibold mt-0.5">Stock Added</p>
                  </div>
                </div>
                {/* Total Available Stock */}
                <div className="bg-violet-50 rounded-xl py-3 px-3 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <div className="p-2 bg-violet-100 rounded-lg flex-shrink-0">
                    <HiArchive className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-violet-700 leading-none">{data?.totalAvailableStock ?? 0}</p>
                    <p className="text-[10px] text-violet-500 font-semibold mt-0.5">Available Stock</p>
                  </div>
                </div>
              </div>

              {/* Activity Table */}
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Stock Activity</p>
              {data?.activities?.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-2">📋</p>
                  <p className="text-sm">No stock activity recorded yet for this vendor.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Book</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {data.activities.map((act) => {
                        const cfg = typeConfig[act.type] || typeConfig.stock_in;
                        const Icon = cfg.icon;
                        return (
                          <tr key={act._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.badge}`}>
                                <Icon className="w-3 h-3" /> {cfg.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-700 text-xs max-w-[180px] truncate">{act.bookTitle}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-bold text-sm ${cfg.cls}`}>{cfg.sign}{act.quantity}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 font-mono text-[10px]">
                                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-bold">{act.stockBefore}</span>
                                <span className="text-gray-400">→</span>
                                <span className={`px-1.5 py-0.5 rounded font-bold ${
                                  act.stockAfter === 0 ? 'bg-red-100 text-red-700'
                                  : act.stockAfter <= 5 ? 'bg-orange-100 text-orange-600'
                                  : 'bg-green-100 text-green-700'
                                }`}>{act.stockAfter}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                              {new Date(act.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

/* ─── Main Component ─────────────────────────────────────────── */
const AdminVendors = () => {
  const [vendors, setVendors]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState('');
  const [revoking, setRevoking]           = useState(null);
  const [confirmRevoke, setConfirmRevoke] = useState(null);
  const [activeVendor, setActiveVendor]   = useState(null);  // vendor object for modal

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('bookstore-token');
      const res = await fetch(`${API_BASE}/vendor/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setVendors(await res.json());
      } else {
        setError('Failed to fetch vendors.');
      }
    } catch {
      setError('Network error fetching vendors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleRevokeVendor = async (vendorId, vendorName) => {
    setRevoking(vendorId);
    try {
      const token = localStorage.getItem('bookstore-token');
      const res = await fetch(`${API_BASE}/vendor/reject/${vendorId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(`Vendor access revoked for ${vendorName}`);
        setVendors((prev) => prev.filter((v) => v._id !== vendorId));
        if (expandedId === vendorId) setExpandedId(null);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to revoke vendor');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setRevoking(null);
      setConfirmRevoke(null);
    }
  };

  const openActivity  = (vendor)  => setActiveVendor(vendor);
  const closeActivity = ()        => setActiveVendor(null);

  const filtered = vendors.filter(
    (v) =>
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-6 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">⚠️ {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold text-gray-800">🏪 Manage Vendors</h1>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
            {vendors.length} active
          </span>
        </div>
        <p className="text-gray-500">
          View and manage all approved vendors. Click <strong>View Activity</strong> to see inline stats.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <span className="text-sm text-gray-500">
          {filtered.length} vendor{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">🏪</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No vendors found</h3>
          <p className="text-gray-400">
            {search ? 'No vendors match your search.' : 'No approved vendors yet. Approve applications first.'}
          </p>
        </div>
      )}

      {/* Vendor Cards */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((vendor) => {
            return (
              <div
                key={vendor._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
              >
                {/* ── Vendor Row ── */}
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {vendor.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{vendor.name}</p>
                        <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 rounded-full">
                          <HiBadgeCheck className="w-3 h-3" /> Approved
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{vendor.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Vendor since {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* View Activity — opens modal */}
                    <button
                      onClick={() => openActivity(vendor)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100"
                    >
                      <HiChartBar className="w-4 h-4" />
                      View Activity
                    </button>

                    <button
                      onClick={() => setConfirmRevoke(vendor)}
                      disabled={revoking === vendor._id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      <HiX className="w-4 h-4" /> Revoke Access
                    </button>
                  </div>
                </div>

                {/* no inline panel anymore — modal handles display */}
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Modal */}
      {activeVendor && (
        <VendorActivityModal vendor={activeVendor} onClose={closeActivity} />
      )}

      {/* Confirm Revoke Modal */}
      {confirmRevoke && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setConfirmRevoke(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Revoke Vendor Access?</h3>
              <p className="text-gray-500 text-sm">
                This will remove <strong>{confirmRevoke.name}</strong>'s vendor privileges.
                They will lose access to the Vendor Dashboard and can no longer sell books.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRevoke(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRevokeVendor(confirmRevoke._id, confirmRevoke.name)}
                disabled={revoking === confirmRevoke._id}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {revoking === confirmRevoke._id ? 'Revoking...' : 'Yes, Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;
