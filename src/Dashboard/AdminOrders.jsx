import React, { useState, useEffect } from 'react';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch('http://localhost:5000/api/orders/all-orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            } else {
                setError('Failed to fetch orders.');
            }
        } catch (err) {
            console.error(err);
            setError('Network error fetching orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
            } else {
                alert('Failed to update order status');
            }
        } catch (err) {
            console.error('Update status error:', err);
            alert('Network error while updating status');
        }
    };

    if (loading) {
        return <div className="w-full px-4 mb-16">Loading orders...</div>;
    }

    if (error) {
        return <div className="w-full px-4 mb-16 text-red-600">{error}</div>;
    }

    return (
        <div className="w-full px-4 mb-16">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Manage Orders</h2>
            
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-[1000px] w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                        <tr>
                            <th scope="col" className="px-6 py-4">Order ID</th>
                            <th scope="col" className="px-6 py-4">Customer</th>
                            <th scope="col" className="px-6 py-4">Date</th>
                            <th scope="col" className="px-6 py-4">Total</th>
                            <th scope="col" className="px-6 py-4">Payment</th>
                            <th scope="col" className="px-6 py-4">Status</th>
                            <th scope="col" className="px-6 py-4">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-mono text-xs">{order._id.substring(order._id.length - 8)}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{order.user}</div>
                                    <div className="text-xs text-gray-400 truncate max-w-[200px]" title={order.shippingAddress?.street}>
                                        {order.shippingAddress?.street}, {order.shippingAddress?.city}
                                    </div>
                                </td>
                                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-bold text-gray-800">${order.totalAmount.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs ${order.paymentStatus === 'Succeeded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {order.paymentStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <select 
                                        value={order.orderStatus} 
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        className="font-medium text-blue-600 hover:underline"
                                        onClick={() => alert(`Items: ${order.items.map(i => i.title).join(', ')}`)}
                                    >
                                        View Items
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
