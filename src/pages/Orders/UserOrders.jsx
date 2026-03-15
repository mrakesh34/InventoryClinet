import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthProvider';

const UserOrders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('bookstore-token');
                if (!token) {
                    setLoading(false);
                    return;
                }
                
                const res = await fetch('http://localhost:5000/api/orders/my-orders', {
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

        fetchOrders();
    }, []);

    if (loading) {
        return <div className="container mx-auto p-8 mt-20">Loading your orders...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-8 mt-20 text-red-600">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8 mt-20 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">My Orders</h1>
            
            {orders.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                    <div className="text-4xl mb-4">📦</div>
                    <h2 className="text-xl font-semibold text-gray-700">No orders yet</h2>
                    <p className="text-gray-500 mt-2">When you buy books, your orders will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white border text-left border-gray-100 rounded-xl shadow-sm overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 flex flex-wrap justify-between items-center p-4 border-b border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Order Placed</p>
                                    <p className="text-sm text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
                                    <p className="text-sm font-bold text-gray-800">${order.totalAmount.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Order #</p>
                                    <p className="text-sm text-gray-800 font-mono">{order._id.substring(order._id.length - 8)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold text-right">Status</p>
                                    <span className={`inline-block px-3 py-1 mt-1 text-xs font-semibold rounded-full ${
                                        order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                        order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                        order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                        order.orderStatus === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {order.orderStatus}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Order Body */}
                            <div className="p-4 md:flex gap-6">
                                <div className="flex-1 space-y-4">
                                    <h4 className="font-semibold text-gray-800 mb-2 border-b pb-2">Items</h4>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2">
                                            <div>
                                                <p className="font-medium text-sm text-gray-800 hover:text-blue-600 line-clamp-1">{item.title}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-sm text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-6 md:mt-0 md:w-64 bg-gray-50 p-4 rounded-lg self-start border border-gray-100">
                                    <h4 className="font-semibold text-gray-800 mb-2">Shipping Details</h4>
                                    {order.shippingAddress ? (
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p className="font-medium text-gray-800">{order.shippingAddress.name}</p>
                                            <p>{order.shippingAddress.street}</p>
                                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                                            <p>{order.shippingAddress.country}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">Address details unavailable.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserOrders;
