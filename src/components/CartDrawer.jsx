import React, { useContext } from "react";
import { createPortal } from "react-dom";
import { FaXmark, FaTrash, FaMinus, FaPlus } from "react-icons/fa6";
import { CartContext } from "../contexts/CartProvider";
import { Link } from "react-router-dom";
import toast from 'react-hot-toast';

const CartDrawer = () => {
    const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, getCartTotal } = useContext(CartContext);

    return (
        <>
            {/* Overlay */}
            {isCartOpen && (
                <div
                    className="fixed inset-0 bg-black/50 transition-opacity"
                    style={{ zIndex: 99998 }}
                    onClick={() => setIsCartOpen(false)}
                />
            )}

            {/* Close button rendered via Portal - completely outside any stacking context */}
            {isCartOpen && createPortal(
                <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    style={{ position: 'fixed', top: '18px', right: '20px', zIndex: 200000 }}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow"
                    title="Close Cart"
                    aria-label="Close Cart"
                >
                    <FaXmark className="w-5 h-5 text-gray-600" />
                </button>,
                document.body
            )}

            {/* Slide-out Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}
                style={{ zIndex: 99999 }}
            >

                {/* Header */}
                <div className="flex items-center p-6 pr-16 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Your Cart</h2>
                </div>

                {/* Cart Items Area */}
                <div className="p-6 h-[calc(100vh-200px)] overflow-y-auto">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                <span className="text-3xl">🛒</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Your cart is empty</h3>
                                <p className="text-gray-500 text-sm mt-1">Looks like you haven't added any books yet.</p>
                            </div>
                            <button
                                onClick={() => { setIsCartOpen(false); window.location.href = "/shop"; }}
                                className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {cartItems.filter(item => item.book).map((item) => (
                                <div key={item.book._id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <img
                                        src={item.book.imageURL}
                                        alt={item.book.bookTitle}
                                        className="w-20 h-28 object-cover rounded shadow-sm"
                                    />

                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-800 line-clamp-1">{item.book.bookTitle}</h3>
                                            <p className="text-sm text-gray-500">{item.book.authorName}</p>
                                        </div>

                                        <div className="flex justify-between items-end mt-2">
                                            <p className="font-bold text-blue-600">${(item.book.price || 10).toFixed(2)}</p>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-gray-200 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.book._id, item.quantity - 1)}
                                                        className="px-2 py-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <FaMinus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.book._id, item.quantity + 1, item.book.stock)}
                                                        className={`px-2 py-1 transition-colors ${item.quantity >= (item.book.stock ?? Infinity)
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-500 hover:text-blue-600'
                                                            }`}
                                                        disabled={item.quantity >= (item.book.stock ?? Infinity)}
                                                        title={item.quantity >= (item.book.stock ?? Infinity) ? "Max stock reached" : "Increase quantity"}
                                                    >
                                                        <FaPlus className="w-3 h-3" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(item.book._id)}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Remove item"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Checkout */}
                {cartItems.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="text-xl font-bold text-gray-800">${getCartTotal().toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-4">Taxes and shipping calculated at checkout</p>

                        <button
                            onClick={() => { setIsCartOpen(false); window.location.href = "/checkout"; }}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] flex justify-center items-center gap-2"
                        >
                            Checkout
                        </button>

                        <button
                            onClick={() => setIsCartOpen(false)}
                            className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
