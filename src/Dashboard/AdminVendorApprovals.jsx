import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiSearch, HiCheck, HiX, HiClock, HiInformationCircle, HiOfficeBuilding, HiTag, HiArchive, HiPhone, HiDocumentText } from 'react-icons/hi';
import API_BASE from '../utils/api';
import toast from 'react-hot-toast';

/* ─── Vendor Details Modal ───────────────────────────────────── */
const VendorDetailsModal = ({ user, onClose, onApprove, onReject, processing }) => {
    const d = user.vendorDetails || {};

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    const hasDetails = d.businessName || d.description || d.phone ||
        (d.categories && d.categories.length > 0) || d.estimatedStock;

    const modal = (
        <div
            className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-amber-50 border-b border-amber-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-base">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800 text-base">{user.name}</h2>
                            <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-100 text-gray-500 transition-colors">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Application Details</p>

                    {!hasDetails ? (
                        <div className="text-center py-8 text-gray-400">
                            <HiDocumentText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">No additional details were submitted with this application.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Business Name */}
                            {d.businessName && (
                                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                                    <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                                        <HiOfficeBuilding className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">Business Name</p>
                                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{d.businessName}</p>
                                    </div>
                                </div>
                            )}

                            {/* Categories */}
                            {d.categories && d.categories.length > 0 && (
                                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                                    <div className="p-1.5 bg-purple-100 rounded-lg flex-shrink-0">
                                        <HiTag className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">Book Categories</p>
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {d.categories.map(cat => (
                                                <span key={cat} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                                                    {cat}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Estimated Stock */}
                            {d.estimatedStock > 0 && (
                                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                                    <div className="p-1.5 bg-green-100 rounded-lg flex-shrink-0">
                                        <HiArchive className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-green-400 uppercase tracking-wide">Initial Estimated Stock</p>
                                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{d.estimatedStock} books</p>
                                    </div>
                                </div>
                            )}

                            {/* Phone */}
                            {d.phone && (
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className="p-1.5 bg-gray-100 rounded-lg flex-shrink-0">
                                        <HiPhone className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Business Phone</p>
                                        <p className="text-sm font-semibold text-gray-800 mt-0.5">{d.phone}</p>
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {d.description && (
                                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl">
                                    <div className="p-1.5 bg-orange-100 rounded-lg flex-shrink-0">
                                        <HiDocumentText className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">About Their Business</p>
                                        <p className="text-sm text-gray-700 mt-0.5 leading-relaxed">{d.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Applied date */}
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 pt-1">
                        <HiClock className="w-3.5 h-3.5 text-amber-400" />
                        Applied on {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 text-sm font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Close
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { onReject(user._id, user.name); onClose(); }}
                            disabled={processing}
                            className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            <HiX className="w-4 h-4" /> Reject
                        </button>
                        <button
                            onClick={() => { onApprove(user._id, user.name); onClose(); }}
                            disabled={processing}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 text-sm font-semibold transition-colors disabled:opacity-50"
                        >
                            <HiCheck className="w-4 h-4" /> Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
};

/* ─── Main Component ─────────────────────────────────────────── */
const AdminVendorApprovals = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`${API_BASE}/vendor/applications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setApplications(data);
            }
        } catch (err) {
            console.error('Failed to fetch vendor applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchApplications(); }, []);

    const handleApprove = async (userId, name) => {
        setProcessingId(userId);
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`${API_BASE}/vendor/approve/${userId}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success(`✅ ${name} approved as vendor!`);
                setApplications(prev => prev.filter(u => u._id !== userId));
            } else {
                toast.error('Failed to approve vendor');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (userId, name) => {
        setProcessingId(userId);
        try {
            const token = localStorage.getItem('bookstore-token');
            const res = await fetch(`${API_BASE}/vendor/reject/${userId}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                toast.success(`❌ ${name}'s vendor application rejected.`);
                setApplications(prev => prev.filter(u => u._id !== userId));
            } else {
                toast.error('Failed to reject vendor');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setProcessingId(null);
        }
    };

    const filtered = applications.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
        </div>
    );

    return (
        <div className="w-full px-6 py-8 max-w-5xl">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-3xl font-bold text-gray-800">🏪 Vendor Approvals</h1>
                    {applications.length > 0 && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse">
                            {applications.length} pending
                        </span>
                    )}
                </div>
                <p className="text-gray-500">Review and approve vendor applications. Approved vendors get full access to the Vendor Dashboard.</p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="Search by name or email..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <span className="text-sm text-gray-500">{filtered.length} application{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">All caught up!</h3>
                    <p className="text-gray-400">No pending vendor applications right now.</p>
                </div>
            )}

            {/* Applications */}
            {filtered.length > 0 && (
                <div className="space-y-4">
                    {filtered.map(user => (
                        <div key={user._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <HiClock className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-xs text-amber-600 font-medium">
                                            Applied {new Date(user.createdAt).toLocaleDateString()}
                                        </span>
                                        {/* Quick preview if business name given */}
                                        {user.vendorDetails?.businessName && (
                                            <span className="text-xs text-gray-400">
                                                · {user.vendorDetails.businessName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Details button */}
                                <button
                                    onClick={() => setSelectedUser(user)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-100 text-sm font-semibold transition-colors"
                                >
                                    <HiInformationCircle className="w-4 h-4" /> Details
                                </button>
                                <button
                                    onClick={() => handleReject(user._id, user.name)}
                                    disabled={processingId === user._id}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    <HiX className="w-4 h-4" /> Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(user._id, user.name)}
                                    disabled={processingId === user._id}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    <HiCheck className="w-4 h-4" /> Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {selectedUser && (
                <VendorDetailsModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    processing={!!processingId}
                />
            )}
        </div>
    );
};

export default AdminVendorApprovals;
