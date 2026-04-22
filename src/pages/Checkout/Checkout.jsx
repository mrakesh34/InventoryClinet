import React, { useState, useEffect, useContext } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AuthContext } from '../../contexts/AuthProvider';
import { CartContext } from '../../contexts/CartProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API_BASE from '../../utils/api';
import { MdLocalShipping } from 'react-icons/md';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ── Delivery Estimate ─────────────────────────────────────────────────────────
const getDeliveryRange = () => {
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
  const min = new Date(); min.setDate(min.getDate() + 5);
  const max = new Date(); max.setDate(max.getDate() + 7);
  return { min: fmt(min), max: fmt(max) };
};
const DeliveryEstimate = () => {
  const { min, max } = getDeliveryRange();
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl text-xs mb-4">
      <MdLocalShipping className="text-green-600 w-4 h-4 flex-shrink-0" />
      <span className="text-green-700 font-medium">
        Est. delivery: <strong>{min}</strong> – <strong>{max}</strong>
      </span>
    </div>
  );
};


// ── Indian States & UTs ────────────────────────────────────────────────────────
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  // Union Territories
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

// ── Validation Rules ───────────────────────────────────────────────────────────
const EMPTY_ADDRESS = {
  name: '', phone: '', street: '', city: '', state: '', zip: '', country: 'India',
};

const validate = (fields) => {
  const errs = {};

  // Full Name — letters, spaces, dots, hyphens only; min 2 chars
  if (!fields.name.trim()) {
    errs.name = 'Full name is required.';
  } else if (!/^[a-zA-Z\s.\-']+$/.test(fields.name.trim())) {
    errs.name = 'Name must contain only letters, spaces, dots, or hyphens.';
  } else if (fields.name.trim().length < 2) {
    errs.name = 'Name must be at least 2 characters.';
  }

  // Mobile — mandatory, 10 digits, starts with 6–9
  if (!fields.phone.trim()) {
    errs.phone = 'Mobile number is required.';
  } else if (!/^[6-9]\d{9}$/.test(fields.phone.replace(/\s/g, ''))) {
    errs.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6–9).';
  }

  // House/Flat/Street — min 5 chars
  if (!fields.street.trim()) {
    errs.street = 'Address (house/flat/street) is required.';
  } else if (fields.street.trim().length < 5) {
    errs.street = 'Please enter a more complete address (min 5 characters).';
  }

  // City — letters only, min 2 chars
  if (!fields.city.trim()) {
    errs.city = 'City is required.';
  } else if (!/^[a-zA-Z\s\-']+$/.test(fields.city.trim())) {
    errs.city = 'City name must contain only letters.';
  } else if (fields.city.trim().length < 2) {
    errs.city = 'Enter a valid city name.';
  }

  // State
  if (!fields.state) {
    errs.state = 'Please select your state.';
  }

  // PIN Code — exactly 6 digits
  if (!fields.zip.trim()) {
    errs.zip = 'PIN code is required.';
  } else if (!/^\d{6}$/.test(fields.zip.trim())) {
    errs.zip = 'PIN code must be exactly 6 digits.';
  }

  return errs;
};

// ── Input Field Helper ─────────────────────────────────────────────────────────
const Field = ({ label, error, required, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

const inputCls = (err) =>
  `w-full px-4 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
    err
      ? 'border-red-400 focus:ring-red-300 bg-red-50'
      : 'border-gray-300 focus:ring-blue-400 bg-white'
  }`;

// ── Address form ───────────────────────────────────────────────────────────────
const AddressForm = ({ onSaved, onCancel, showCancel }) => {
  const [fields, setFields] = useState(EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key, val) => {
    setFields((prev) => ({ ...prev, [key]: val }));
    // clear error on change
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Please fix the errors below.');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('bookstore-token');
      const res = await fetch(`${API_BASE}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...fields, country: 'India' }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Address saved!');
        onSaved(data._id);
        setFields(EMPTY_ADDRESS);
        setErrors({});
      } else {
        toast.error(data.error || 'Failed to save address.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">
        📍 Add Delivery Address
      </h3>

      {/* Row 1: Name + Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full Name" required error={errors.name}>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={fields.name}
            onChange={(e) => set('name', e.target.value)}
            className={inputCls(errors.name)}
          />
        </Field>

        <Field label="Mobile Number" required error={errors.phone}>
          <div className="flex">
            <span className="flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-600 font-medium whitespace-nowrap">
              🇮🇳 +91
            </span>
            <input
              type="tel"
              placeholder="9876543210"
              value={fields.phone}
              maxLength={10}
              onChange={(e) => set('phone', e.target.value.replace(/\D/g, ''))}
              className={`flex-1 px-4 py-2.5 border rounded-r-lg text-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.phone
                  ? 'border-red-400 focus:ring-red-300 bg-red-50'
                  : 'border-gray-300 focus:ring-blue-400 bg-white'
              }`}
            />
          </div>
          {errors.phone && <p className="text-xs text-red-500 mt-0.5">{errors.phone}</p>}
        </Field>
      </div>

      {/* Row 2: House/Flat/Building + Area/Street */}
      <Field label="Flat / House No., Building, Apartment" required error={errors.street}>
        <input
          type="text"
          placeholder="e.g. 12B, Sunshine Apartments, MG Road"
          value={fields.street}
          onChange={(e) => set('street', e.target.value)}
          className={inputCls(errors.street)}
        />
      </Field>

      {/* Row 3: City + State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="City / Town" required error={errors.city}>
          <input
            type="text"
            placeholder="e.g. Pune"
            value={fields.city}
            onChange={(e) => set('city', e.target.value)}
            className={inputCls(errors.city)}
          />
        </Field>

        <Field label="State / UT" required error={errors.state}>
          <select
            value={fields.state}
            onChange={(e) => set('state', e.target.value)}
            className={`${inputCls(errors.state)} appearance-none`}
          >
            <option value="">— Select State —</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Row 4: PIN Code + Country (read-only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="PIN Code" required error={errors.zip}>
          <input
            type="text"
            placeholder="e.g. 411001"
            value={fields.zip}
            maxLength={6}
            onChange={(e) => set('zip', e.target.value.replace(/\D/g, ''))}
            className={inputCls(errors.zip)}
          />
        </Field>

        <Field label="Country">
          <input
            type="text"
            value="India"
            readOnly
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </Field>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow transition-all active:scale-95 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Address'}
        </button>
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-600 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

// ── Checkout Form (main) ───────────────────────────────────────────────────────
const CheckoutForm = ({ clientSecret, addresses, refreshAddresses }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { cartItems, getCartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Auto-select first address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(addresses[0]._id);
    } else if (addresses.length === 0) {
      setIsAddingNewAddress(true);
    }
  }, [addresses, selectedAddressId]);

  const handleAddressSaved = async (newId) => {
    await refreshAddresses();
    setSelectedAddressId(newId);
    setIsAddingNewAddress(false);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!selectedAddressId) {
      setErrorMsg('Please select or add a delivery address.');
      toast.error('Please select or add a delivery address.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {},
      redirect: 'if_required',
    });

    if (error) {
      setErrorMsg(error.message);
      toast.error(error.message);
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        const token = localStorage.getItem('bookstore-token');
        const orderRes = await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            addressId: selectedAddressId,
          }),
        });

        if (orderRes.ok) {
          toast.success('Payment successful! Order confirmed. 🎉');
          navigate('/payment-success');
          window.location.reload();
        } else {
          const data = await orderRes.json();
          setErrorMsg(data.error || 'Failed to create order. Please contact support.');
          toast.error(data.error || 'Failed to create order.');
        }
      } catch {
        setErrorMsg('Network error while creating order.');
        toast.error('Network error while creating order.');
      }
    } else {
      setErrorMsg('Payment did not succeed. Please try again.');
      toast.error('Payment did not succeed.');
    }

    setIsProcessing(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left — Address & Payment */}
      <div className="flex-1 space-y-6">

        {/* Address Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-800">🚚 Delivery Address</h2>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {errorMsg}
            </div>
          )}

          {!isAddingNewAddress ? (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    selectedAddressId === addr._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    className="mt-1 accent-blue-600"
                    checked={selectedAddressId === addr._id}
                    onChange={() => setSelectedAddressId(addr._id)}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{addr.name}</p>
                    <p className="text-sm text-gray-600">{addr.street}</p>
                    <p className="text-sm text-gray-600">
                      {addr.city}, {addr.state} — {addr.zip}
                    </p>
                    <p className="text-sm text-gray-600">{addr.country}</p>
                    {addr.phone && (
                      <p className="text-sm text-gray-500 mt-1">
                        📱 +91 {addr.phone}
                      </p>
                    )}
                  </div>
                </label>
              ))}

              <button
                type="button"
                onClick={() => setIsAddingNewAddress(true)}
                className="mt-2 flex items-center gap-2 text-blue-600 text-sm font-semibold hover:underline"
              >
                + Add a new address
              </button>
            </div>
          ) : (
            <AddressForm
              onSaved={handleAddressSaved}
              onCancel={() => setIsAddingNewAddress(false)}
              showCancel={addresses.length > 0}
            />
          )}
        </div>

        {/* Payment Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-800">💳 Payment Details</h2>
          <PaymentElement />
        </div>
      </div>

      {/* Right — Order Summary */}
      <div className="w-full lg:w-1/3 bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit sticky top-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">🛒 Order Summary</h2>
        <div className="space-y-4 mb-6">
          {cartItems.filter((item) => item.book).map((item) => (
            <div key={item.book._id} className="flex gap-3">
              <img
                src={item.book.imageURL}
                alt={item.book.bookTitle}
                className="w-12 h-16 object-cover rounded shadow-sm"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold line-clamp-2 text-gray-800">{item.book.bookTitle}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-gray-800 self-start">
                ₹{(item.book.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between font-bold text-lg text-gray-800">
            <span>Total:</span>
            <span className="text-blue-700">₹{getCartTotal().toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes. Free shipping.</p>
        </div>

        {/* Delivery Estimate */}
        <DeliveryEstimate />

        <button
          onClick={handlePayment}
          disabled={
            isProcessing ||
            !stripe ||
            !elements ||
            (addresses.length > 0 && !selectedAddressId) ||
            isAddingNewAddress
          }
          className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
        >
          {isProcessing ? '⏳ Processing...' : `Pay ₹${getCartTotal().toFixed(2)}`}
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">🔒 Secured by Stripe</p>
      </div>
    </div>
  );
};

// ── Checkout Page ──────────────────────────────────────────────────────────────
const Checkout = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('bookstore-token');
      const res = await fetch(`${API_BASE}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch {
      console.error('Error fetching addresses');
    }
  };

  useEffect(() => {
    const initializeCheckout = async () => {
      const validItems = cartItems.filter((item) => item.book);
      if (validItems.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('bookstore-token');
        await fetchAddresses();

        const res = await fetch(`${API_BASE}/orders/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          setClientSecret(data.clientSecret);
        }
      } catch {
        console.error('Error during checkout init');
      } finally {
        setLoading(false);
      }
    };
    initializeCheckout();
  }, [cartItems]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const validCartItems = cartItems.filter((item) => item.book);
  if (validCartItems.length === 0) {
    return (
      <div className="container mx-auto p-8 mt-20 text-center">
        <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
        <button
          onClick={() => navigate('/shop')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Browse Books
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 mt-20 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>

      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <CheckoutForm
            clientSecret={clientSecret}
            addresses={addresses}
            refreshAddresses={fetchAddresses}
          />
        </Elements>
      ) : (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      )}
    </div>
  );
};

export default Checkout;
