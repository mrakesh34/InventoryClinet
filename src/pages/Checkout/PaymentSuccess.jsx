import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaStar, FaTruck } from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';

// delivery date helper
const getDeliveryRange = () => {
    const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', weekday: 'long' });
    const min = new Date(); min.setDate(min.getDate() + 5);
    const max = new Date(); max.setDate(max.getDate() + 7);
    return { min: fmt(min), max: fmt(max) };
};

// animated stars component
const AnimatedStars = () => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 1800);
        return () => clearTimeout(t);
    }, []);
    return (
        <div className={`flex gap-1 justify-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <FaStar
                    key={i}
                    className="text-amber-400 w-6 h-6"
                    style={{
                        animationDelay: `${i * 0.12}s`,
                        animation: visible ? `star-pop 0.4s ease ${i * 0.12}s both` : 'none',
                    }}
                />
            ))}
        </div>
    );
};

// floating confetti dots
const Confetti = () => {
    const dots = [
        { color: 'bg-blue-400',   top: '12%', left: '8%',  delay: '0s',    size: 'w-3 h-3' },
        { color: 'bg-green-400',  top: '18%', left: '85%', delay: '0.2s',  size: 'w-4 h-4' },
        { color: 'bg-yellow-400', top: '65%', left: '5%',  delay: '0.4s',  size: 'w-2 h-2' },
        { color: 'bg-pink-400',   top: '72%', left: '90%', delay: '0.1s',  size: 'w-3 h-3' },
        { color: 'bg-purple-400', top: '35%', left: '92%', delay: '0.6s',  size: 'w-2 h-2' },
        { color: 'bg-indigo-400', top: '50%', left: '3%',  delay: '0.3s',  size: 'w-4 h-4' },
        { color: 'bg-rose-400',   top: '85%', left: '50%', delay: '0.5s',  size: 'w-3 h-3' },
        { color: 'bg-teal-400',   top: '8%',  left: '50%', delay: '0.7s',  size: 'w-2 h-2' },
    ];
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {dots.map((d, i) => (
                <div
                    key={i}
                    className={`absolute ${d.color} ${d.size} rounded-full opacity-70`}
                    style={{
                        top: d.top, left: d.left,
                        animation: `float-confetti 3s ease-in-out ${d.delay} infinite alternate`,
                    }}
                />
            ))}
        </div>
    );
};

// review reminder banner
const ReviewReminder = () => {
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setShow(true), 2400);
        return () => clearTimeout(t);
    }, []);

    if (dismissed) return null;

    return (
        <div
            className={`mt-6 transition-all duration-700 ease-out ${
                show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
            }`}
        >
            <div className="relative bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 rounded-2xl px-5 py-4 shadow-md overflow-hidden">
                {/* Shimmer sweep */}
                <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                        background: 'linear-gradient(120deg, transparent 30%, rgba(255,220,80,0.5) 50%, transparent 70%)',
                        animation: 'shimmer-sweep 2.5s ease-in-out 3s 3',
                    }}
                />
                <button
                    onClick={() => setDismissed(true)}
                    className="absolute top-2 right-3 text-amber-400 hover:text-amber-600 text-lg leading-none"
                    aria-label="Dismiss"
                >
                    ×
                </button>

                {/* Stars animation */}
                <AnimatedStars />

                {/* Message */}
                <p className="mt-3 text-center text-amber-800 font-bold text-base leading-snug">
                    🎉 Don't forget to leave a review after delivery!
                </p>
                <p className="mt-1 text-center text-amber-600 text-sm">
                    Your feedback helps other readers discover great books. ⭐
                </p>

                {/* Pulsing bar */}
                <div className="mt-3 h-1 rounded-full bg-amber-200 overflow-hidden">
                    <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ animation: 'progress-pulse 2s ease-in-out 2.5s infinite alternate' }}
                    />
                </div>
            </div>
        </div>
    );
};

// payment success page
const PaymentSuccess = () => {
    const navigate = useNavigate();
    const { min, max } = getDeliveryRange();
    const [cardVisible, setCardVisible] = useState(false);

    useEffect(() => {
        // Scroll to very top instantly on mount
        window.scrollTo({ top: 0, behavior: 'instant' });
        // Trigger entrance animation
        const t = setTimeout(() => setCardVisible(true), 80);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
            {/* Keyframe styles */}
            <style>{`
                @keyframes float-confetti {
                    0%   { transform: translateY(0px) rotate(0deg); }
                    100% { transform: translateY(-18px) rotate(15deg); }
                }
                @keyframes star-pop {
                    0%   { transform: scale(0) rotate(-20deg); opacity: 0; }
                    70%  { transform: scale(1.3) rotate(5deg);  opacity: 1; }
                    100% { transform: scale(1)   rotate(0deg);  opacity: 1; }
                }
                @keyframes shimmer-sweep {
                    0%   { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                @keyframes progress-pulse {
                    0%   { width: 30%; }
                    100% { width: 100%; }
                }
                @keyframes bounce-check {
                    0%,100% { transform: scale(1); }
                    40%     { transform: scale(1.18); }
                    60%     { transform: scale(0.94); }
                }
                @keyframes slide-up-fade {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0)     scale(1);    }
                }
            `}</style>

            <div className="fixed inset-0 top-[64px] bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 py-6">
                <div
                    className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 overflow-hidden transition-all duration-700 ${
                        cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    }`}
                    style={{ animation: cardVisible ? 'slide-up-fade 0.6s ease both' : 'none' }}
                >
                    <Confetti />

                    {/* Check icon */}
                    <div className="flex justify-center mb-5">
                        <div
                            className="bg-green-100 rounded-full p-5 shadow-inner"
                            style={{ animation: 'bounce-check 0.7s ease 0.3s both' }}
                        >
                            <FaCheckCircle className="text-6xl text-green-500" />
                        </div>
                    </div>

                    {/* Title & message */}
                    <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-2">
                        Payment Successful! 🎊
                    </h1>
                    <p className="text-gray-500 text-center text-sm mb-6 leading-relaxed">
                        Thank you for your purchase! Your order has been confirmed and is being prepared.
                    </p>

                    {/* Delivery estimate card */}
                    <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
                        <MdLocalShipping className="text-green-600 w-6 h-6 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-green-800 font-bold text-sm">Expected Delivery</p>
                            <p className="text-green-700 text-sm font-medium mt-0.5">{min}</p>
                            <p className="text-green-500 text-xs">to</p>
                            <p className="text-green-700 text-sm font-medium">{max}</p>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/profile', { state: { activeTab: 'purchases' } })}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-base"
                        >
                            <FaShoppingBag /> View My Order
                        </button>
                        <button
                            onClick={() => navigate('/shop')}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors text-base"
                        >
                            Continue Shopping
                        </button>
                    </div>

                    {/* ── Animated Review Reminder ── */}
                    <ReviewReminder />
                </div>
              </div>
            </div>
        </>
    );
};

export default PaymentSuccess;
