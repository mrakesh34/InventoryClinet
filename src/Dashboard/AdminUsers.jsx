import React, { useState, useEffect } from 'react';
import { HiSearch, HiEye } from 'react-icons/hi';
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

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('bookstore-token');
    const fetchAll = async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          fetch(`${API_BASE}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/orders/all-orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!usersRes.ok) throw new Error('Failed to fetch users');
        if (!ordersRes.ok) throw new Error('Failed to fetch orders');
        const usersData = await usersRes.json();
        const ordersData = await ordersRes.json();
        setUsers(usersData);
        setOrders(ordersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Build user -> orders map
  const userOrdersMap = orders.reduce((acc, order) => {
    if (!acc[order.user]) acc[order.user] = [];
    acc[order.user].push(order);
    return acc;
  }, {});

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('bookstore-token');
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, orderStatus: updated.orderStatus } : o))
        );
        // Update modal view too
        if (selectedUser) {
          setSelectedUser((u) => ({
            ...u,
            orders: u.orders.map((o) =>
              o._id === orderId ? { ...o, orderStatus: updated.orderStatus } : o
            ),
          }));
        }
      } else {
        alert('Failed to update order status');
      }
    } catch (err) {
      alert('Network error updating status');
    }
  };

  const openUserModal = (user) => {
    const userOrders = userOrdersMap[user.email] || [];
    setSelectedUser({ ...user, orders: userOrders });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-6 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">👥 Users &amp; Purchases</h1>
        <p className="text-gray-500 mt-1">
          View all registered users and the books they have purchased.
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
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-sm text-gray-500">
          {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Total Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user, idx) => {
                  const userOrders = userOrdersMap[user.email] || [];
                  const totalSpent = userOrders
                    .filter((o) => o.paymentStatus === 'Succeeded')
                    .reduce((sum, o) => sum + o.totalAmount, 0);

                  return (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-400 font-medium">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-semibold text-gray-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-800">{userOrders.length}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600">
                        ${totalSpent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openUserModal(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-xs font-semibold transition-colors"
                        >
                          <HiEye className="w-4 h-4" /> View Orders
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Order Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {selectedUser.name}'s Orders
                </h3>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6">
              {selectedUser.orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">📦</p>
                  <p>This user has not placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedUser.orders.map((order) => (
                    <div
                      key={order._id}
                      className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-mono text-xs text-gray-400">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                          <span className="ml-3 text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              paymentColors[order.paymentStatus] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                          <span className="font-bold text-gray-800">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Books in order */}
                      <div className="space-y-1 mb-3">
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2"
                          >
                            <span>📚 {item.title}</span>
                            <span className="text-gray-500">
                              x{item.quantity} × ${item.price?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Status change */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-medium">Order Status:</span>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                          {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(
                            (s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            )
                          )}
                        </select>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
