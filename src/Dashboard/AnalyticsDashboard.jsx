import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { HiTrendingUp, HiChartBar, HiBookOpen, HiExclamation, HiRefresh } from 'react-icons/hi';
import API_BASE from '../utils/api';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16'];

const SectionHeader = ({ icon: Icon, title, subtitle, color = 'text-indigo-600', bg = 'bg-indigo-50' }) => (
    <div className="flex items-center gap-3 mb-5">
        <div className={`p-2.5 rounded-xl ${bg}`}>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
            <p className="font-bold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }} className="font-medium">
                    {p.name}: {p.value}
                </p>
            ))}
        </div>
    );
};

const AnalyticsDashboard = () => {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('bookstore-token');
            const res   = await fetch(`${API_BASE}/analytics/overview`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to load analytics');
            setData(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnalytics(); }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="text-red-500 font-semibold">{error}</p>
            <button
                onClick={fetchAnalytics}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
            >
                <HiRefresh className="w-4 h-4" /> Retry
            </button>
        </div>
    );

    const { stockTrend = [], topSellers = [], categoryBreakdown = [], lowStockBooks = [] } = data || {};

    return (
        <div className="w-full px-6 py-8 max-w-6xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">📊 Analytics Dashboard</h1>
                    <p className="text-gray-500 mt-1">Inventory trends, top sellers, and category insights</p>
                </div>
                <button
                    onClick={fetchAnalytics}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 shadow-sm"
                >
                    <HiRefresh className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* ── 1. Stock Trend Chart ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <SectionHeader
                    icon={HiTrendingUp}
                    title="Stock Trend — Last 30 Days"
                    subtitle="Daily stock restocked vs sold"
                    color="text-indigo-600"
                    bg="bg-indigo-50"
                />
                {stockTrend.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                        <p className="text-4xl mb-2">📉</p>
                        <p>No stock activity in the last 30 days.</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={stockTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 11, fill: '#9ca3af' }}
                                tickFormatter={d => d.slice(5)} // show MM-DD
                            />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="stockIn"  stroke="#10b981" strokeWidth={2.5} dot={false} name="Stock In"  />
                            <Line type="monotone" dataKey="stockOut" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Stock Out" />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* ── 2. Top Sellers ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader
                        icon={HiChartBar}
                        title="Top 10 Sellers"
                        subtitle="By units sold (paid orders)"
                        color="text-amber-600"
                        bg="bg-amber-50"
                    />
                    {topSellers.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                            <p className="text-4xl mb-2">📦</p>
                            <p>No orders yet.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart
                                data={topSellers}
                                layout="vertical"
                                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                                <YAxis
                                    type="category"
                                    dataKey="title"
                                    width={130}
                                    tick={{ fontSize: 10, fill: '#6b7280' }}
                                    tickFormatter={t => t.length > 18 ? t.slice(0, 18) + '…' : t}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="totalSold" name="Units Sold" radius={[0, 6, 6, 0]}>
                                    {topSellers.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* ── 3. Category Breakdown ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <SectionHeader
                        icon={HiBookOpen}
                        title="Category Breakdown"
                        subtitle="Book count per category"
                        color="text-violet-600"
                        bg="bg-violet-50"
                    />
                    {categoryBreakdown.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                            <p className="text-4xl mb-2">📚</p>
                            <p>No books found.</p>
                        </div>
                    ) : (
                        <div className="flex gap-4 items-center">
                            <ResponsiveContainer width="55%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="bookCount"
                                        nameKey="category"
                                    >
                                        {categoryBreakdown.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v, name) => [`${v} books`, name]} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-56">
                                {categoryBreakdown.map((cat, i) => (
                                    <div key={cat.category} className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                             style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-xs text-gray-600 truncate flex-1">{cat.category}</span>
                                        <span className="text-xs font-bold text-gray-700">{cat.bookCount}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── 4. Low Stock Table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-red-100">
                            <HiExclamation className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Low Stock Books</h2>
                            <p className="text-sm text-gray-500">Books at or below their minimum threshold</p>
                        </div>
                    </div>
                    {lowStockBooks.length > 0 && (
                        <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                            {lowStockBooks.length} book{lowStockBooks.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {lowStockBooks.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                        <p className="text-4xl mb-2">✅</p>
                        <p>All books are well-stocked!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Book</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Current Stock</th>
                                    <th className="px-6 py-3">Min. Threshold</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {lowStockBooks.map(book => (
                                    <tr key={book._id} className="hover:bg-red-50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={book.imageURL}
                                                    alt={book.bookTitle}
                                                    className="w-8 h-10 object-cover rounded shadow-sm flex-shrink-0"
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                                <span className="font-semibold text-gray-800 truncate max-w-[180px]">
                                                    {book.bookTitle}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">{book.category}</td>
                                        <td className="px-6 py-3">
                                            <span className={`font-bold text-lg ${book.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                                                {book.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">{book.lowStockThreshold}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                book.stock === 0
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {book.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
