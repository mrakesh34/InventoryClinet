import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../contexts/AuthProvider";
import { CartContext } from "../contexts/CartProvider";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaShoppingBag, FaBoxOpen, FaShoppingCart,
  FaHeadset, FaWhatsapp, FaChevronRight, FaCheckCircle, FaBan,
  FaPen, FaSave, FaTimes, FaTrash, FaMapMarkerAlt, FaPhone, FaStar, FaHeart, FaRegHeart
} from "react-icons/fa";
import { MdLocalShipping } from "react-icons/md";
import toast from 'react-hot-toast';
import API_BASE from '../utils/api';

// customer support panel
const CustomerSupportPanel = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl border border-indigo-600 transition-all active:scale-95 shadow-md"
      >
        <FaHeadset className="w-4 h-4" />
        Support
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-40 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-4 py-3">
              <p className="text-white font-bold text-sm">📞 Contact Support</p>
              <p className="text-indigo-100 text-xs">We&apos;re here to help!</p>
            </div>
            <div className="p-3 space-y-1">
              <a
                href={`mailto:support@bookvault.in?subject=${encodeURIComponent('Support Request — Book Vault')}&body=${encodeURIComponent('Hi Book Vault Support Team,\n\nI need help with:\n[Please describe your issue here]\n\nThank you')}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 text-gray-700 transition-colors"
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
                href={`https://wa.me/919999999999?text=${encodeURIComponent('Hi, I need help with my Book Vault account.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 text-gray-700 transition-colors"
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

// delivery estimate helper
const getDeliveryRange = (orderDate) => {
  const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', weekday: 'short' });
  const base = new Date(orderDate);
  const min = new Date(base); min.setDate(min.getDate() + 5);
  const max = new Date(base); max.setDate(max.getDate() + 7);
  return { min: fmt(min), max: fmt(max) };
};

// status config
const STATUS = {
  Delivered:  { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: <FaCheckCircle className="w-3 h-3" /> },
  Shipped:    { color: 'bg-blue-100 text-blue-700 border-blue-200',         dot: 'bg-blue-500',    icon: <MdLocalShipping className="w-3.5 h-3.5" /> },
  Processing: { color: 'bg-amber-100 text-amber-700 border-amber-200',      dot: 'bg-amber-500',   icon: null },
  Pending:    { color: 'bg-gray-100 text-gray-600 border-gray-200',         dot: 'bg-gray-400',    icon: null },
  Cancelled:  { color: 'bg-red-100 text-red-600 border-red-200',            dot: 'bg-red-500',     icon: <FaBan className="w-3 h-3" /> },
};

// profile page
const Profile = () => {
  const { user, loading } = useContext(AuthContext);
  const location  = useLocation();
  const navigate  = useNavigate();
  // Always default to 'profile' — we switch via useEffect so refreshes start clean
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state so a browser refresh lands back on 'profile'
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const initials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const firstName = (user.name || 'there').split(' ')[0];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return { text: `Good Morning, ${firstName}! ☀️`, sub: 'Hope you have a great day ahead.' };
    if (h < 17) return { text: `Good Afternoon, ${firstName}! 👋`, sub: 'Great to see you back!' };
    return { text: `Good Evening, ${firstName}! 🌙`, sub: 'Hope you had a wonderful day.' };
  };
  const { text: greetText, sub: greetSub } = greeting();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Hero Banner ── */}
        <div className="relative rounded-3xl shadow-xl mb-6 bg-white">
          {/* Gradient section — overflow-hidden only here */}
          <div className="h-44 bg-gradient-to-r from-blue-700 via-blue-500 to-indigo-600 relative rounded-t-3xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-20 w-40 h-40 bg-indigo-400/20 rounded-full translate-y-1/2" />
            <div className="absolute top-4 left-8 w-20 h-20 bg-blue-300/20 rounded-full" />
            {/* Greeting text on banner */}
            <div className="absolute bottom-0 left-0 px-8 pb-5">
              <h1 className="text-2xl font-extrabold text-white drop-shadow-sm leading-tight">{greetText}</h1>
              <p className="text-blue-100 text-sm mt-0.5">{greetSub}</p>
            </div>
          </div>

          {/* White footer — avatar + meta + support */}
          <div className="px-6 sm:px-8 pb-5 pt-4 rounded-b-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Avatar + details */}
              <div className="flex items-center gap-4">
                <div className="relative -mt-12">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black border-4 border-white shadow-xl">
                    {initials(user.name || user.email)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full" title="Active" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-gray-900 leading-tight">{user.name || 'User'}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <FaEnvelope className="w-3 h-3 text-gray-400" /> {user.email}
                  </p>
                  <span className="inline-block mt-1.5 px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full capitalize">
                    {user.role || 'customer'}
                  </span>
                </div>
              </div>
              {/* Support button */}
              <div className="self-end sm:self-center">
                <CustomerSupportPanel />
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
          {/* Tab strip */}
          <div className="flex border-b border-gray-100 bg-gray-50/60 overflow-x-auto">
            {[
              { id: 'profile',   label: 'Profile Details', Icon: FaUser },
              { id: 'purchases', label: 'My Purchases',    Icon: FaShoppingBag },
              { id: 'wishlist',  label: 'Wishlist',        Icon: FaHeart },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-2.5 px-7 py-4 text-sm font-bold transition-all duration-200 ${
                  activeTab === id
                    ? 'text-blue-700 bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {activeTab === id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6 sm:p-8">
            {activeTab === "profile"   && <ProfileDetailsTab user={user} />}
            {activeTab === "purchases" && <MyPurchasesTab />}
            {activeTab === "wishlist"  && <WishlistTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

// profile details tab
const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

const ProfileDetailsTab = ({ user, onProfileUpdated }) => {
  // Profile edit
  const [editing, setEditing]     = useState(false);
  const [saving,  setSaving]      = useState(false);
  const [form,    setForm]        = useState({ name: user.name || '', phone: user.phone || '' });
  const [errors,  setErrors]      = useState({});

  // Address
  const [addresses,     setAddresses]     = useState([]);
  const [addrLoading,   setAddrLoading]   = useState(true);
  const [showAddrForm,  setShowAddrForm]  = useState(false);
  const [editingAddr,   setEditingAddr]   = useState(null); // address obj being edited
  const [addrSaving,    setAddrSaving]    = useState(false);
  const [addrForm,      setAddrForm]      = useState({
    name: user.name || '', street: '', city: '', state: '', zip: '', phone: user.phone || '', isDefault: false
  });

  useEffect(() => { fetchAddresses(); }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('bookstore-token');
      const res   = await fetch(`${API_BASE}/addresses`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAddresses(await res.json());
    } catch { /* silent */ }
    finally { setAddrLoading(false); }
  };

  // validate profile form
  const validate = () => {
    const e = {};
    if (!form.name.trim())                        e.name  = 'Name is required';
    else if (!/^[a-zA-Z\s'-]+$/.test(form.name)) e.name  = 'Name can only contain letters';
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('bookstore-token');
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated!');
        setEditing(false);
        if (onProfileUpdated) onProfileUpdated(data);
      } else toast.error(data.error || 'Failed to update');
    } catch { toast.error('Network error'); }
    finally { setSaving(false); }
  };

  // address form
  const openAddAddr = () => {
    setEditingAddr(null);
    setAddrForm({ name: user.name || '', street: '', city: '', state: '', zip: '', phone: user.phone || '', isDefault: addresses.length === 0 });
    setShowAddrForm(true);
  };
  const openEditAddr = (addr) => {
    setEditingAddr(addr);
    setAddrForm({ name: addr.name, street: addr.street, city: addr.city, state: addr.state, zip: addr.zip, phone: addr.phone, isDefault: addr.isDefault });
    setShowAddrForm(true);
  };

  const handleSaveAddr = async () => {
    const { name, street, city, state, zip, phone } = addrForm;
    if (!name||!street||!city||!state||!zip||!phone) { toast.error('Fill all address fields'); return; }
    if (!/^\d{6}$/.test(zip))   { toast.error('PIN code must be 6 digits'); return; }
    if (!/^\d{10}$/.test(phone)){ toast.error('Mobile must be 10 digits'); return; }
    setAddrSaving(true);
    try {
      const token = localStorage.getItem('bookstore-token');
      const url    = editingAddr ? `${API_BASE}/addresses/${editingAddr._id}` : `${API_BASE}/addresses`;
      const method = editingAddr ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...addrForm, country: 'India' }),
      });
      if (res.ok) {
        toast.success(editingAddr ? 'Address updated!' : 'Address saved!');
        setShowAddrForm(false);
        await fetchAddresses();
      } else { const d = await res.json(); toast.error(d.error || 'Failed'); }
    } catch { toast.error('Network error'); }
    finally { setAddrSaving(false); }
  };

  const handleDeleteAddr = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const token = localStorage.getItem('bookstore-token');
      const res = await fetch(`${API_BASE}/addresses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { toast.success('Address removed'); await fetchAddresses(); }
    } catch { toast.error('Network error'); }
  };

  const handleSetDefault = async (id) => {
    try {
      const token = localStorage.getItem('bookstore-token');
      const res = await fetch(`${API_BASE}/addresses/${id}/set-default`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { toast.success('Default address updated'); await fetchAddresses(); }
    } catch { toast.error('Network error'); }
  };

  const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];

  return (
    <div className="space-y-8">

      {/* ── Personal Info ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Personal Information</h2>
            <p className="text-xs text-gray-400 mt-0.5">Your basic account details</p>
          </div>
          {!editing ? (
            <button onClick={() => { setForm({ name: user.name||'', phone: user.phone||'' }); setEditing(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
              <FaPen className="w-3.5 h-3.5" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                <FaTimes className="w-3 h-3" /> Cancel
              </button>
              <button onClick={handleSaveProfile} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all disabled:opacity-50">
                <FaSave className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Full Name</label>
            {editing ? (
              <>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-blue-200 focus:border-blue-500 rounded-xl text-sm font-semibold text-gray-900 outline-none transition-colors" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </>
            ) : (
              <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-blue-500 w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-gray-900 text-sm">{user.name || 'Not set'}</span>
              </div>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Email Address</label>
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaEnvelope className="text-indigo-500 w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-gray-900 text-sm truncate">{user.email}</span>
              <span className="ml-auto text-xs text-gray-400 font-semibold flex-shrink-0">Cannot change</span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Mobile Number</label>
            {editing ? (
              <>
                <div className="flex">
                  <span className="px-3 py-2.5 bg-gray-100 border-2 border-r-0 border-blue-200 rounded-l-xl text-sm font-bold text-gray-500">+91</span>
                  <input type="tel" maxLength={10} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g,'') }))}
                    className="flex-1 px-4 py-2.5 border-2 border-blue-200 focus:border-blue-500 rounded-r-xl text-sm font-semibold text-gray-900 outline-none" placeholder="10-digit number" />
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </>
            ) : (
              <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaPhone className="text-emerald-500 w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-gray-900 text-sm">{user.phone ? `+91 ${user.phone}` : 'Not set'}</span>
              </div>
            )}
          </div>

          {/* Role (read-only) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Account Type</label>
            <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-base">🛡️</span>
              </div>
              <span className="font-bold text-gray-900 text-sm capitalize">{user.role || 'user'}</span>
              <span className="ml-auto text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Default Address ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Default Delivery Address</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {addresses.length === 0 ? 'No address saved yet' : `${addresses.length} address${addresses.length > 1 ? 'es' : ''} saved`}
            </p>
          </div>
          <button onClick={openAddAddr}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors">
            + Add Address
          </button>
        </div>

        {addrLoading ? (
          <div className="text-center py-6 text-gray-400 text-sm">Loading addresses…</div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FaMapMarkerAlt className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No address saved. Add one for faster checkout!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show default first then others */}
            {[...addresses].sort((a,b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)).map(addr => (
              <div key={addr._id} className={`relative rounded-2xl border-2 p-4 transition-all ${
                addr.isDefault ? 'border-blue-400 bg-blue-50/50' : 'border-gray-100 hover:border-gray-300'
              }`}>
                {addr.isDefault && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    <FaStar className="w-2.5 h-2.5" /> Default
                  </span>
                )}
                <p className="font-extrabold text-gray-900 text-sm mb-1">{addr.name}</p>
                <p className="text-xs text-gray-600">{addr.street}</p>
                <p className="text-xs text-gray-600">{addr.city}, {addr.state} – {addr.zip}</p>
                <p className="text-xs text-gray-600">{addr.country}</p>
                <p className="text-xs text-gray-500 mt-1">📱 +91 {addr.phone}</p>
                <div className="flex gap-2 mt-3">
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr._id)}
                      className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                      Set as Default
                    </button>
                  )}
                  <button onClick={() => openEditAddr(addr)}
                    className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <FaPen className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDeleteAddr(addr._id)}
                    className="text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <FaTrash className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Address Form Modal ── */}
      {showAddrForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-extrabold text-gray-900">{editingAddr ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={() => setShowAddrForm(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Full Name *</label>
                <input type="text" value={addrForm.name} onChange={e => setAddrForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-blue-400 rounded-xl text-sm outline-none" placeholder="Recipient name" />
              </div>
              {/* Street */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Flat / House No, Street, Locality *</label>
                <textarea value={addrForm.street} onChange={e => setAddrForm(p => ({ ...p, street: e.target.value }))}
                  rows={2} className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-blue-400 rounded-xl text-sm outline-none resize-none" placeholder="e.g. 42B, MG Road, Civil Lines" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* City */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">City *</label>
                  <input type="text" value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-blue-400 rounded-xl text-sm outline-none" placeholder="City" />
                </div>
                {/* PIN */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">PIN Code *</label>
                  <input type="text" maxLength={6} value={addrForm.zip} onChange={e => setAddrForm(p => ({ ...p, zip: e.target.value.replace(/\D/,'') }))}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-blue-400 rounded-xl text-sm outline-none" placeholder="6 digits" />
                </div>
              </div>
              {/* State */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">State *</label>
                <select value={addrForm.state} onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 focus:border-blue-400 rounded-xl text-sm outline-none bg-white">
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Mobile Number *</label>
                <div className="flex">
                  <span className="px-3 py-2.5 bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-xl text-sm font-bold text-gray-500">+91</span>
                  <input type="tel" maxLength={10} value={addrForm.phone} onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value.replace(/\D/,'') }))}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 focus:border-blue-400 rounded-r-xl text-sm outline-none" placeholder="10-digit number" />
                </div>
              </div>
              {/* Default toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-blue-50 rounded-xl border border-blue-100">
                <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(p => ({ ...p, isDefault: e.target.checked }))}
                  className="w-4 h-4 accent-blue-600" />
                <span className="text-sm font-semibold text-blue-800">⭐ Set as default delivery address</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddrForm(false)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSaveAddr} disabled={addrSaving} className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50">
                {addrSaving ? 'Saving…' : editingAddr ? 'Save Changes' : 'Add Address'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const accentMap = {
  blue:   { bg: 'bg-blue-100',   text: 'text-blue-600',   ring: 'ring-blue-200' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', ring: 'ring-indigo-200' },
};

const InfoCard = ({ Icon, label, value, accent = 'blue' }) => {
  const a = accentMap[accent];
  return (
    <div className={`flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow ring-1 ring-transparent hover:${a.ring}`}>
      <div className={`w-11 h-11 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`${a.text} w-5 h-5`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">{label}</p>
        <p className="text-gray-900 font-bold text-sm truncate">{value}</p>
      </div>
    </div>
  );
};

// my purchases tab
const MyPurchasesTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("bookstore-token");
        if (!token) { setLoading(false); return; }
        const res = await fetch(`${API_BASE}/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setOrders(await res.json());
        else setError("Failed to fetch orders.");
      } catch { setError("Network error fetching orders."); }
      finally   { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      <p className="text-gray-400 text-sm">Loading your purchases…</p>
    </div>
  );
  if (error) return <div className="text-center py-12 text-red-500 text-sm">{error}</div>;

  if (orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-5">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-inner">
        <FaBoxOpen className="w-12 h-12 text-blue-400" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-extrabold text-gray-800 mb-1">No Purchases Yet</h3>
        <p className="text-gray-500 text-sm max-w-xs">Explore our collection and find your next favourite read.</p>
      </div>
      <button
        onClick={() => (window.location.href = "/shop")}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-7 py-3 rounded-xl transition-all shadow-lg shadow-blue-200"
      >
        <FaShoppingCart className="w-4 h-4" /> Browse Books
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-extrabold text-gray-900">My Purchases</h2>
        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      {orders.map((order) => {
        const s = STATUS[order.orderStatus] || STATUS.Pending;
        const { min: dMin, max: dMax } = getDeliveryRange(order.createdAt);
        return (
          <div
            key={order._id}
            onClick={() => (window.location.href = `/purchase/${order._id}`)}
            className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-200 cursor-pointer transition-all duration-200 overflow-hidden"
          >
            {/* Top stripe — status colour */}
            <div className={`h-1 w-full ${s.dot}`} />

            {/* Header row */}
            <div className="px-5 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-gray-50">
              <div className="flex items-center gap-6 flex-wrap">
                {/* Date */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Placed on</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {/* Order ID */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Order ID</p>
                  <p className="text-sm font-mono font-semibold text-gray-600">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
                {/* Total */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Total</p>
                  <p className="text-sm font-extrabold text-blue-700">₹{order.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Status pill */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${s.color}`}>
                  {s.icon} {order.orderStatus}
                </span>
                <FaChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>

            {/* Delivery estimate */}
            {order.orderStatus !== 'Cancelled' && (
              <div className="px-5 py-2.5 border-b border-gray-50 bg-gradient-to-r from-gray-50/80 to-white">
                {order.orderStatus === 'Delivered' ? (
                  <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                    <FaCheckCircle className="w-3.5 h-3.5" /> Order delivered successfully
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-blue-600 text-xs">
                    <MdLocalShipping className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">Est. delivery: <strong>{dMin}</strong> – <strong>{dMax}</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-3 flex-wrap">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 flex-shrink-0 max-w-xs">
                    {item.book?.imageURL ? (
                      <img src={item.book.imageURL} alt={item.title} className="w-8 h-11 object-cover rounded-lg shadow-sm" />
                    ) : (
                      <div className="w-8 h-11 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">📚</div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 line-clamp-1">{item.title}</p>
                      <p className="text-[11px] text-gray-400">Qty: {item.quantity} · <span className="text-gray-600 font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span></p>
                    </div>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <div className="text-xs text-gray-400 font-semibold">+{order.items.length - 2} more</div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-2 bg-gray-50/60 border-t border-gray-100 text-xs text-blue-500 font-semibold group-hover:text-blue-700 flex items-center gap-1 transition-colors">
              View full order details <FaChevronRight className="w-3 h-3" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// wishlist tab
const WishlistTab = () => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [books,   setBooks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('bookstore-token');
        const res = await fetch(`${API_BASE}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setBooks(await res.json());
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleRemove = async (bookId) => {
    try {
      const token = localStorage.getItem('bookstore-token');
      await fetch(`${API_BASE}/wishlist/toggle/${bookId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks(prev => prev.filter(b => b._id !== bookId));
      toast('💔 Removed from wishlist');
    } catch { toast.error('Network error'); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-400" />
      <p className="text-gray-400 text-sm">Loading your wishlist…</p>
    </div>
  );

  if (books.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 gap-5">
      <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-3xl flex items-center justify-center shadow-inner">
        <FaRegHeart className="w-12 h-12 text-red-300" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-extrabold text-gray-800 mb-1">Your Wishlist is Empty</h3>
        <p className="text-gray-500 text-sm max-w-xs">Browse books and tap the ❤️ heart to save them here.</p>
      </div>
      <button
        onClick={() => navigate('/shop')}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-7 py-3 rounded-xl transition-all shadow-lg shadow-red-100 active:scale-95"
      >
        <FaShoppingCart className="w-4 h-4" /> Explore Books
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-extrabold text-gray-900">My Wishlist</h2>
        <span className="text-xs font-semibold bg-red-100 text-red-600 px-3 py-1 rounded-full flex items-center gap-1">
          <FaHeart className="w-3 h-3" /> {books.length} book{books.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {books.map(book => (
          <div key={book._id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-200 transition-all duration-200 overflow-hidden flex flex-col">
            {/* Cover */}
            <div
              className="relative h-44 bg-gray-50 overflow-hidden cursor-pointer"
              onClick={() => navigate(`/book/${book._id}`)}
            >
              {book.imageURL ? (
                <img src={book.imageURL} alt={book.bookTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
              )}
              {/* Remove heart overlay */}
              <button
                onClick={e => { e.stopPropagation(); handleRemove(book._id); }}
                className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-red-50 rounded-full flex items-center justify-center shadow-md transition-colors"
                title="Remove from wishlist"
              >
                <FaHeart className="w-4 h-4 text-red-400" />
              </button>
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col gap-2">
              <h4
                className="font-extrabold text-gray-900 text-sm leading-snug line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => navigate(`/book/${book._id}`)}
              >
                {book.bookTitle}
              </h4>
              <p className="text-xs text-gray-500">by {book.authorName || 'Unknown'}</p>
              <p className="text-xs text-gray-400 capitalize">{book.category}</p>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <span className="text-lg font-extrabold text-blue-700">₹{book.price?.toFixed(2)}</span>
                <button
                  onClick={() => { addToCart(book); toast.success('Added to cart!'); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all active:scale-95"
                >
                  <FaShoppingCart className="w-3 h-3" /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
