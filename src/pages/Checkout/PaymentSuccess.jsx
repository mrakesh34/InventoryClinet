import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag } from 'react-icons/fa';

const PaymentSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-20">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center transform transition-all">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 rounded-full p-6">
                        <FaCheckCircle className="text-6xl text-green-500" />
                    </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
                <p className="text-gray-600 mb-8 text-lg">
                    Thank you for your purchase. Your order has been placed and is currently being processed.
                </p>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => navigate('/profile', { state: { activeTab: 'purchases' } })}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-lg"
                    >
                        <FaShoppingBag />
                        Go to My Purchases
                    </button>
                    <button 
                        onClick={() => navigate('/shop')}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 rounded-xl transition-colors"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
