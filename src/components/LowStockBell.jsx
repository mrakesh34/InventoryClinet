import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { HiBell, HiExclamation, HiX, HiArrowRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import API_BASE from '../utils/api';

/**
 * LowStockBell — shows a notification bell with count badge.
 * Polls /api/books/low-stock every 60 seconds.
 * Uses a React Portal so the dropdown escapes sidebar overflow clipping.
 */
const LowStockBell = ({ dashboardPath = '/admin/dashboard/activity' }) => {
    const [books, setBooks]     = useState([]);
    const [open, setOpen]       = useState(false);
    const [pos, setPos]         = useState({ top: 0, left: 0 });
    const [loading, setLoading] = useState(false);
    const bellRef               = useRef(null);
    const dropdownRef           = useRef(null);

    const fetchLowStock = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('bookstore-token');
            const res   = await fetch(`${API_BASE}/books/low-stock`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setBooks(await res.json());
        } catch {}
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchLowStock();
        const interval = setInterval(fetchLowStock, 60000);
        return () => clearInterval(interval);
    }, [fetchLowStock]);

    // Recalculate dropdown position every time it opens
    const handleToggle = () => {
        if (!open && bellRef.current) {
            const rect = bellRef.current.getBoundingClientRect();
            setPos({
                top:  rect.bottom + window.scrollY + 6,
                left: rect.right  + window.scrollX + 8,
            });
        }
        setOpen(prev => !prev);
    };

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            const clickedBell     = bellRef.current?.contains(e.target);
            const clickedDropdown = dropdownRef.current?.contains(e.target);
            if (!clickedBell && !clickedDropdown) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Close on scroll / resize (reposition would drift)
    useEffect(() => {
        if (!open) return;
        const close = () => setOpen(false);
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        return () => {
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
        };
    }, [open]);

    const count = books.length;

    const dropdown = (
        <div
            ref={dropdownRef}
            style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}
            className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-orange-50">
                <div className="flex items-center gap-2">
                    <HiExclamation className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-gray-800 text-sm">Low Stock Alerts</span>
                    {count > 0 && (
                        <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                            {count}
                        </span>
                    )}
                </div>
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-orange-100">
                    <HiX className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {loading ? (
                    <div className="py-6 flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-400 border-t-transparent" />
                    </div>
                ) : count === 0 ? (
                    <div className="py-8 text-center text-gray-400">
                        <div className="text-3xl mb-1">✅</div>
                        <p className="text-sm">All books are well-stocked!</p>
                    </div>
                ) : (
                    books.map(book => (
                        <div key={book._id}
                             className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 transition-colors">
                            <img
                                src={book.imageURL}
                                alt={book.bookTitle}
                                className="w-9 h-12 object-cover rounded-md flex-shrink-0 shadow-sm"
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{book.bookTitle}</p>
                                <p className="text-[11px] text-gray-500">{book.category}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <span className={`text-sm font-bold ${book.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                                    {book.stock === 0 ? 'Out!' : book.stock}
                                </span>
                                <p className="text-[10px] text-gray-400">/ {book.lowStockThreshold} min</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer link */}
            {count > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                    <Link
                        to={dashboardPath}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700"
                    >
                        Manage Stock <HiArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}
        </div>
    );

    return (
        <div className="relative" ref={bellRef}>
            {/* Bell button */}
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-xl hover:bg-orange-50 transition-colors focus:outline-none"
                title="Low Stock Alerts"
                aria-label={`${count} low stock alert${count !== 1 ? 's' : ''}`}
            >
                <HiBell className={`w-6 h-6 ${count > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
                {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center
                                     bg-red-500 text-white text-[9px] font-bold rounded-full px-1 shadow-sm">
                        {count > 99 ? '99+' : count}
                    </span>
                )}
            </button>

            {/* Render dropdown via portal so it escapes sidebar overflow clipping */}
            {open && createPortal(dropdown, document.body)}
        </div>
    );
};

export default LowStockBell;
