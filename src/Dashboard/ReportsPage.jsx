import React, { useState, useEffect } from 'react';
import {
  HiBookOpen,
  HiShoppingCart,
  HiCurrencyDollar,
  HiTrendingUp,
  HiExclamation,
  HiDocumentReport,
  HiArrowDown,
  HiCollection,
  HiChartBar,
  HiClock,
  HiTag,
} from 'react-icons/hi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import API_BASE from '../utils/api';

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#06b6d4'];

const ReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('bookstore-token');
        const res = await fetch(`${API_BASE}/analytics/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch report data');
        setReport(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-red-500 font-semibold">{error}</p>
      </div>
    );
  }

  const { summary, orderStatusCounts, topSellers, categoryBreakdown, lowStockBooks, monthlyRevenue } = report;

  // Pie chart data for order status
  const orderStatusData = Object.entries(orderStatusCounts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const statusColorMap = {
    Pending: '#f59e0b',
    Processing: '#3b82f6',
    Shipped: '#6366f1',
    Delivered: '#22c55e',
    Cancelled: '#ef4444',
  };

  // Date for report header
  const reportDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="w-full px-6 py-8 max-w-6xl">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <HiDocumentReport className="text-blue-600" /> Inventory Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Comprehensive summary of your inventory, orders, and revenue
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
          <HiClock className="w-4 h-4" />
          Generated: {reportDate}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-4">
        <SummaryCard icon={HiBookOpen} label="Total Books" value={summary.totalBooks} sub={`${summary.totalStock} units in stock`} color="blue" />
        <SummaryCard icon={HiShoppingCart} label="Total Orders" value={summary.totalOrders} sub={`${summary.successfulOrders} successful`} color="indigo" />
        <SummaryCard icon={HiCurrencyDollar} label="Total Sales" value={`₹${summary.totalRevenue.toLocaleString()}`} sub={`Avg ₹${summary.avgOrderValue}`} color="green" />
      </div>

      {/* ── Commission Split Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500"><HiTrendingUp className="w-5 h-5 text-white" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Platform Commission (10%)</p>
            <p className="text-xl font-bold text-emerald-700">₹{(summary.platformCommissionTotal || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500"><HiCurrencyDollar className="w-5 h-5 text-white" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Vendor Payouts (90%)</p>
            <p className="text-xl font-bold text-amber-700">₹{(summary.vendorPayoutsTotal || 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500"><HiTrendingUp className="w-5 h-5 text-white" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Potential Profit (Unsold)</p>
            <p className="text-xl font-bold text-blue-700">₹{summary.potentialProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Commission info strip */}
      <div className="mb-8 bg-green-50 border border-green-100 rounded-xl px-5 py-3 flex items-center gap-3 text-sm">
        <span className="text-green-500 text-lg">💰</span>
        <p className="text-green-800">
          <strong>Commission Model:</strong> Platform retains <strong>10%</strong> of vendor book sales as commission. Vendors receive <strong>90%</strong>. Admin-managed books are not subject to commission.
        </p>
      </div>

      {/* ── Inventory Valuation Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500"><HiTag className="w-5 h-5 text-white" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Cost Value</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.totalCostValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500"><HiCollection className="w-5 h-5 text-white" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Retail Value</p>
            <p className="text-xl font-bold text-gray-800">₹{summary.totalRetailValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500"><HiCurrencyDollar className="w-5 h-5 text-white" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Profit Margin</p>
            <p className="text-xl font-bold text-emerald-700">
              {summary.totalRetailValue > 0
                ? `${Math.round((summary.potentialProfit / summary.totalRetailValue) * 100)}%`
                : '0%'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HiChartBar className="text-blue-500" /> Monthly Revenue
          </h2>
          {monthlyRevenue.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400">No revenue data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HiShoppingCart className="text-indigo-500" /> Order Status Breakdown
          </h2>
          {orderStatusData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400">No orders yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {orderStatusData.map((entry) => (
                    <Cell key={entry.name} fill={statusColorMap[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Top Selling Books ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <HiTrendingUp className="text-green-500" /> Top Selling Books
          </h2>
        </div>
        {topSellers.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <div className="text-3xl mb-2">📦</div>
            <p>No sales data available yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 text-left font-semibold">#</th>
                  <th className="px-6 py-3 text-left font-semibold">Book</th>
                  <th className="px-6 py-3 text-right font-semibold">Units Sold</th>
                  <th className="px-6 py-3 text-right font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topSellers.map((book, index) => (
                  <tr key={book.bookId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {book.imageURL ? (
                          <img src={book.imageURL} alt="" className="w-10 h-12 object-cover rounded-lg shadow-sm" />
                        ) : (
                          <div className="w-10 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-400">📖</div>
                        )}
                        <span className="font-medium text-gray-800 truncate max-w-[200px]">{book.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-700">{book.totalSold}</td>
                    <td className="px-6 py-3 text-right font-bold text-green-600">₹{book.totalRevenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Category Breakdown & Low Stock ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <HiCollection className="text-purple-500" /> Category Breakdown
            </h2>
          </div>
          {categoryBreakdown.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No categories yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {categoryBreakdown.map((cat, i) => (
                <div key={cat.category} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{cat.category}</p>
                      <p className="text-xs text-gray-400">{cat.bookCount} books · {cat.totalStock} units</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-600 text-sm">₹{cat.retailValue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <HiExclamation className="text-red-500" /> Low Stock Alert
            </h2>
            {lowStockBooks.length > 0 && (
              <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-600 rounded-full">
                {lowStockBooks.length} items
              </span>
            )}
          </div>
          {lowStockBooks.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <div className="text-3xl mb-2">✅</div>
              <p>All books are well stocked!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
              {lowStockBooks.map((book) => (
                <div key={book._id} className="px-6 py-3 flex items-center justify-between hover:bg-red-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {book.imageURL ? (
                      <img src={book.imageURL} alt="" className="w-8 h-10 object-cover rounded-md shadow-sm" />
                    ) : (
                      <div className="w-8 h-10 bg-red-50 rounded-md flex items-center justify-center text-red-400 text-xs">📖</div>
                    )}
                    <div>
                      <p className="font-medium text-gray-800 text-sm truncate max-w-[160px]">{book.bookTitle}</p>
                      <p className="text-xs text-gray-400">{book.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                      book.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {book.stock === 0 ? 'Out of Stock' : `${book.stock} left`}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-0.5">Threshold: {book.lowStockThreshold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Print / Export Notice ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4 text-sm text-blue-700">
        <HiDocumentReport className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="font-semibold">Need a printable version?</p>
          <p className="text-blue-500 text-xs mt-0.5">Use your browser's print function (Ctrl+P / Cmd+P) to save this report as a PDF.</p>
        </div>
      </div>
    </div>
  );
};

// summary card component
const SummaryCard = ({ icon: Icon, label, value, sub, color }) => {
  const colorMap = {
    blue:    { bg: 'bg-blue-50 border-blue-100',    icon: 'bg-blue-500' },
    indigo:  { bg: 'bg-indigo-50 border-indigo-100',  icon: 'bg-indigo-500' },
    green:   { bg: 'bg-green-50 border-green-100',   icon: 'bg-green-600' },
    emerald: { bg: 'bg-emerald-50 border-emerald-100', icon: 'bg-emerald-500' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`flex items-center gap-4 p-5 rounded-2xl shadow-sm border ${c.bg} transition-transform hover:scale-[1.02]`}>
      <div className={`p-3 rounded-xl ${c.icon}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

export default ReportsPage;
