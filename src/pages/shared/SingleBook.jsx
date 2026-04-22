import React, { useContext, useEffect, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { CartContext } from '../../contexts/CartProvider';
import { AuthContext } from '../../contexts/AuthProvider';
import { MdShoppingCart, MdArrowBack, MdZoomIn, MdClose, MdLocalShipping } from 'react-icons/md';
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import { HiBell } from 'react-icons/hi';
import toast from 'react-hot-toast';
import API_BASE from '../../utils/api';

/* ── Delivery Estimate ───────────────────────────── */
const getDeliveryRange = () => {
    const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
    const min = new Date(); min.setDate(min.getDate() + 5);
    const max = new Date(); max.setDate(max.getDate() + 7);
    return { min: fmt(min), max: fmt(max) };
};
const DeliveryEstimate = () => {
    const { min, max } = getDeliveryRange();
    return (
        <div className="flex items-center gap-2.5 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm w-fit">
            <MdLocalShipping className="text-green-600 w-5 h-5 flex-shrink-0" />
            <span className="text-green-700 font-medium">
                Expected delivery: <span className="font-bold">{min}</span> – <span className="font-bold">{max}</span>
            </span>
        </div>
    );
};


/* ── Deterministic pseudo-random count from bookId ─────────────── */
const getRatingCount = (id = '') => {
    // Sum char codes of the id string, mod 15, + 1  =>  always 1–15 for any given id
    const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return (hash % 15) + 1;
};

/* ── Star Rating ───────────────────────────────── */
const StarRating = ({ rating = 0, count = 0 }) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => {
                    if (i < full)           return <FaStar        key={i} className="text-amber-400 w-4 h-4" />;
                    if (i === full && half) return <FaStarHalfAlt key={i} className="text-amber-400 w-4 h-4" />;
                    return                         <FaRegStar     key={i} className="text-amber-300/40 w-4 h-4" />;
                })}
            </div>
            <span className="text-sm font-bold text-gray-700">{rating.toFixed(1)}</span>
            <span className="text-sm text-gray-400">/&nbsp;5</span>
            {count > 0 ? (
                <span className="ml-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {count} rating{count !== 1 ? 's' : ''}
                </span>
            ) : (
                <span className="ml-1 text-xs font-medium text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full italic">
                    No ratings yet
                </span>
            )}
        </div>
    );
};

/* ── Tag colours ──────────────────────────────────── */
const TAG_COLORS = {
    python:      'bg-blue-100 text-blue-700 border-blue-200',
    javascript:  'bg-yellow-100 text-yellow-700 border-yellow-200',
    typescript:  'bg-sky-100 text-sky-700 border-sky-200',
    java:        'bg-orange-100 text-orange-700 border-orange-200',
    cpp:         'bg-purple-100 text-purple-700 border-purple-200',
    c:           'bg-purple-50 text-purple-600 border-purple-200',
    rust:        'bg-orange-100 text-orange-700 border-orange-200',
    go:          'bg-cyan-100 text-cyan-700 border-cyan-200',
    'ai-ml':     'bg-green-100 text-green-700 border-green-200',
    'web-dev':   'bg-pink-100 text-pink-700 border-pink-200',
    devops:      'bg-teal-100 text-teal-700 border-teal-200',
    algorithms:  'bg-red-100 text-red-700 border-red-200',
    databases:   'bg-indigo-100 text-indigo-700 border-indigo-200',
    'clean-code':'bg-lime-100 text-lime-700 border-lime-200',
    sql:         'bg-indigo-50 text-indigo-600 border-indigo-200',
};
const tagColor = (tag) => TAG_COLORS[tag] || 'bg-gray-100 text-gray-600 border-gray-200';

/* ── Main Component ───────────────────────────────── */
const SingleBook = () => {
    const data         = useLoaderData();
    const navigate     = useNavigate();
    const { addToCart }    = useContext(CartContext);
    const { user }         = useContext(AuthContext);

    const [lightbox,    setLightbox]    = useState(null);
    const [cartAdded,   setCartAdded]   = useState(false);
    const [mainImg,     setMainImg]     = useState(null);
    const [wishlisted,  setWishlisted]  = useState(false);
    const [wishPulse,   setWishPulse]   = useState(false);
    const [onWaitlist,  setOnWaitlist]  = useState(false);
    const [waitlistCount, setWaitlistCount] = useState(0);
    const [waitlistLoading, setWaitlistLoading] = useState(false);

    const {
        _id: bookId,
        bookTitle, authorName, imageURL, category,
        bookDescription, price, rating = 0,
        tags = [], galleryImages = [], stock,
    } = data;

    const allImages = [imageURL, ...galleryImages];

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        setMainImg(imageURL);
    }, [imageURL]);

    // Check wishlist status on mount
    useEffect(() => {
        if (!user || !bookId) return;
        (async () => {
            try {
                const token = localStorage.getItem('bookstore-token');
                const res = await fetch(`${API_BASE}/wishlist/check/${bookId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const d = await res.json();
                    setWishlisted(d.wishlisted);
                }
            } catch { /* silent */ }
        })();
    }, [user, bookId]);

    // Check waitlist status on mount
    useEffect(() => {
        if (!bookId) return;
        (async () => {
            try {
                const token = localStorage.getItem('bookstore-token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const res = await fetch(`${API_BASE}/waitlist/${bookId}/status`, { headers });
                if (res.ok) {
                    const d = await res.json();
                    setOnWaitlist(d.onWaitlist);
                    setWaitlistCount(d.count || 0);
                }
            } catch { /* silent */ }
        })();
    }, [bookId, user]);

    const handleAddToCart = () => {
        if (!user) {
            toast('Please log in to add items to cart', { icon: '🔐' });
            navigate('/login', { state: { from: { pathname: window.location.pathname } } });
            return;
        }
        addToCart(data);
        setCartAdded(true);
        setTimeout(() => setCartAdded(false), 2000);
    };


    const handleWishlist = async () => {
        if (!user) {
            toast('Please log in to add to wishlist', { icon: '🔐' });
            navigate('/login');
            return;
        }
        // Optimistic UI
        const prev = wishlisted;
        setWishlisted(!prev);
        setWishPulse(true);
        setTimeout(() => setWishPulse(false), 400);
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`${API_BASE}/wishlist/toggle/${bookId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const d = await res.json();
            if (res.ok) {
                toast(d.added ? '❤️ Added to wishlist!' : '💔 Removed from wishlist');
                setWishlisted(d.added);
            } else {
                setWishlisted(prev); // rollback
                toast.error('Failed to update wishlist');
            }
        } catch {
            setWishlisted(prev);
            toast.error('Network error');
        }
    };

    const handleWaitlist = async () => {
        if (!user) {
            toast('Please log in to join the waitlist', { icon: '🔐' });
            navigate('/login');
            return;
        }
        setWaitlistLoading(true);
        try {
            const token = localStorage.getItem('bookstore-token');
            if (onWaitlist) {
                const res = await fetch(`${API_BASE}/waitlist/${bookId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    setOnWaitlist(false);
                    setWaitlistCount(c => Math.max(0, c - 1));
                    toast('Removed from waitlist', { icon: '👋' });
                }
            } else {
                const res = await fetch(`${API_BASE}/waitlist/${bookId}`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    setOnWaitlist(true);
                    setWaitlistCount(c => c + 1);
                    toast.success("You're on the waitlist! We'll restock soon.");
                }
            }
        } catch {
            toast.error('Failed to update waitlist');
        } finally {
            setWaitlistLoading(false);
        }
    };

    const isOutOfStock = stock === 0;

    return (
        <>
            {/* Lightbox */}
            {lightbox && (
                <div
                    onClick={() => setLightbox(null)}
                    className="lightbox-backdrop fixed inset-0 bg-black/75 z-[100] flex items-center justify-center p-4 animate-fade-scale"
                >
                    <button
                        onClick={() => setLightbox(null)}
                        className="absolute top-5 right-5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
                    >
                        <MdClose className="w-7 h-7" />
                    </button>
                    <img
                        src={lightbox}
                        alt="Preview"
                        onClick={e => e.stopPropagation()}
                        className="max-w-3xl w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                    />
                </div>
            )}

            {/* ── Page — white background matching home ─── */}
            <div className="min-h-screen bg-white">

                {/* Soft teal top strip matching the home Banner */}
                <div className="bg-teal-50 border-b border-teal-100 px-4 lg:px-24 pt-24 pb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-700 transition-colors font-medium group"
                    >
                        <MdArrowBack className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Shop
                    </button>
                </div>

                <div className="px-4 lg:px-24 py-14">

                    {/* ── Hero Row ───────────────────────────── */}
                    <div className="flex flex-col lg:flex-row gap-14 items-start">

                        {/* Image panel */}
                        <div className="animate-slide-left lg:w-2/5 flex gap-3 items-start">

                            {/* Thumbnail strip */}
                            {allImages.length > 1 && (
                                <div className="flex flex-col gap-2 flex-shrink-0 w-[70px]">
                                    {allImages.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setMainImg(img)}
                                            className={`w-[70px] h-[88px] rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                                                mainImg === img
                                                    ? 'border-blue-500 shadow-md'
                                                    : 'border-gray-200 opacity-55 hover:opacity-85 hover:border-blue-300'
                                            }`}
                                        >
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Main image — click to open lightbox */}
                            <div
                                className="flex-1 animate-float-book cursor-zoom-in group relative"
                                onClick={() => setLightbox(mainImg)}
                            >
                                <img
                                    src={mainImg || imageURL}
                                    alt={bookTitle}
                                    className="w-full max-h-[420px] object-contain rounded-2xl shadow-lg ring-1 ring-gray-200 bg-gray-50 transition-transform duration-300 group-hover:scale-[1.02]"
                                />
                                {/* Hover zoom icon overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl bg-black/8">
                                    <div className="bg-white/80 rounded-full p-3 shadow-md">
                                        <MdZoomIn className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Book info */}
                        <div className="animate-slide-right lg:w-3/5 flex flex-col gap-5">

                            {/* Category + tags */}
                            <div className="animate-fade-up delay-100 flex flex-wrap gap-2">
                                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest border border-blue-200">
                                    {category}
                                </span>
                                {tags.map(tag => (
                                    <span key={tag} className={`px-3 py-1 rounded-full text-xs font-semibold border ${tagColor(tag)}`}>
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Title */}
                            <h1 className="animate-fade-up delay-200 text-4xl lg:text-5xl font-black leading-tight text-gray-900">
                                {bookTitle}
                            </h1>

                            {/* Author */}
                            <p className="animate-fade-up delay-200 text-gray-500 text-lg">
                                By <span className="text-gray-900 font-semibold">{authorName}</span>
                            </p>

                            {/* Stars + rating count */}
                            <div className="animate-fade-up delay-300">
                                <StarRating
                                    rating={rating}
                                    count={rating > 0 ? getRatingCount(bookId) : 0}
                                />
                            </div>

                            {/* Divider */}
                            <div className="animate-fade-up delay-300 w-20 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" />

                            {/* Description */}
                            <p className="animate-fade-up delay-300 text-gray-600 text-base leading-relaxed">
                                {bookDescription || 'A must-read for anyone serious about mastering this topic.'}
                            </p>

                            {/* Price + CTA + Wishlist */}
                            <div className="animate-fade-up delay-400 pt-6 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <div className="text-5xl font-black text-blue-700">
                                        ₹{price ? price.toFixed(2) : '10.00'}
                                    </div>

                                    {/* Waitlist OR Add to Cart */}
                                    {isOutOfStock ? (
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={handleWaitlist}
                                                disabled={waitlistLoading}
                                                className={`flex items-center justify-center gap-3 px-10 py-4 text-white text-lg font-bold rounded-2xl shadow-lg transition-all duration-300 ${
                                                    onWaitlist
                                                        ? 'bg-purple-600 hover:bg-purple-700'
                                                        : 'bg-gray-700 hover:bg-gray-800'
                                                } active:scale-95 disabled:opacity-60`}
                                            >
                                                <HiBell className="w-5 h-5" />
                                                {onWaitlist ? 'Leave Waitlist' : 'Join Waitlist'}
                                            </button>
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                                                Out of stock
                                                {waitlistCount > 0 && (
                                                    <span className="ml-1 font-semibold text-purple-600">
                                                        · {waitlistCount} {waitlistCount === 1 ? 'person' : 'people'} waiting
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleAddToCart}
                                            className={`flex items-center justify-center gap-3 px-10 py-4 text-white text-lg font-bold rounded-2xl shadow-lg transition-all duration-300 ${
                                                cartAdded
                                                    ? 'bg-green-600 scale-95'
                                                    : 'bg-blue-700 hover:bg-blue-800 active:scale-95'
                                            }`}
                                        >
                                            <MdShoppingCart className="w-6 h-6" />
                                            {cartAdded ? '✓ Added to Cart!' : 'Add to Cart'}
                                        </button>
                                    )}

                                    {/* Wishlist heart button */}
                                    <button
                                        onClick={handleWishlist}
                                        title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                        className={`flex items-center gap-2 px-5 py-4 rounded-2xl font-bold text-base border-2 transition-all duration-200 active:scale-90 ${
                                            wishPulse ? 'scale-125' : ''
                                        } ${
                                            wishlisted
                                                ? 'bg-red-50 border-red-300 text-red-500 hover:bg-red-100'
                                                : 'bg-white border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'
                                        }`}
                                    >
                                        {wishlisted
                                            ? <FaHeart    className="w-5 h-5 transition-transform" />
                                            : <FaRegHeart className="w-5 h-5 transition-transform" />
                                        }
                                        <span className="text-sm">{wishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Estimated Delivery */}
                            <div className="animate-fade-up delay-400">
                                <DeliveryEstimate /></div>
                        </div>
                    </div>

                    {/* ── Book Details table ──────────────────── */}
                    <div className="animate-fade-up delay-500 mt-14 bg-gray-50 border border-gray-200 rounded-2xl p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Book Details</h2>
                        <div className="text-sm divide-y divide-gray-100">
                            {[
                                ['Title',    bookTitle],
                                ['Author',   authorName],
                                ['Category', category],
                                ['Rating',   `${rating.toFixed(1)} / 5.0 ⭐`],
                                ['Price',    `₹${price ? price.toFixed(2) : '10.00'}`],
                                ['Tags',     tags.join(', ') || '—'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between py-3.5">
                                    <span className="text-gray-400 font-medium">{label}</span>
                                    <span className="text-gray-900 font-semibold text-right max-w-[65%]">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SingleBook;