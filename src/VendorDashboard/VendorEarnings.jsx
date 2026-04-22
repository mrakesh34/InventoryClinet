import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { HiCurrencyDollar, HiCheckCircle, HiClock, HiShoppingCart } from 'react-icons/hi';
import API_BASE from '../utils/api';

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

const VendorEarnings = () => {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const token = localStorage.getItem('bookstore-token');
                const res   = await fetch(`${API_BASE}/settlements/my-earnings`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) setData(await res.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
        </div>
    );

    if (!data) return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            Failed to load earnings data.
        </div>
    );

    const COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ef4444', '#3b82f6', '#8b5cf6'];

    return (
        <div className="w-full px-6 py-8 max-w-4xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">💰 My Earnings</h1>
                <p className="text-gray-500 mt-1">Track your revenue, settlements, and monthly performance.</p>
            </div>

            {/* Commission info strip */}
            <div className="mb-6 bg-amber-50 border border-amber-100 rounded-xl px-5 py-3 flex items-center gap-3 text-sm">
                <span className="text-amber-500 text-lg">💡</span>
                <p className="text-amber-800">
                    All earnings shown below reflect your <strong>90% share</strong> after <strong>10% platform commission</strong> deduction.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    icon={HiCurrencyDollar}
                    label="Total Earned"
                    value={`₹${data.totalEarned.toFixed(2)}`}
                    color="bg-amber-500"
                    bg="bg-amber-50 border-amber-100"
                />
                <StatCard
                    icon={HiCheckCircle}
                    label="Delivered Revenue"
                    value={`₹${data.delivered.toFixed(2)}`}
                    color="bg-green-500"
                    bg="bg-green-50 border-green-100"
                />
                <StatCard
                    icon={HiShoppingCart}
                    label="Pending Revenue"
                    value={`₹${data.pending.toFixed(2)}`}
                    color="bg-yellow-500"
                    bg="bg-yellow-50 border-yellow-100"
                />
                <StatCard
                    icon={HiClock}
                    label="Outstanding (Unsettled)"
                    value={`₹${data.outstanding.toFixed(2)}`}
                    color={data.outstanding > 0 ? 'bg-orange-500' : 'bg-gray-400'}
                    bg={data.outstanding > 0 ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'}
                />
            </div>

            {/* Monthly Revenue Chart */}
            {data.byMonth?.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Monthly Revenue</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={data.byMonth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                            <Tooltip formatter={(v) => [`₹${v.toFixed(2)}`, 'Revenue']} />
                            <Bar dataKey="revenue" radius={[6, 6, 0, 0]} name="Revenue">
                                {data.byMonth.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Settlement History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">🧾 Settlement History</h2>
                    <p className="text-sm text-gray-500">Payments received from the platform admin</p>
                </div>
                {data.settlements?.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                        <p className="text-4xl mb-2">📭</p>
                        <p>No settlements recorded yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {data.settlements.map(s => (
                            <div key={s._id}
                                 className="flex items-center justify-between px-6 py-3 hover:bg-green-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <HiCheckCircle className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-700">₹{s.amount.toFixed(2)}</p>
                                        <p className="text-xs text-gray-400">{s.period} {s.note ? `· ${s.note}` : ''}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-400">
                                        {new Date(s.settledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-300">by {s.settledBy}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorEarnings;
