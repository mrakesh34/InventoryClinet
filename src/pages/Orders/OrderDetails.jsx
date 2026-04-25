import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft, FaBox, FaMapMarkerAlt, FaCreditCard,
    FaTimesCircle, FaHeadset, FaWhatsapp, FaEnvelope,
    FaCheckCircle, FaBan, FaPhone
} from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';
import { FaStar } from 'react-icons/fa';
import toast from 'react-hot-toast';
import API_BASE from '../../utils/api';

// delivery range
const getDeliveryRange = (orderDate) => {
    const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
    const base = new Date(orderDate);
    const min  = new Date(base); min.setDate(min.getDate() + 5);
    const max  = new Date(base); max.setDate(max.getDate() + 7);
    return { min: fmt(min), max: fmt(max) };
};

// status config
const STATUS = {
    Delivered:  { bar: 'from-emerald-500 to-green-400',  pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <FaCheckCircle /> },
    Shipped:    { bar: 'from-blue-500 to-cyan-400',      pill: 'bg-blue-100 text-blue-700 border-blue-200',           icon: <MdLocalShipping /> },
    Processing: { bar: 'from-amber-500 to-yellow-400',   pill: 'bg-amber-100 text-amber-700 border-amber-200',        icon: null },
    Pending:    { bar: 'from-gray-400 to-gray-300',      pill: 'bg-gray-100 text-gray-600 border-gray-200',           icon: null },
    Cancelled:  { bar: 'from-red-500 to-rose-400',       pill: 'bg-red-100 text-red-600 border-red-200',              icon: <FaBan /> },
};

// rating section
const RatingSection = ({ items }) => {
    const [ratings, setRatings]     = useState({});   // bookId -> selected star
    const [hover, setHover]         = useState({});   // bookId -> hovered star
    const [submitted, setSubmitted] = useState({});   // bookId -> true after submit
    const [submitting, setSubmitting] = useState({}); // bookId -> true while posting
    const [errors, setErrors]       = useState({});   // bookId -> error msg

    const handleRate = async (bookId, star) => {
        if (submitted[bookId] || submitting[bookId]) return;

        // Optimistic: highlight stars + lock immediately
        setRatings(p   => ({ ...p, [bookId]: star }));
        setSubmitting(p => ({ ...p, [bookId]: true }));
        setErrors(p    => ({ ...p, [bookId]: null }));

        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`${API_BASE}/books/${bookId}/rate`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ rating: star }),
            });
            const data = await res.json();
            if (res.ok) {
                setSubmitted(p => ({ ...p, [bookId]: true }));
                toast.success(`Thanks for rating! ⭐ New average: ${data.rating}`);
            } else {
                // Rollback on failure
                const msg = data.message || data.error || 'Could not submit rating';
                setRatings(p   => ({ ...p, [bookId]: 0 }));
                setErrors(p    => ({ ...p, [bookId]: msg }));
                toast.error(msg);
            }
        } catch {
            setRatings(p => ({ ...p, [bookId]: 0 }));
            setErrors(p  => ({ ...p, [bookId]: 'Network error. Try again.' }));
            toast.error('Network error. Please try again.');
        } finally {
            setSubmitting(p => ({ ...p, [bookId]: false }));
        }
    };


    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mt-6">
            <h3 className="text-base font-extrabold text-gray-900 mb-5 flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                    <FaStar className="text-amber-500 w-4 h-4" />
                </div>
                Rate Your Purchase
                <span className="ml-auto text-xs font-medium text-gray-400">Help others with your honest review</span>
            </h3>

            <div className="space-y-4">
                {items.map((item, idx) => {
                    const bookId = item.book?._id;
                    if (!bookId) return null;
                    const selected  = ratings[bookId] || 0;
                    const hoverStar = hover[bookId]   || 0;
                    const active    = hoverStar || selected;
                    const done      = submitted[bookId];
                    const busy      = submitting[bookId];
                    const errMsg    = errors[bookId];

                    return (
                        <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/60">
                            {/* Thumbnail */}
                            <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm">
                                {item.book?.imageURL
                                    ? <img src={item.book.imageURL} alt={item.title} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-xl">📚</div>}
                            </div>
                            {/* Info + Stars */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 text-sm line-clamp-1">{item.title}</p>
                                <p className="text-xs text-gray-500 mb-2">by {item.book?.authorName || 'Unknown Author'}</p>

                                {done ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {[1,2,3,4,5].map(s => (
                                                <FaStar key={s} className={`w-5 h-5 ${s <= selected ? 'text-amber-400' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-emerald-600">✓ Submitted!</span>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-0.5">
                                                {[1,2,3,4,5].map(s => (
                                                    <button key={s} type="button"
                                                        disabled={busy}
                                                        onMouseEnter={() => setHover(p => ({ ...p, [bookId]: s }))}
                                                        onMouseLeave={() => setHover(p => ({ ...p, [bookId]: 0 }))}
                                                        onClick={() => handleRate(bookId, s)}
                                                        className="transition-transform hover:scale-125 disabled:cursor-not-allowed"
                                                        title={`${s} star${s > 1 ? 's' : ''}`}
                                                    >
                                                        <FaStar className={`w-6 h-6 transition-colors ${
                                                            s <= active ? 'text-amber-400' : 'text-gray-200'
                                                        }`} />
                                                    </button>
                                                ))}
                                            </div>
                                            {busy && <span className="text-xs text-gray-400 animate-pulse">Submitting...</span>}
                                            {!busy && selected > 0 && !done && (
                                                <span className="text-xs text-amber-600 font-semibold">
                                                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][selected]}
                                                </span>
                                            )}
                                            {!busy && selected === 0 && (
                                                <span className="text-xs text-gray-400">Tap a star to rate</span>
                                            )}
                                        </div>
                                        {errMsg && (
                                            <p className="text-xs text-red-500 mt-1">⚠ {errMsg}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    );
};

// cancel confirmation modal
const CancelModal = ({ onConfirm, onClose, cancelling }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8">
            <div className="flex justify-center mb-5">
                <div className="bg-red-100 rounded-2xl p-5">
                    <FaTimesCircle className="text-red-500 text-4xl" />
                </div>
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 text-center mb-2">Cancel this Order?</h3>
            <p className="text-gray-500 text-sm text-center leading-relaxed mb-7">
                This action cannot be undone. Items will be restocked and your refund
                will be processed as per our refund policy.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onClose}
                    disabled={cancelling}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors"
                >
                    Keep Order
                </button>
                <button
                    onClick={onConfirm}
                    disabled={cancelling}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                    {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
                </button>
            </div>
        </div>
    </div>
);

// customer support panel
const CustomerSupportPanel = ({ orderId }) => {
    const [open, setOpen] = useState(false);
    const subject = encodeURIComponent(`Support needed for Order #${orderId?.slice(-8).toUpperCase()}`);
    const body    = encodeURIComponent(`Hi Book Vault Support Team,\n\nI need help with my order:\nOrder ID: ${orderId}\n\nIssue:\n[Please describe here]\n\nThank you`);
    const wa      = encodeURIComponent(`Hi, I need help with my Book Vault order #${orderId?.slice(-8).toUpperCase()}`);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all active:scale-95"
            >
                <FaHeadset className="w-4 h-4" /> Customer Support
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 w-68 bg-white rounded-2xl shadow-2xl border border-gray-100 z-40 overflow-hidden" style={{ width: 260 }}>
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-3">
                            <p className="text-white font-bold text-sm">📞 Contact Support</p>
                            <p className="text-indigo-100 text-xs">We&apos;re here to help you!</p>
                        </div>
                        <div className="p-3 space-y-1">
                            <a
                                href={`mailto:support@bookvault.in?subject=${subject}&body=${body}`}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
                            >
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FaEnvelope className="text-indigo-500 w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800">Email Support</p>
                                    <p className="text-xs text-gray-400">support@bookvault.in</p>
                                </div>
                            </a>
                            <a
                                href={`https://wa.me/919999999999?text=${wa}`}
                                target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors"
                            >
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <FaWhatsapp className="text-green-500 w-3.5 h-3.5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-800">WhatsApp</p>
                                    <p className="text-xs text-gray-400">Chat with us instantly</p>
                                </div>
                            </a>
                            <div className="border-t border-gray-100 pt-2 mt-1">
                                <p className="text-xs text-gray-400 text-center">🕒 9 AM – 6 PM IST, Mon–Sat</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// order details page
const OrderDetails = () => {
    const { id }     = useParams();
    const navigate   = useNavigate();
    const [order, setOrder]               = useState(null);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling]     = useState(false);

    const fetchOrder = async () => {
        try {
            const token = localStorage.getItem('bookstore-token');
            const res   = await fetch(`${API_BASE}/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setOrder(await res.json());
            else        setError('Failed to load order details');
        } catch { setError('Network error'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrder(); }, [id]);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            const token = localStorage.getItem('bookstore-token');
            const res   = await fetch(`${API_BASE}/orders/${id}/cancel`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Order cancelled. Stock restored.');
                setShowCancelModal(false);
                await fetchOrder();
            } else toast.error(data.error || 'Failed to cancel.');
        } catch { toast.error('Network error. Please try again.'); }
        finally { setCancelling(false); }
    };

    // loading state
    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-50 gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="text-gray-400 text-sm">Loading order details…</p>
        </div>
    );

    // error state
    if (error || !order) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-sm w-full">
                <div className="text-5xl mb-4">😕</div>
                <h2 className="text-xl font-extrabold text-gray-800 mb-2">Oops!</h2>
                <p className="text-gray-500 text-sm mb-6">{error || 'Order not found'}</p>
                <button onClick={() => navigate('/profile', { state: { activeTab: 'purchases' } })}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-all w-full">
                    Back to Purchases
                </button>
            </div>
        </div>
    );

    const { shippingAddress, items, totalAmount, orderStatus, stripePaymentIntentId, createdAt } = order;
    const s          = STATUS[orderStatus] || STATUS.Pending;
    const { min: dMin, max: dMax } = getDeliveryRange(createdAt);
    const canCancel  = ['Pending', 'Processing'].includes(orderStatus);
    const isCancelled = orderStatus === 'Cancelled';
    const isDelivered = orderStatus === 'Delivered';
    const totalQty   = items.reduce((acc, i) => acc + i.quantity, 0);

    return (
        <>
            {showCancelModal && (
                <CancelModal
                    onConfirm={handleCancel}
                    onClose={() => setShowCancelModal(false)}
                    cancelling={cancelling}
                />
            )}

            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-50 pt-20 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ── Top bar: Back + Support ── */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <button
                            onClick={() => navigate('/profile', { state: { activeTab: 'purchases' } })}
                            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-semibold text-sm transition-colors"
                        >
                            <FaArrowLeft className="w-3.5 h-3.5" /> Back to My Purchases
                        </button>
                    </div>

                    {/* ── Hero Banner ── */}
                    <div className="relative rounded-3xl shadow-xl mb-6 bg-white">
                        {/* Gradient top — overflow-hidden only here */}
                        <div className={`h-36 bg-gradient-to-r ${s.bar} relative rounded-t-3xl overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
                            <div className="absolute bottom-0 left-20 w-32 h-32 bg-white/10 rounded-full translate-y-1/2" />
                            <div className="absolute top-4 left-8 w-16 h-16 bg-white/10 rounded-full" />
                        </div>

                        {/* White footer — no overflow-hidden, dropdown renders freely */}
                        <div className="px-6 sm:px-8 py-5 rounded-b-3xl">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                {/* Title section — fully inside white area, no overlap */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                                        📦
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Order Details</h1>
                                        <p className="text-sm text-gray-500 font-mono mt-0.5">#{order._id.slice(-12).toUpperCase()}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Placed on {new Date(createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Status + actions */}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold rounded-full border ${s.pill}`}>
                                        {s.icon} {orderStatus}
                                    </span>
                                    {canCancel && (
                                        <button
                                            onClick={() => setShowCancelModal(true)}
                                            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-white hover:bg-red-500 font-bold border-2 border-red-200 hover:border-red-500 px-4 py-1.5 rounded-full transition-all"
                                        >
                                            <FaTimesCircle className="w-3.5 h-3.5" /> Cancel Order
                                        </button>
                                    )}
                                    <CustomerSupportPanel orderId={id} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Delivery / Cancelled Banner ── */}
                    {!isCancelled ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 mb-6 flex items-center gap-3">
                            {isDelivered ? (
                                <>
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FaCheckCircle className="text-emerald-500 w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-emerald-700">Order Delivered Successfully</p>
                                        <p className="text-xs text-emerald-500">Thank you for your purchase!</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MdLocalShipping className="text-blue-500 w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-blue-800">Expected Delivery</p>
                                        <p className="text-sm text-blue-600">
                                            <strong>{dMin}</strong> &ndash; <strong>{dMax}</strong>
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FaBan className="text-red-500 w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-red-700">Order Cancelled</p>
                                <p className="text-xs text-red-500">Refund will be processed as per our refund policy.</p>
                            </div>
                        </div>
                    )}

                    {/* ── Main Grid ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                        {/* Left column: Payment + Shipping */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Payment Info */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <FaCreditCard className="text-blue-500 w-4 h-4" />
                                    </div>
                                    Payment Information
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Subtotal</span>
                                        <span className="text-sm font-semibold text-gray-800">₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-sm text-gray-500">Shipping</span>
                                        <span className="text-sm font-semibold text-emerald-600">Free</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-base font-extrabold text-gray-900">Total</span>
                                        <span className="text-xl font-extrabold text-blue-700">₹{totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                                {stripePaymentIntentId && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Transaction ID</p>
                                        <p className="font-mono text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 break-all">{stripePaymentIntentId}</p>
                                    </div>
                                )}
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <FaMapMarkerAlt className="text-indigo-500 w-4 h-4" />
                                    </div>
                                    Shipping Address
                                </h3>
                                {shippingAddress ? (
                                    <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-4 border border-gray-100 space-y-1.5">
                                        <p className="font-extrabold text-gray-900 text-base">{shippingAddress.name}</p>
                                        <p className="text-sm text-gray-600">{shippingAddress.street}</p>
                                        <p className="text-sm text-gray-600">{shippingAddress.city}, {shippingAddress.state} – {shippingAddress.zip}</p>
                                        <p className="text-sm text-gray-600">{shippingAddress.country}</p>
                                        {shippingAddress.phone && (
                                            <p className="text-sm text-gray-500 flex items-center gap-1.5 pt-1">
                                                <FaPhone className="w-3 h-3" /> +91 {shippingAddress.phone}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No shipping address recorded.</p>
                                )}
                            </div>
                        </div>

                        {/* Right column: Items */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-base font-extrabold text-gray-900 mb-5 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                                        <FaBox className="text-amber-500 w-4 h-4" />
                                    </div>
                                    Items in this Order
                                    <span className="ml-auto text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                                        {totalQty} book{totalQty !== 1 ? 's' : ''}
                                    </span>
                                </h3>

                                <div className="space-y-4">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all bg-gray-50/60">
                                            {/* Book cover */}
                                            <div className="w-16 h-22 rounded-xl overflow-hidden flex-shrink-0 shadow-sm bg-gray-100">
                                                {item.book?.imageURL ? (
                                                    <img src={item.book.imageURL} alt={item.title} className="w-16 h-24 object-cover" />
                                                ) : (
                                                    <div className="w-16 h-24 flex items-center justify-center text-2xl">📚</div>
                                                )}
                                            </div>
                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-extrabold text-gray-900 text-sm leading-snug line-clamp-2">{item.title}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">by {item.book?.authorName || 'Unknown Author'}</p>
                                                <p className="text-xs text-gray-400">{item.book?.category || ''}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full">Qty: {item.quantity}</span>
                                                    <span className="text-base font-extrabold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </div>

                                                {/* PDF download if delivered */}
                                                {isDelivered && item.book?.bookPDFURL && (
                                                    <a
                                                        href={item.book.bookPDFURL}
                                                        target="_blank" rel="noopener noreferrer"
                                                        onClick={e => e.stopPropagation()}
                                                        className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
                                                    >
                                                        ⬇ Download PDF
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Rating Section (delivered orders only) ── */}
                    {isDelivered && <RatingSection items={items} />}

                </div>
            </div>
        </>
    );
};

export default OrderDetails;
