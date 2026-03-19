import React, { useState, useEffect, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AuthContext } from '../../contexts/AuthProvider';
import { CartContext } from '../../contexts/CartProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API_BASE from '../../utils/api';

// Initialize Stripe with the provided Test Public Key
const stripePromise = loadStripe('pk_test_51TBDgpGYkY6jukzH7TAjxwVrk8tuNwiT5llzSErfASoomqxzOW2v1i64Ld5b5957JSgsp99s49Dd9TljfLEKKDbI009yqQbTV8');

const CheckoutForm = ({ clientSecret, addresses, refreshAddresses }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useContext(AuthContext);
    const { cartItems, getCartTotal, setIsCartOpen } = useContext(CartContext);
    const navigate = useNavigate();

    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: '', street: '', city: '', state: '', zip: '', country: 'US', phone: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // Initial select
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0]._id);
        } else if (addresses.length === 0) {
            setIsAddingNewAddress(true);
        }
    }, [addresses, selectedAddressId]);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`${API_BASE}/addresses`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newAddress)
            });
            const data = await res.json();
            if (res.ok) {
                await refreshAddresses();
                setSelectedAddressId(data._id);
                setIsAddingNewAddress(false);
                setNewAddress({ name: '', street: '', city: '', state: '', zip: '', country: 'US', phone: '' });
                toast.success("Address added successfully");
            } else {
                setErrorMsg(data.error || 'Failed to add address');
                toast.error(data.error || 'Failed to add address');
            }
        } catch (error) {
            console.error('Add address error:', error);
            setErrorMsg('Network error. Please try again.');
            toast.error('Network error. Please try again.');
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        
        if (!stripe || !elements) return;
        
        if (!selectedAddressId) {
            setErrorMsg('Please select or add a shipping address');
            toast.error('Please select or add a shipping address');
            return;
        }

        setIsProcessing(true);
        setErrorMsg(null);

        // 1. Confirm payment with Stripe
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL not used because we redirect manually after resolving
            },
            redirect: 'if_required' 
        });

        if (error) {
            setErrorMsg(error.message);
            toast.error(error.message);
            setIsProcessing(false);
            return;
        }

        // 2. Determine payment status logic
        if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
                // 3. Create the Order in our DB
                const token = localStorage.getItem('bookstore-token');
                const orderRes = await fetch(`${API_BASE}/orders`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id,
                        addressId: selectedAddressId
                    })
                });

                if (orderRes.ok) {
                    // Success! 
                    // Cart clear logic is on Backend, so frontend needs to fetch empty cart or reload context
                    toast.success('Payment successful! Order confirmed.');
                    navigate('/payment-success');
                    window.location.reload(); 
                } else {
                    const data = await orderRes.json();
                    setErrorMsg(data.error || 'Failed to create order, but payment succeeded. Please contact support.');
                    toast.error(data.error || 'Failed to create order.');
                }
            } catch (err) {
                console.error('Order creation error:', err);
                setErrorMsg('Network error while creating order.');
                toast.error('Network error while creating order.');
            }
        } else {
            setErrorMsg('Payment did not succeed. Status: ' + (paymentIntent?.status || 'Unknown'));
            toast.error('Payment did not succeed.');
        }

        setIsProcessing(false);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Left side: Address & Payment */}
            <div className="flex-1 space-y-8">
                {/* Address Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                    
                    {errorMsg && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">
                            {errorMsg}
                        </div>
                    )}

                    {!isAddingNewAddress ? (
                        <>
                            {addresses.length > 0 ? (
                                <div className="space-y-4">
                                    {addresses.map(addr => (
                                        <label key={addr._id} className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                                            <input 
                                                type="radio" 
                                                name="address" 
                                                className="mt-1"
                                                checked={selectedAddressId === addr._id}
                                                onChange={() => setSelectedAddressId(addr._id)}
                                            />
                                            <div className="ml-3">
                                                <p className="font-semibold">{addr.name}</p>
                                                <p className="text-sm text-gray-600">{addr.street}</p>
                                                <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zip}</p>
                                                <p className="text-sm text-gray-600">{addr.country}</p>
                                            </div>
                                        </label>
                                    ))}
                                    <button 
                                        type="button" 
                                        onClick={() => setIsAddingNewAddress(true)}
                                        className="text-blue-600 text-sm font-medium hover:underline"
                                    >
                                        + Add a new address
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No addresses found.</p>
                            )}
                        </>
                    ) : (
                        <form onSubmit={handleAddAddress} className="space-y-4">
                            <h3 className="font-semibold text-gray-800">Add New Address</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Full Name" required className="border p-2 rounded" 
                                    value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} />
                                <input type="text" placeholder="Phone (optional)" className="border p-2 rounded" 
                                    value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                                <input type="text" placeholder="Street Address" required className="border p-2 rounded md:col-span-2" 
                                    value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                                <input type="text" placeholder="City" required className="border p-2 rounded" 
                                    value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                                <input type="text" placeholder="State/Province" required className="border p-2 rounded" 
                                    value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                                <input type="text" placeholder="ZIP / Postal Code" required className="border p-2 rounded" 
                                    value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} />
                                <input type="text" placeholder="Country" required className="border p-2 rounded" 
                                    value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Save Address</button>
                                {addresses.length > 0 && (
                                    <button type="button" onClick={() => setIsAddingNewAddress(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                {/* Payment Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4">Payment Details</h2>
                    <PaymentElement />
                </div>
            </div>

            {/* Right side: Order Summary */}
            <div className="w-full lg:w-1/3 bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-4 mb-6">
                    {cartItems.filter(item => item.book).map((item) => (
                        <div key={item.book._id} className="flex gap-3">
                            <img src={item.book.imageURL} alt={item.book.bookTitle} className="w-12 h-16 object-cover rounded" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold line-clamp-2">{item.book.bookTitle}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-bold">${(item.book.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                </div>

                <button 
                    onClick={handlePayment}
                    disabled={isProcessing || !stripe || !elements || (addresses.length > 0 && !selectedAddressId) || isAddingNewAddress}
                    className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Processing Payment...' : `Pay $${getCartTotal().toFixed(2)}`}
                </button>
            </div>
        </div>
    );
};

const Checkout = () => {
    const [clientSecret, setClientSecret] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cartItems } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`${API_BASE}/addresses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    useEffect(() => {
        const initializeCheckout = async () => {
            const validItems = cartItems.filter(item => item.book);
            if (validItems.length === 0) {
                // If there's no item in cart when component mounts, redirect or just show empty state
                setLoading(false);
                return;
            }

            try {
                const token = localStorage.getItem('bookstore-token');
                
                // 1. Fetch addresses
                await fetchAddresses();

                // 2. Create Payment Intent
                const res = await fetch(`${API_BASE}/orders/create-payment-intent`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({}),
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setClientSecret(data.clientSecret);
                }
            } catch (error) {
                console.error('Error during checkout init:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeCheckout();
    }, [cartItems]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Checkout...</div>;
    }

    const validCartItems = cartItems.filter(item => item.book);
    if (validCartItems.length === 0) {
        return (
            <div className="container mx-auto p-8 mt-20 text-center">
                <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
                <button onClick={() => navigate('/shop')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Browse Books</button>
            </div>
        );
    }

    const appearance = {
        theme: 'stripe',
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="container mx-auto p-4 md:p-8 mt-20 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            
            {clientSecret ? (
                <Elements stripe={stripePromise} options={options}>
                    <CheckoutForm clientSecret={clientSecret} addresses={addresses} refreshAddresses={fetchAddresses} />
                </Elements>
            ) : (
                <div className="flex justify-center items-center p-12">
                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
