import React, { useState, useEffect } from 'react';
import { HiSearch, HiX, HiDownload } from 'react-icons/hi';
import { exportToCSV } from '../utils/csvExport';
import API_BASE from '../utils/api';

const statusColors = {
    Pending:    'bg-yellow-100 text-yellow-800',
    Processing: 'bg-blue-100 text-blue-800',
    Shipped:    'bg-indigo-100 text-indigo-800',
    Delivered:  'bg-green-100 text-green-800',
    Cancelled:  'bg-red-100 text-red-800',
};

const paymentColors = {
    Succeeded: 'bg-green-100 text-green-700',
    Pending:   'bg-yellow-100 text-yellow-700',
    Failed:    'bg-red-100 text-red-700',
};

const VendorOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [viewOrder, setViewOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`${API_BASE}/orders/vendor-orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            } else {
                setError('Failed to fetch orders.');
            }
        } catch (err) {
            setError('Network error fetching orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: updatedOrder.orderStatus } : o));
                if (viewOrder?._id === orderId) setViewOrder(prev => ({ ...prev, orderStatus: updatedOrder.orderStatus }));
            } else {
                alert('Failed to update order status');
            }
        } catch (err) {
            alert('Network error while updating status');
        }
    };

    const filtered = orders.filter(o => {
        const matchSearch = o.user?.toLowerCase().includes(search.toLowerCase()) || o._id?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'All' || o.orderStatus === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleExportCSV = () => {
        const flat = filtered.map(o => ({
            orderId:      o._id.slice(-8).toUpperCase(),
            customer:     o.user,
            date:         new Date(o.createdAt).toLocaleDateString(),
            vendorTotal:  (o.vendorTotal || 0).toFixed(2),
            payment:      o.paymentStatus,
            orderStatus:  o.orderStatus,
        }));
        exportToCSV(flat, 'my_orders', [
            { key: 'orderId',     label: 'Order ID' },
            { key: 'customer',    label: 'Customer' },
            { key: 'date',        label: 'Date' },
            { key: 'vendorTotal', label: 'Your Revenue (₹)' },
            { key: 'payment',     label: 'Payment' },
            { key: 'orderStatus', label: 'Order Status' },
        ]);
    };

    if (loading) return <div className="flex items-center justify-center h-64 w-full"><div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" /></div>;
    if (error) return <div className="w-full px-6 py-8"><div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">⚠️ {error}</div></div>;

    return (
        <div className="w-full px-6 py-8 max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">🛒 My Orders</h1>
                    <p className="text-gray-500 mt-1">Orders containing your books — only your items are shown.</p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={filtered.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
                >
                    <HiDownload className="w-4 h-4" /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Search by customer or order ID..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${filterStatus === s ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <span className="text-sm text-gray-500 ml-auto">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Your Items Revenue</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Order Status</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="7" className="px-6 py-10 text-center text-gray-400">No orders found.</td></tr>
                            ) : (
                                filtered.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-800">{order.user}</div>
                                            {order.shippingAddress?.city && <div className="text-xs text-gray-400">{order.shippingAddress.city}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-amber-600">₹{(order.vendorTotal || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${paymentColors[order.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select value={order.orderStatus} onChange={e => handleStatusChange(order._id, e.target.value)}
                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white">
                                                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button onClick={() => setViewOrder(order)}
                                                className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-xs font-semibold transition-colors">
                                                View Items
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Items Modal */}
            {viewOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewOrder(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Order #{viewOrder._id.slice(-8).toUpperCase()}</h3>
                                <p className="text-sm text-gray-500">{viewOrder.user} — <span className="text-amber-600 font-semibold">Your items only</span></p>
                            </div>
                            <button onClick={() => setViewOrder(null)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                                <HiX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-6 space-y-3">
                            {viewOrder.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3">
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">📚 {item.title}</p>
                                        <p className="text-xs text-gray-400">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-amber-700">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm text-gray-500">Your Revenue</span>
                            <span className="text-xl font-bold text-amber-600">₹{(viewOrder.vendorTotal || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorOrders;
