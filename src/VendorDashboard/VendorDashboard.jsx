import React, { useState, useEffect, useContext } from 'react';
import {
    HiBookOpen, HiShoppingCart, HiCurrencyDollar, HiClock, HiTrendingUp,
} from 'react-icons/hi';
import API_BASE from '../utils/api';
import { AuthContext } from '../contexts/AuthProvider';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className={`flex items-center gap-4 p-5 rounded-2xl shadow-sm border ${bg}`}>
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const statusColors = {
    Pending:    'bg-yellow-100 text-yellow-800',
    Processing: 'bg-blue-100 text-blue-800',
    Shipped:    'bg-indigo-100 text-indigo-800',
    Delivered:  'bg-green-100 text-green-800',
    Cancelled:  'bg-red-100 text-red-800',
};

const VendorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ totalBooks: 0, totalOrders: 0, pendingOrders: 0, revenue: 0, commission: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('bookstore-token');
        const fetchData = async () => {
            try {
                const [booksRes, ordersRes] = await Promise.all([
                    fetch(`${API_BASE}/books/my-books`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE}/orders/vendor-orders`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);
                const books = await booksRes.json();
                const orders = await ordersRes.json();

                const revenue = orders.reduce(
                    (sum, o) => (o.paymentStatus === 'Succeeded' ? sum + (o.vendorTotal || 0) : sum), 0
                );
                const commission = orders.reduce(
                    (sum, o) => (o.paymentStatus === 'Succeeded' ? sum + (o.platformFee || 0) : sum), 0
                );
                const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;

                setStats({
                    totalBooks: Array.isArray(books) ? books.length : 0,
                    totalOrders: Array.isArray(orders) ? orders.length : 0,
                    pendingOrders,
                    revenue,
                    commission,
                });
                setRecentOrders(Array.isArray(orders) ? orders.slice(0, 6) : []);
            } catch (err) {
                console.error('Vendor Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="w-full px-6 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">🏪 Vendor Dashboard</h1>
                <p className="text-gray-500 mt-1">Overview of your books, orders and revenue — <span className="text-amber-600 font-semibold">{user?.name}</span></p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-4">
                <StatCard icon={HiBookOpen}      label="My Books"       value={stats.totalBooks}               color="bg-amber-500"  bg="bg-amber-50 border-amber-100" />
                <StatCard icon={HiShoppingCart}  label="Total Orders"   value={stats.totalOrders}              color="bg-indigo-500" bg="bg-indigo-50 border-indigo-100" />
                <StatCard icon={HiClock}         label="Pending Orders" value={stats.pendingOrders}            color="bg-yellow-500" bg="bg-yellow-50 border-yellow-100" />
                <StatCard icon={HiCurrencyDollar} label="My Revenue (90%)" value={`₹${stats.revenue.toFixed(2)}`} color="bg-green-500"  bg="bg-green-50 border-green-100" />
            </div>

            {/* Commission info strip */}
            <div className="mb-10 bg-amber-50 border border-amber-100 rounded-xl px-5 py-3 flex items-center gap-3 text-sm">
                <span className="text-amber-500 text-lg">💡</span>
                <p className="text-amber-800">
                    <strong>10% platform commission</strong> is deducted from your sales. You receive <strong>90%</strong> of the sale price.
                    {stats.commission > 0 && <span className="ml-1 text-amber-600">(Commission paid: ₹{stats.commission.toFixed(2)})</span>}
                </p>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <HiTrendingUp className="text-amber-500" /> Recent Orders (My Books)
                    </h2>
                    <a href="/vendor/dashboard/orders" className="text-sm text-amber-600 hover:underline font-medium">
                        View all →
                    </a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Your Revenue</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                        No orders yet. Upload books to start selling!
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{order.user}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-bold text-amber-600">₹{(order.vendorTotal || 0).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
