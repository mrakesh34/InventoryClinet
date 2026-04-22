import React, { useState, useEffect } from 'react';
import { HiCurrencyDollar, HiCheckCircle, HiClock, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import API_BASE from '../utils/api';

const VendorSettlements = () => {
    const [vendors, setVendors]           = useState([]);
    const [loading, setLoading]           = useState(true);
    const [expanded, setExpanded]         = useState({});
    const [settling, setSettling]         = useState(null);
    const [form, setForm]                 = useState({ amount: '', period: '', note: '' });

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('bookstore-token');
            const res   = await fetch(`${API_BASE}/settlements/summary`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setVendors(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSummary(); }, []);

    const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    const handleSettle = async (vendorId) => {
        if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
            return alert('Please enter a valid amount.');
        }
        try {
            const token = localStorage.getItem('bookstore-token');
            const res   = await fetch(`${API_BASE}/settlements/${vendorId}`, {
                method:  'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body:    JSON.stringify(form),
            });
            if (res.ok) {
                setSettling(null);
                setForm({ amount: '', period: '', note: '' });
                fetchSummary();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
        </div>
    );

    return (
        <div className="w-full px-6 py-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">💳 Vendor Settlements</h1>
                <p className="text-gray-500 mt-1">Track earnings per vendor and record payment settlements.</p>
            </div>

            {vendors.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center text-gray-400">
                    <div className="text-5xl mb-3">🏪</div>
                    <p>No vendors with orders yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {vendors.map(vendor => (
                        <div key={vendor.vendorId}
                             className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Vendor header row */}
                            <div className="flex items-center gap-4 px-6 py-4">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-400 to-purple-600
                                                flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {vendor.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-800">{vendor.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{vendor.email}</p>
                                </div>

                                {/* KPI strip */}
                                <div className="hidden sm:flex items-center gap-6 text-center">
                                    <div>
                                        <p className="text-lg font-bold text-gray-800">₹{vendor.totalEarned.toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Total Earned</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-green-600">₹{vendor.totalSettled.toFixed(2)}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Settled</p>
                                    </div>
                                    <div>
                                        <p className={`text-lg font-bold ${vendor.outstanding > 0 ? 'text-orange-500' : 'text-gray-400'}`}>
                                            ₹{vendor.outstanding.toFixed(2)}
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Outstanding</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {vendor.outstanding > 0 && (
                                        <button
                                            onClick={() => { setSettling(vendor.vendorId); setForm({ amount: vendor.outstanding.toFixed(2), period: new Date().toISOString().slice(0, 7), note: '' }); }}
                                            className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors"
                                        >
                                            Mark Settled
                                        </button>
                                    )}
                                    <button
                                        onClick={() => toggle(vendor.vendorId)}
                                        className="p-2 rounded-xl hover:bg-gray-50 text-gray-400"
                                    >
                                        {expanded[vendor.vendorId] ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Settlement form */}
                            {settling === vendor.vendorId && (
                                <div className="px-6 pb-4 border-t border-gray-50 bg-green-50">
                                    <p className="text-sm font-semibold text-green-800 mt-3 mb-2">Record Settlement for {vendor.name}</p>
                                    <div className="flex flex-wrap gap-3">
                                        <input
                                            type="number" step="0.01" min="0"
                                            placeholder="Amount (₹)"
                                            value={form.amount}
                                            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                                            className="border border-gray-300 rounded-xl px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-green-400"
                                        />
                                        <input
                                            type="month"
                                            value={form.period}
                                            onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                                            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Note (optional)"
                                            value={form.note}
                                            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                                            className="border border-gray-300 rounded-xl px-3 py-2 text-sm flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-green-400"
                                        />
                                        <button
                                            onClick={() => handleSettle(vendor.vendorId)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => setSettling(null)}
                                            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-300"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Expanded: monthly + settlement history */}
                            {expanded[vendor.vendorId] && (
                                <div className="px-6 pb-5 border-t border-gray-50">
                                    {/* Monthly breakdown */}
                                    {vendor.byMonth?.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Monthly Revenue</p>
                                            <div className="flex flex-wrap gap-2">
                                                {vendor.byMonth.map(m => (
                                                    <div key={m.month} className="bg-indigo-50 rounded-xl px-3 py-2 text-center">
                                                        <p className="text-xs text-indigo-400 font-medium">{m.month}</p>
                                                        <p className="text-sm font-bold text-indigo-700">₹{m.revenue.toFixed(2)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Settlement history */}
                                    {vendor.settlements?.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Settlement History</p>
                                            <div className="space-y-2">
                                                {vendor.settlements.map(s => (
                                                    <div key={s._id}
                                                         className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <HiCheckCircle className="w-4 h-4 text-green-500" />
                                                            <span className="text-sm font-semibold text-green-800">₹{s.amount.toFixed(2)}</span>
                                                            <span className="text-xs text-gray-400">· {s.period} · {s.note}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                                            <HiClock className="w-3.5 h-3.5" />
                                                            {new Date(s.settledAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VendorSettlements;
