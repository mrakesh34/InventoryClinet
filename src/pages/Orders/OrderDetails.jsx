import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBox, FaMapMarkerAlt, FaCreditCard, FaCheckCircle } from 'react-icons/fa';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const token = localStorage.getItem('bookstore-token');
                const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                } else {
                    setError('Failed to load order details');
                }
            } catch (err) {
                console.error(err);
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
                    <button onClick={() => navigate('/profile', { state: { activeTab: 'purchases' } })} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Back to Purchases</button>
                </div>
            </div>
        );
    }

    const { shippingAddress, items, totalAmount, orderStatus, stripePaymentIntentId, createdAt } = order;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header */}
                <button onClick={() => navigate('/profile', { state: { activeTab: 'purchases' } })} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors font-medium">
                    <FaArrowLeft /> Back to My Purchases
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">Order Details</h1>
                            <p className="text-sm text-gray-500 font-mono">Order #{order._id}</p>
                            <p className="text-sm text-gray-500 mt-1">Placed on {new Date(createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                                orderStatus === "Delivered" ? "bg-green-100 text-green-700" : 
                                orderStatus === "Shipped" ? "bg-blue-100 text-blue-700" : 
                                orderStatus === "Cancelled" ? "bg-red-100 text-red-700" : 
                                "bg-yellow-100 text-yellow-700"
                            }`}>
                                {orderStatus}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Transaction & Address Info */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaCreditCard className="text-blue-500" /> Payment Information
                                </h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal:</span>
                                        <span className="font-semibold text-gray-800">${totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Shipping:</span>
                                        <span className="font-semibold text-gray-800">Free</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg mt-2">
                                        <span className="text-gray-800">Total:</span>
                                        <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Transaction ID</span>
                                        <span className="font-mono text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">{stripePaymentIntentId}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-blue-500" /> Shipping Address
                                </h3>
                                {shippingAddress ? (
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 space-y-1">
                                        <p className="font-bold text-gray-900 text-base mb-2">{shippingAddress.name}</p>
                                        <p>{shippingAddress.street}</p>
                                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                                        <p>{shippingAddress.country}</p>
                                        {shippingAddress.phone && <p className="pt-2 text-gray-500 text-xs">Ph: {shippingAddress.phone}</p>}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-sm">No shipping address recorded.</p>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FaBox className="text-blue-500" /> Items in this Order ({items.reduce((acc, item) => acc + item.quantity, 0)})
                            </h3>
                            <div className="space-y-4">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow bg-white">
                                        <div className="w-16 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.book?.imageURL ? (
                                                <img src={item.book.imageURL} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">No Image</div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-bold text-gray-800 line-clamp-2 leading-tight">{item.title}</h4>
                                                <p className="text-xs text-gray-500 mt-1">Author: {item.book?.authorName || 'Unknown Details'}</p>
                                                <p className="text-xs text-gray-500">Category: {item.book?.category || 'N/A'}</p>
                                            </div>
                                            <div className="flex justify-between items-end mt-2">
                                                <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">Qty: {item.quantity}</span>
                                                <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
