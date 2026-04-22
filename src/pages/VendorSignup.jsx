import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';
import toast from 'react-hot-toast';
import API_BASE from '../utils/api';

const BOOK_CATEGORIES = [
    'Art and design', 'Autobiography', 'Biography', "Children's books", 'Business',
    'Fantasy', 'Fiction', 'History', 'Horror', 'Memoir', 'Mystery',
    'Non-fiction', 'Poetry', 'Programming', 'Religion and spirituality',
    'Science', 'Science fiction', 'Self-help', 'Travel', 'Other',
];

const STEP_TITLES = [
    'Account Details',
    'Store Name',
    'Contact Info',
    'Inventory & Categories',
];

export default function VendorSignup() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1 — personal
    const [name, setName]         = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    // Step 2 — store
    const [businessName, setBusinessName] = useState('');

    // Step 3 — contact
    const [phone, setPhone]             = useState('');
    const [description, setDescription] = useState('');

    // Step 4 — inventory
    const [categories, setCategories]       = useState([]);
    const [estimatedStock, setEstimatedStock] = useState('');

    // Errors
    const [errors, setErrors] = useState({});

    // OTP state
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const { createUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    // ── OTP Handlers ─────────────────────────────────────────────────────────────
    const handleSendOtp = async () => {
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setErrors(prev => ({ ...prev, email: 'Enter a valid email first' }));
            return;
        }
        setOtpLoading(true);
        setErrors(prev => ({ ...prev, email: undefined }));
        try {
            const res = await fetch(`${API_BASE}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
            setOtpSent(true);
            setCooldown(60);
            toast.success('OTP sent! Check your email 📧');
        } catch (err) {
            toast.error(err.message);
            setErrors(prev => ({ ...prev, email: err.message }));
        } finally { setOtpLoading(false); }
    };

    const handleVerifyOtp = async () => {
        if (!otpValue || otpValue.length !== 6) { toast.error('Enter the 6-digit OTP'); return; }
        setOtpLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpValue }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'OTP verification failed');
            setOtpVerified(true);
            toast.success('Email verified! ✅');
        } catch (err) { toast.error(err.message); }
        finally { setOtpLoading(false); }
    };

    // ── Validation ──────────────────────────────────────────────────────────────
    const validateStep1 = () => {
        const e = {};
        if (!name.trim()) e.name = 'Full name is required';
        if (!email.trim()) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
        if (!otpVerified) e.email = 'Please verify your email with OTP';
        if (!password) e.password = 'Password is required';
        else if (password.length < 6) e.password = 'Password must be at least 6 characters';
        setErrors(e); return Object.keys(e).length === 0;
    };
    const validateStep2 = () => {
        const e = {};
        if (!businessName.trim()) e.businessName = 'Store / business name is required';
        setErrors(e); return Object.keys(e).length === 0;
    };
    const validateStep3 = () => {
        const e = {};
        if (!phone.trim()) e.phone = 'Phone number is required';
        else if (!/^\+?[\d\s\-()]{7,}$/.test(phone)) e.phone = 'Enter a valid phone number';
        setErrors(e); return Object.keys(e).length === 0;
    };
    const validateStep4 = () => {
        const e = {};
        if (categories.length === 0) e.categories = 'Select at least one category';
        if (!estimatedStock || isNaN(estimatedStock) || Number(estimatedStock) < 0)
            e.estimatedStock = 'Enter a valid stock count';
        setErrors(e); return Object.keys(e).length === 0;
    };

    const toggleCategory = (cat) =>
        setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

    const handleNext = () => {
        setErrors({});
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
        else if (step === 3 && validateStep3()) setStep(4);
    };
    const handleBack = () => { setErrors({}); setStep(s => s - 1); };

    const handleSubmit = async () => {
        if (!validateStep4()) return;
        setLoading(true);
        try {
            await createUser(email, password, name, true, {
                businessName, phone, description, categories,
                estimatedStock: Number(estimatedStock),
            });
            toast.success("Vendor application submitted! We'll notify you once approved.", { duration: 6000 });
            navigate('/', { replace: true });
        } catch (error) {
            toast.error(error.message || 'Signup failed. Please try again.');
        } finally { setLoading(false); }
    };

    // ── Progress indicator ──────────────────────────────────────────────────────
    const Progress = () => (
        <div style={{ marginBottom:'2rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:'0.75rem' }}>
                {[1,2,3,4].map(s => (
                    <React.Fragment key={s}>
                        <div style={{
                            width:'36px', height:'36px', borderRadius:'50%', flexShrink:0,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontWeight:700, fontSize:'0.85rem',
                            background: s < step ? '#f59e0b' : s === step ? '#1e3a8a' : '#e2e8f0',
                            color: s <= step ? '#fff' : '#94a3b8',
                            boxShadow: s === step ? '0 0 0 4px rgba(30,58,138,0.15)' : 'none',
                            transition:'all 0.3s',
                        }}>
                            {s < step ? '✓' : s}
                        </div>
                        {s < 4 && (
                            <div style={{ flex:1, height:'3px', maxWidth:'60px', transition:'background 0.3s',
                                background: s < step ? '#f59e0b' : '#e2e8f0' }} />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <p style={{ textAlign:'center', color:'#64748b', fontSize:'0.82rem', margin:0 }}>
                Step {step} of 4 — <strong style={{ color:'#1e293b' }}>{STEP_TITLES[step-1]}</strong>
            </p>
        </div>
    );

    return (
        <div style={{
            minHeight:'100vh',
            background:'linear-gradient(135deg,#fefce8 0%,#fef9c3 50%,#fefce8 100%)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:"'Inter','Segoe UI',sans-serif",
            padding:'2rem 1rem', position:'relative', overflow:'hidden',
        }}>
            {/* Decorative circles */}
            <div style={{ position:'absolute',top:'-100px',right:'-100px',width:'360px',height:'360px',borderRadius:'50%',background:'rgba(245,158,11,0.08)',pointerEvents:'none' }} />
            <div style={{ position:'absolute',bottom:'-80px',left:'-80px',width:'300px',height:'300px',borderRadius:'50%',background:'rgba(234,88,12,0.06)',pointerEvents:'none' }} />

            {/* Card */}
            <div style={{
                position:'relative', zIndex:1,
                width:'92%', maxWidth:'500px',
                background:'#ffffff',
                borderRadius:'1.5rem',
                boxShadow:'0 20px 60px rgba(245,158,11,0.12), 0 4px 16px rgba(0,0,0,0.06)',
                padding:'2.5rem 2.25rem',
                border:'1px solid rgba(245,158,11,0.15)',
            }}>
                {/* Header */}
                <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
                    <div style={{
                        width:'60px', height:'60px', borderRadius:'1rem',
                        background:'linear-gradient(135deg,#f59e0b,#ea580c)',
                        display:'inline-flex', alignItems:'center', justifyContent:'center',
                        fontSize:'1.8rem', marginBottom:'0.75rem',
                        boxShadow:'0 8px 20px rgba(245,158,11,0.35)',
                    }}>🏪</div>
                    <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'#1e293b', margin:'0 0 0.3rem' }}>Vendor Sign Up</h1>
                    <p style={{ color:'#64748b', fontSize:'0.85rem', margin:0 }}>List your books and manage inventory on Book Vault</p>
                </div>

                <Progress />

                {/* ── Step 1: Account Details ── */}
                {step === 1 && (
                    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                        <div>
                            <label style={lbl}>Full Name *</label>
                            <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="John Doe"
                                style={{ ...inp, ...(errors.name ? errBorder : {}) }}
                                onFocus={e=>{ e.target.style.borderColor='#f59e0b'; e.target.style.boxShadow='0 0 0 3px rgba(245,158,11,0.1)'; }}
                                onBlur={e=>{ e.target.style.borderColor=errors.name?'#f87171':'#e2e8f0'; e.target.style.boxShadow='none'; }} />
                            {errors.name && <p style={err}>{errors.name}</p>}
                        </div>
                        <div>
                            <label style={lbl}>Email Address *</label>
                            <div style={{ display:'flex', gap:'0.5rem' }}>
                                <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (otpSent) { setOtpSent(false); setOtpVerified(false); setOtpValue(''); } }}
                                    placeholder="you@example.com" readOnly={otpVerified}
                                    style={{ ...inp, flex:1, ...(errors.email ? errBorder : {}), ...(otpVerified ? { background:'#f1f5f9', color:'#64748b' } : {}) }}
                                    onFocus={e => { if (!otpVerified) { e.target.style.borderColor='#f59e0b'; e.target.style.boxShadow='0 0 0 3px rgba(245,158,11,0.1)'; } }}
                                    onBlur={e => { e.target.style.borderColor=errors.email?'#f87171':'#e2e8f0'; e.target.style.boxShadow='none'; }} />
                                {!otpVerified && (
                                    <button type="button" disabled={otpLoading || cooldown > 0}
                                        onClick={handleSendOtp}
                                        style={{
                                            padding:'0.72rem 1rem',
                                            background: otpLoading || cooldown > 0 ? '#d1d5db' : 'linear-gradient(135deg,#3b82f6,#2563eb)',
                                            color:'#fff', fontWeight:700, fontSize:'0.8rem',
                                            border:'none', borderRadius:'0.75rem',
                                            cursor: otpLoading || cooldown > 0 ? 'not-allowed' : 'pointer',
                                            whiteSpace:'nowrap', minWidth:'90px',
                                        }}>
                                        {otpLoading ? '⏳' : cooldown > 0 ? `${cooldown}s` : otpSent ? 'Resend' : 'Send OTP'}
                                    </button>
                                )}
                                {otpVerified && (
                                    <div style={{ padding:'0.72rem 1rem', background:'#dcfce7', borderRadius:'0.75rem', display:'flex', alignItems:'center', fontSize:'0.85rem', fontWeight:700, color:'#16a34a' }}>✅</div>
                                )}
                            </div>
                            {errors.email && <p style={err}>{errors.email}</p>}
                        </div>

                        {/* OTP Input */}
                        {otpSent && !otpVerified && (
                            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:'0.75rem', padding:'1rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                                <label style={{ ...lbl, margin:0, color:'#1d4ed8' }}>Enter 6-digit OTP</label>
                                <p style={{ color:'#60a5fa', fontSize:'0.75rem', margin:'0 0 0.3rem' }}>Check your inbox for the verification code</p>
                                <div style={{ display:'flex', gap:'0.5rem' }}>
                                    <input type="text" maxLength={6} value={otpValue}
                                        onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                        placeholder="000000"
                                        style={{ ...inp, flex:1, textAlign:'center', letterSpacing:'6px', fontSize:'1.2rem', fontWeight:800, background:'#fff' }} />
                                    <button type="button" disabled={otpLoading || otpValue.length !== 6}
                                        onClick={handleVerifyOtp}
                                        style={{
                                            padding:'0.72rem 1.2rem',
                                            background: otpLoading || otpValue.length !== 6 ? '#d1d5db' : 'linear-gradient(135deg,#22c55e,#16a34a)',
                                            color:'#fff', fontWeight:700, fontSize:'0.85rem',
                                            border:'none', borderRadius:'0.75rem',
                                            cursor: otpLoading || otpValue.length !== 6 ? 'not-allowed' : 'pointer',
                                        }}>
                                        {otpLoading ? '⏳' : 'Verify'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {otpVerified && (
                            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'0.75rem', padding:'0.6rem 1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                                <span>✅</span>
                                <p style={{ color:'#16a34a', fontSize:'0.8rem', fontWeight:600, margin:0 }}>Email verified successfully!</p>
                            </div>
                        )}

                        <div>
                            <label style={lbl}>Password *</label>
                            <div style={{ position:'relative' }}>
                                <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 6 characters"
                                    style={{ ...inp, paddingRight:'3rem', ...(errors.password ? errBorder : {}) }}
                                    onFocus={e=>{ e.target.style.borderColor='#f59e0b'; e.target.style.boxShadow='0 0 0 3px rgba(245,158,11,0.1)'; }}
                                    onBlur={e=>{ e.target.style.borderColor=errors.password?'#f87171':'#e2e8f0'; e.target.style.boxShadow='none'; }} />
                                <button type="button" onClick={()=>setShowPass(p=>!p)}
                                    style={{ position:'absolute',right:'0.85rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#94a3b8',fontSize:'1rem',padding:0 }}>
                                    {showPass ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {errors.password && <p style={err}>{errors.password}</p>}
                        </div>
                        <p style={{ textAlign:'center', color:'#64748b', fontSize:'0.84rem', margin:'0.25rem 0 0' }}>
                            Want a regular account?{' '}
                            <Link to="/create-user" style={{ color:'#f59e0b', fontWeight:600, textDecoration:'none' }}>Sign up here →</Link>
                        </p>
                        <button onClick={handleNext} style={btnPrimary}>Continue →</button>
                    </div>
                )}

                {/* ── Step 2: Store Name ── */}
                {step === 2 && (
                    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                        <p style={{ color:'#64748b', fontSize:'0.85rem', margin:0 }}>What's the name of your bookstore or business?</p>
                        <div>
                            <label style={lbl}>🏢 Store / Business Name *</label>
                            <input type="text" id="vendor-business-name" value={businessName} onChange={e=>setBusinessName(e.target.value)}
                                placeholder="e.g. Rakesh's Book Hub"
                                style={{ ...inp, ...(errors.businessName ? errBorder : {}) }}
                                onFocus={e=>{ e.target.style.borderColor='#f59e0b'; e.target.style.boxShadow='0 0 0 3px rgba(245,158,11,0.1)'; }}
                                onBlur={e=>{ e.target.style.borderColor=errors.businessName?'#f87171':'#e2e8f0'; e.target.style.boxShadow='none'; }} />
                            {errors.businessName && <p style={err}>{errors.businessName}</p>}
                        </div>
                        <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.25rem' }}>
                            <button onClick={handleBack} style={btnSecondary}>← Back</button>
                            <button onClick={handleNext} style={{ ...btnPrimary, flex:1 }}>Continue →</button>
                        </div>
                    </div>
                )}

                {/* ── Step 3: Contact Info ── */}
                {step === 3 && (
                    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                        <p style={{ color:'#64748b', fontSize:'0.85rem', margin:0 }}>How can we reach you?</p>
                        <div>
                            <label style={lbl}>📞 Contact Phone Number *</label>
                            <input type="tel" id="vendor-phone" value={phone} onChange={e=>setPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                style={{ ...inp, ...(errors.phone ? errBorder : {}) }}
                                onFocus={e=>{ e.target.style.borderColor='#f59e0b'; e.target.style.boxShadow='0 0 0 3px rgba(245,158,11,0.1)'; }}
                                onBlur={e=>{ e.target.style.borderColor=errors.phone?'#f87171':'#e2e8f0'; e.target.style.boxShadow='none'; }} />
                            {errors.phone && <p style={err}>{errors.phone}</p>}
                        </div>
                        <div>
                            <label style={lbl}>📝 About Your Business <span style={{ color:'#94a3b8', fontWeight:400 }}>(optional)</span></label>
                            <textarea value={description} onChange={e=>setDescription(e.target.value)}
                                placeholder="Tell us about your bookstore..." rows={3}
                                style={{ ...inp, resize:'vertical', fontFamily:'inherit', lineHeight:1.6 }}
                                onFocus={e=>{ e.target.style.borderColor='#f59e0b'; e.target.style.boxShadow='0 0 0 3px rgba(245,158,11,0.1)'; }}
                                onBlur={e=>{ e.target.style.borderColor='#e2e8f0'; e.target.style.boxShadow='none'; }} />
                        </div>
                        <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.25rem' }}>
                            <button onClick={handleBack} style={btnSecondary}>← Back</button>
                            <button onClick={handleNext} style={{ ...btnPrimary, flex:1 }}>Continue →</button>
                        </div>
                    </div>
                )}

                {/* ── Step 4: Inventory & Categories ── */}
                {step === 4 && (
                    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                        <p style={{ color:'#64748b', fontSize:'0.85rem', margin:0 }}>Almost done! Tell us what you'll sell.</p>
                        <div>
                            <label style={lbl}>📚 Book Categories You'll Sell *</label>
                            {errors.categories && <p style={err}>{errors.categories}</p>}
                            <div style={{
                                display:'flex', flexWrap:'wrap', gap:'0.4rem',
                                maxHeight:'160px', overflowY:'auto',
                                padding:'0.6rem', borderRadius:'0.75rem',
                                background:'#f8fafc', border:'1.5px solid #e2e8f0',
                            }}>
                                {BOOK_CATEGORIES.map(cat => (
                                    <button key={cat} type="button" onClick={()=>toggleCategory(cat)}
                                        style={{
                                            border: categories.includes(cat) ? '1.5px solid #f59e0b' : '1.5px solid #e2e8f0',
                                            background: categories.includes(cat) ? '#fef3c7' : '#fff',
                                            color: categories.includes(cat) ? '#92400e' : '#64748b',
                                            borderRadius:'999px', padding:'0.28rem 0.7rem',
                                            fontSize:'0.76rem', fontWeight: categories.includes(cat) ? 700 : 400,
                                            cursor:'pointer', transition:'all 0.18s', whiteSpace:'nowrap',
                                        }}>
                                        {categories.includes(cat) ? '✓ ' : ''}{cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={lbl}>📦 Estimated Initial Stock *</label>
                            <input id="vendor-stock" type="number" min="0" value={estimatedStock} onChange={e=>setEstimatedStock(e.target.value)}
                                placeholder="e.g. 150 books"
                                style={{ ...inp, ...(errors.estimatedStock ? errBorder : {}) }}
                                onFocus={e=>{ e.target.style.borderColor='#f59e0b'; e.target.style.boxShadow='0 0 0 3px rgba(245,158,11,0.1)'; }}
                                onBlur={e=>{ e.target.style.borderColor=errors.estimatedStock?'#f87171':'#e2e8f0'; e.target.style.boxShadow='none'; }} />
                            {errors.estimatedStock && <p style={err}>{errors.estimatedStock}</p>}
                        </div>
                        {/* Review notice */}
                        <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'0.75rem', padding:'0.75rem 1rem', display:'flex', gap:'0.6rem', alignItems:'flex-start' }}>
                            <span style={{ flexShrink:0 }}>⏳</span>
                            <p style={{ color:'#92400e', fontSize:'0.8rem', margin:0, lineHeight:1.5 }}>
                                Your application will be reviewed by an admin before you get full Vendor Dashboard access.
                            </p>
                        </div>
                        <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.25rem' }}>
                            <button onClick={handleBack} disabled={loading} style={btnSecondary}>← Back</button>
                            <button id="vendor-submit-btn" onClick={handleSubmit} disabled={loading}
                                style={{ ...btnPrimary, flex:1, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                                {loading
                                    ? <span style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem' }}>
                                        <span style={{ width:'14px',height:'14px',border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block' }} />
                                        Submitting...
                                      </span>
                                    : '🏪 Submit Application'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

const lbl = { display:'block', fontSize:'0.83rem', fontWeight:600, color:'#374151', marginBottom:'0.4rem' };
const inp = {
    width:'100%', boxSizing:'border-box', padding:'0.72rem 1rem',
    border:'1.5px solid #e2e8f0', borderRadius:'0.75rem',
    fontSize:'0.93rem', color:'#1e293b', background:'#f8fafc',
    outline:'none', transition:'border-color 0.2s, box-shadow 0.2s',
};
const errBorder = { borderColor:'#fca5a5' };
const err = { color:'#ef4444', fontSize:'0.78rem', margin:'0.2rem 0 0' };
const btnPrimary = {
    padding:'0.85rem 1.5rem',
    background:'linear-gradient(135deg,#f59e0b,#ea580c)',
    color:'#fff', fontWeight:700, fontSize:'0.95rem',
    border:'none', borderRadius:'0.875rem', cursor:'pointer',
    boxShadow:'0 4px 14px rgba(245,158,11,0.35)', transition:'all 0.2s',
    display:'flex', alignItems:'center', justifyContent:'center',
};
const btnSecondary = {
    padding:'0.85rem 1.25rem',
    background:'transparent', border:'1.5px solid #e2e8f0',
    color:'#64748b', fontWeight:600, fontSize:'0.9rem',
    borderRadius:'0.875rem', cursor:'pointer', transition:'all 0.2s',
    flexShrink:0,
};
