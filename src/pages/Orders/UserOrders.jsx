import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import {
    FaBoxOpen, FaShoppingCart, FaChevronRight,
    FaCheckCircle, FaBan, FaSearch
} from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';
import API_BASE from '../../utils/api';

// ── Delivery estimate from order date ─────────────────────────────────────────
const getDeliveryRange = (orderDate) => {
    const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
    const base = new Date(orderDate);
    const min = new Date(base); min.setDate(min.getDate() + 5);
    const max = new Date(base); max.setDate(max.getDate() + 7);
    return { min: fmt(min), max: fmt(max) };
};

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS = {
    Delivered:  { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500', icon: <FaCheckCircle className="w-3 h-3" /> },
    Shipped:    { color: 'bg-blue-100 text-blue-700 border-blue-200',          bar: 'bg-blue-500',    icon: <MdLocalShipping className="w-3.5 h-3.5" /> },
    Processing: { color: 'bg-amber-100 text-amber-700 border-amber-200',       bar: 'bg-amber-500',   icon: null },
    Pending:    { color: 'bg-gray-100 text-gray-500 border-gray-200',          bar: 'bg-gray-400',    icon: null },
    Cancelled:  { color: 'bg-red-100 text-red-600 border-red-200',             bar: 'bg-red-500',     icon: <FaBan className="w-3 h-3" /> },
};

const FILTERS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const UserOrders = () => {
    const { user } = useContext(AuthContext);
    const navigate  = useNavigate();
    const [orders, setOrders]     = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [filter, setFilter]     = useState('All');
    const [search, setSearch]     = useState('');

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('bookstore-token');
                if (!token) { setLoading(false); return; }
                const res = await fetch(`${API_BASE}/orders/my-orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) setOrders(await res.json());
                else setError('Failed to fetch orders.');
            } catch { setError('Network error fetching orders.'); }
            finally  { setLoading(false); }
        })();
    }, []);

    const displayed = orders
        .filter(o => filter === 'All' || o.orderStatus === filter)
        .filter(o =>
            !search ||
            o._id.toLowerCase().includes(search.toLowerCase()) ||
            o.items.some(i => i.title?.toLowerCase().includes(search.toLowerCase()))
        );

    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="text-gray-400 text-sm">Loading your orders…</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-500">{error}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-50 pt-24 pb-16 px-4">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">

                {/* ── Page Header ── */}
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">My Orders</h1>
                    <p className="text-gray-500 text-sm">Track and manage all your Book Vault purchases</p>
                </div>

                {/* ── Search + Filters ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by book title or order ID…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                        />
                    </div>
                    {/* Filter pills */}
                    <div className="flex flex-wrap gap-2">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${
                                    filter === f
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                        <span className="ml-auto text-xs text-gray-400 self-center">{displayed.length} result{displayed.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                {/* ── Empty State ── */}
                {displayed.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 gap-5">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-inner">
                            <FaBoxOpen className="w-12 h-12 text-blue-400" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-extrabold text-gray-800 mb-1">
                                {search || filter !== 'All' ? 'No orders match your search' : 'No Orders Yet'}
                            </h3>
                            <p className="text-gray-500 text-sm max-w-xs mx-auto">
                                {search || filter !== 'All'
                                    ? 'Try adjusting your filters or search term.'
                                    : 'When you buy books, they will appear here.'}
                            </p>
                        </div>
                        {!search && filter === 'All' && (
                            <button
                                onClick={() => navigate('/shop')}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-7 py-3 rounded-xl transition-all shadow-lg shadow-blue-200"
                            >
                                <FaShoppingCart className="w-4 h-4" /> Browse Books
                            </button>
                        )}
                    </div>
                )}

                {/* ── Order Cards ── */}
                <div className="space-y-4">
                    {displayed.map((order) => {
                        const s = STATUS[order.orderStatus] || STATUS.Pending;
                        const { min: dMin, max: dMax } = getDeliveryRange(order.createdAt);
                        const totalItems = order.items.reduce((acc, i) => acc + i.quantity, 0);

                        return (
                            <div
                                key={order._id}
                                onClick={() => navigate(`/purchase/${order._id}`)}
                                className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 cursor-pointer transition-all duration-200 overflow-hidden"
                            >
                                {/* Top colour bar */}
                                <div className={`h-1.5 w-full ${s.bar}`} />

                                {/* Header */}
                                <div className="px-5 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-5">
                                        {/* Date */}
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Placed on</p>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        {/* Order ID */}
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Order ID</p>
                                            <p className="text-sm font-mono font-semibold text-gray-600">#{order._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                        {/* Items count */}
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Items</p>
                                            <p className="text-sm font-semibold text-gray-800">{totalItems} book{totalItems !== 1 ? 's' : ''}</p>
                                        </div>
                                        {/* Total */}
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Total</p>
                                            <p className="text-sm font-extrabold text-blue-700">₹{order.totalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Status + arrow */}
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${s.color}`}>
                                            {s.icon} {order.orderStatus}
                                        </span>
                                        <FaChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </div>

                                {/* Delivery banner */}
                                {order.orderStatus !== 'Cancelled' && (
                                    <div className="mx-5 mb-3 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/60 text-xs">
                                        {order.orderStatus === 'Delivered' ? (
                                            <span className="flex items-center gap-2 text-emerald-600 font-semibold">
                                                <FaCheckCircle className="w-3.5 h-3.5" /> Order delivered successfully
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-blue-600 font-medium">
                                                <MdLocalShipping className="w-4 h-4" />
                                                Est. delivery: <strong>{dMin}</strong> – <strong>{dMax}</strong>
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Book chips */}
                                <div className="px-5 pb-4 flex flex-wrap gap-2">
                                    {order.items.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 max-w-xs">
                                            {item.book?.imageURL ? (
                                                <img src={item.book.imageURL} alt={item.title} className="w-7 h-10 object-cover rounded-md shadow-sm" />
                                            ) : (
                                                <div className="w-7 h-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 text-xs">📚</div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.title}</p>
                                                <p className="text-[11px] text-gray-400">
                                                    Qty {item.quantity} · <span className="text-gray-600 font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <div className="flex items-center px-3 text-xs text-gray-400 font-semibold">
                                            +{order.items.length - 3} more
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5 text-xs text-blue-500 font-bold group-hover:text-blue-700 transition-colors">
                                    View full order details <FaChevronRight className="w-3 h-3" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UserOrders;
