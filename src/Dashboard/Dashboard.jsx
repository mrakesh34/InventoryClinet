import React, { useState, useEffect } from 'react';
import {
  HiUserGroup,
  HiBadgeCheck,
  HiClock,
  HiShoppingCart,
  HiCurrencyDollar,
  HiTrendingUp,
  HiTrendingDown,
  HiUsers,
  HiChartBar,
  HiBookOpen,
  HiArrowRight,
  HiShoppingBag,
  HiCheckCircle,
  HiTag,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import API_BASE from '../utils/api';

const StatCard = ({ icon: Icon, label, value, color, bg, linkTo }) => {
  const content = (
    <div className={`flex items-center gap-4 p-5 rounded-2xl shadow-sm border ${bg} transition-transform hover:scale-[1.02] cursor-pointer`}>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
};

const statusColors = {
  Pending:    'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped:    'bg-indigo-100 text-indigo-800',
  Delivered:  'bg-green-100 text-green-800',
  Cancelled:  'bg-red-100 text-red-800',
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVendors: 0,
    pendingApprovals: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalSales: 0,
    platformCommission: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [vendorActivity, setVendorActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bookstore-token');

    const fetchData = async () => {
      try {
        const [vendorsRes, applicationsRes, usersRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/vendor/all`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/vendor/applications`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/orders/all-orders`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const vendors      = vendorsRes.ok      ? await vendorsRes.json()      : [];
        const applications = applicationsRes.ok  ? await applicationsRes.json() : [];
        const users        = usersRes.ok         ? await usersRes.json()        : [];
        const orders       = ordersRes.ok        ? await ordersRes.json()       : [];

        const totalSales = orders.reduce(
          (sum, o) => (o.paymentStatus === 'Succeeded' ? sum + o.totalAmount : sum),
          0
        );

        // Calculate platform commission (10% of vendor book sales)
        let platformCommission = 0;
        for (const order of orders) {
          if (order.paymentStatus === 'Succeeded') {
            for (const item of (order.items || [])) {
              if (item.platformFee && item.platformFee > 0) {
                platformCommission += item.platformFee;
              } else if (item.book && item.book.vendor) {
                // Fallback for old orders
                platformCommission += (item.price || 0) * (item.quantity || 0) * 0.10;
              }
            }
          }
        }

        setStats({
          totalVendors:      vendors.length,
          pendingApprovals:  applications.length,
          totalUsers:        users.length,
          totalOrders:       orders.length,
          totalSales,
          platformCommission,
        });

        setRecentOrders(orders.slice(0, 6));
        setPendingVendors(applications.slice(0, 3));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Fetch inventory valuation
    const fetchValuation = async () => {
      try {
        const res = await fetch(`${API_BASE}/books/inventory-valuation`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('bookstore-token')}` },
        });
        if (res.ok) setValuation(await res.json());
      } catch {}
    };
    fetchValuation();

    // Fetch vendor activity summary separately
    const fetchVendorActivity = async () => {
      setActivityLoading(true);
      try {
        const res = await fetch(`${API_BASE}/vendor/activity-summary`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('bookstore-token')}` },
        });
        if (res.ok) setVendorActivity(await res.json());
      } catch {}
      finally { setActivityLoading(false); }
    };
    fetchVendorActivity();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🛡️ Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage vendors, monitor platform activity, and review orders.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <StatCard
          icon={HiUserGroup}
          label="Active Vendors"
          value={stats.totalVendors}
          color="bg-purple-500"
          bg="bg-purple-50 border-purple-100"
          linkTo="/admin/dashboard/vendors"
        />
        <StatCard
          icon={HiBadgeCheck}
          label="Pending Approvals"
          value={stats.pendingApprovals}
          color={stats.pendingApprovals > 0 ? 'bg-red-500' : 'bg-green-500'}
          bg={stats.pendingApprovals > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}
          linkTo="/admin/dashboard/vendor-approvals"
        />
        <StatCard
          icon={HiUsers}
          label="Registered Users"
          value={stats.totalUsers}
          color="bg-blue-500"
          bg="bg-blue-50 border-blue-100"
          linkTo="/admin/dashboard/users"
        />
        <StatCard
          icon={HiShoppingCart}
          label="Total Orders"
          value={stats.totalOrders}
          color="bg-indigo-500"
          bg="bg-indigo-50 border-indigo-100"
          linkTo="/admin/dashboard/orders"
        />
        <StatCard
          icon={HiCurrencyDollar}
          label="Total Sales"
          value={`₹${stats.totalSales.toFixed(2)}`}
          color="bg-green-600"
          bg="bg-green-50 border-green-100"
        />
        <StatCard
          icon={HiTrendingUp}
          label="Platform Commission (10%)"
          value={`₹${stats.platformCommission.toFixed(2)}`}
          color="bg-emerald-600"
          bg="bg-emerald-50 border-emerald-100"
        />
      </div>

      {/* ── Inventory Valuation Strip ── */}
      {valuation && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="flex items-center gap-4 p-5 rounded-2xl shadow-sm border bg-blue-50 border-blue-100">
            <div className="p-3 rounded-xl bg-blue-500"><HiTag className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-sm text-gray-500">Total Cost Value</p>
              <p className="text-2xl font-bold text-gray-800">₹{valuation.totalCostValue.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 rounded-2xl shadow-sm border bg-indigo-50 border-indigo-100">
            <div className="p-3 rounded-xl bg-indigo-500"><HiBookOpen className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-sm text-gray-500">Total Retail Value</p>
              <p className="text-2xl font-bold text-gray-800">₹{valuation.totalRetailValue.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-5 rounded-2xl shadow-sm border bg-emerald-50 border-emerald-100">
            <div className="p-3 rounded-xl bg-emerald-500"><HiCurrencyDollar className="w-6 h-6 text-white" /></div>
            <div>
              <p className="text-sm text-gray-500">Potential Profit</p>
              <p className="text-2xl font-bold text-emerald-700">₹{valuation.potentialProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pending Vendor Applications */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <HiBadgeCheck className="text-purple-500" /> Pending Vendor Requests
            </h2>
            <Link
              to="/admin/dashboard/vendor-approvals"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="p-5 space-y-3">
            {pendingVendors.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <div className="text-3xl mb-2">🎉</div>
                <p>No pending applications.</p>
              </div>
            ) : (
              pendingVendors.map((vendor) => (
                <div
                  key={vendor._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-purple-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {vendor.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{vendor.name}</p>
                    <p className="text-xs text-gray-500 truncate">{vendor.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HiClock className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <HiTrendingUp className="text-blue-500" /> Recent Orders
            </h2>
            <Link
              to="/admin/dashboard/orders"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <p className="text-3xl mb-2">📦</p>
                <p>No orders yet.</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-mono text-xs text-gray-400">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm font-medium text-gray-700">{order.user}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-sm">₹{order.totalAmount?.toFixed(2)}</p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Vendor Activity Section ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-100">
              <HiChartBar className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Vendor Activity</h2>
              <p className="text-sm text-gray-500">Stock movements per vendor — restocks &amp; sales</p>
            </div>
          </div>
          <Link
            to="/admin/dashboard/activity"
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm"
          >
            View Full Activity <HiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {activityLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-500 border-t-transparent" />
          </div>
        ) : vendorActivity.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
            <div className="text-5xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-gray-600 mb-1">No vendor activity yet</h3>
            <p className="text-sm text-gray-400">Activity will appear once vendors start managing stock.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {vendorActivity.map((vendor) => {
              const totalEvents = vendor.stockInEvents + vendor.stockOutEvents;
              const inPct = totalEvents > 0 ? Math.round((vendor.stockInEvents / totalEvents) * 100) : 0;
              const isActive = vendor.lastActivityAt &&
                new Date() - new Date(vendor.lastActivityAt) < 7 * 24 * 60 * 60 * 1000;

              return (
                <div
                  key={vendor._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4"
                >
                  {/* Vendor header */}
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {vendor.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-800 truncate">{vendor.name}</p>
                        {isActive && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold bg-green-100 text-green-700 rounded-full uppercase tracking-wide">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{vendor.email}</p>
                    </div>
                  </div>

                  {/* Stats row — Stock */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 rounded-xl py-2.5 px-1">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <HiBookOpen className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <p className="text-lg font-bold text-blue-700">{vendor.totalBooks}</p>
                      <p className="text-[10px] text-blue-500 font-medium">Books</p>
                    </div>
                    <div className="bg-green-50 rounded-xl py-2.5 px-1">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <HiTrendingUp className="w-3.5 h-3.5 text-green-500" />
                      </div>
                      <p className="text-lg font-bold text-green-700">+{vendor.totalStockIn}</p>
                      <p className="text-[10px] text-green-500 font-medium">Stock In</p>
                    </div>
                    <div className="bg-red-50 rounded-xl py-2.5 px-1">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <HiTrendingDown className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <p className="text-lg font-bold text-red-600">-{vendor.totalStockOut}</p>
                      <p className="text-[10px] text-red-400 font-medium">Stock Out</p>
                    </div>
                  </div>

                  {/* Stats row — Orders */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-orange-50 rounded-xl py-3 px-3 flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                        <HiShoppingBag className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-orange-600 leading-none">{vendor.ordersReceived ?? 0}</p>
                        <p className="text-[10px] text-orange-400 font-semibold mt-0.5">Orders Received</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl py-3 px-3 flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                        <HiCheckCircle className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-emerald-600 leading-none">{vendor.ordersDelivered ?? 0}</p>
                        <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                          Delivered
                          {(vendor.ordersReceived ?? 0) > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[9px] font-bold">
                              {Math.round((vendor.ordersDelivered / vendor.ordersReceived) * 100)}%
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activity bar */}
                  {totalEvents > 0 && (
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>📥 {vendor.stockInEvents} restocks</span>
                        <span>{vendor.stockOutEvents} sales 📤</span>
                      </div>
                      <div className="h-2 rounded-full bg-red-100 overflow-hidden">
                        <div
                          className="h-full bg-green-400 rounded-full transition-all"
                          style={{ width: `${inPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Last activity + CTA */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <HiClock className="w-3.5 h-3.5" />
                      {vendor.lastActivityAt
                        ? new Date(vendor.lastActivityAt).toLocaleDateString()
                        : 'No activity yet'}
                    </div>
                    <Link
                      to="/admin/dashboard/vendors"
                      className="flex items-center gap-1 px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-xs font-semibold hover:bg-violet-100 transition-colors"
                    >
                      Manage <HiArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;