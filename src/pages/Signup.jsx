import React, { useContext, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';
import toast from 'react-hot-toast';
import API_BASE from '../utils/api';

const Signup = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // OTP state
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpValue, setOtpValue] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [emailLocked, setEmailLocked] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const { createUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const validateEmail = (email) => {
        if (!email.trim()) return 'Email is required';
        if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address';
        return null;
    };

    const validate = (name, email, password) => {
        const errors = {};
        if (!name.trim()) errors.name = 'Full name is required';
        else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
        const emailErr = validateEmail(email);
        if (emailErr) errors.email = emailErr;
        if (!password) errors.password = 'Password is required';
        else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
        else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) errors.password = 'Password must contain both letters and numbers';
        return errors;
    };

    // ── Send OTP ──
    const handleSendOtp = async (email) => {
        const emailErr = validateEmail(email);
        if (emailErr) {
            setFieldErrors(prev => ({ ...prev, email: emailErr }));
            toast.error(emailErr);
            return;
        }

        setOtpLoading(true);
        setFieldErrors(prev => ({ ...prev, email: undefined }));
        try {
            const res = await fetch(`${API_BASE}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

            setOtpSent(true);
            setEmailLocked(true);
            setCooldown(60);
            toast.success('OTP sent to your email! Check your inbox 📧');
        } catch (err) {
            toast.error(err.message);
            setFieldErrors(prev => ({ ...prev, email: err.message }));
        } finally {
            setOtpLoading(false);
        }
    };

    // ── Verify OTP ──
    const handleVerifyOtp = async (email) => {
        if (!otpValue || otpValue.length !== 6) {
            toast.error('Please enter the 6-digit OTP');
            return;
        }

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
            toast.success('Email verified successfully! ✅');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setOtpLoading(false);
        }
    };

    // ── Create Account ──
    const handleSignup = async (event) => {
        event.preventDefault();
        setErrorMessage(''); setFieldErrors({});
        const form = event.target;
        const name = form.name.value, email = form.email.value, password = form.password.value;

        // Must verify email first
        if (!otpVerified) {
            toast.error('Please verify your email with OTP first');
            return;
        }

        const errors = validate(name, email, password);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            toast.error(Object.values(errors)[0]);
            return;
        }

        setLoading(true);
        try {
            await createUser(email, password, name, false);
            toast.success('Account created! Welcome to Book Vault 📚');
            navigate('/', { replace: true });
        } catch (error) {
            const msg = error.message || 'Signup failed. Please try again.';
            setErrorMessage(msg); toast.error(msg);
        } finally { setLoading(false); }
    };

    const getInputStyle = (field) => ({
        ...inp,
        ...(fieldErrors[field] ? { borderColor: '#fca5a5' } : {}),
        ...(field === 'password' ? { paddingRight: '3rem' } : {}),
        ...(field === 'email' && emailLocked ? { background: '#f1f5f9', color: '#64748b' } : {}),
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter','Segoe UI',sans-serif",
            position: 'relative', overflow: 'hidden',
            padding: '2rem 1rem',
        }}>
            <div style={{ position:'absolute', top:'-100px', right:'-100px', width:'380px', height:'380px', borderRadius:'50%', background:'rgba(34,197,94,0.08)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:'-80px', left:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'rgba(16,185,129,0.07)', pointerEvents:'none' }} />

            <div style={{
                position:'relative', zIndex:1,
                width:'92%', maxWidth:'440px',
                background:'#ffffff',
                borderRadius:'1.5rem',
                boxShadow:'0 20px 60px rgba(34,197,94,0.1), 0 4px 16px rgba(0,0,0,0.06)',
                padding:'2.5rem 2.25rem',
                border:'1px solid rgba(34,197,94,0.12)',
            }}>
                {/* Header */}
                <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
                    <div style={{
                        width:'60px', height:'60px', borderRadius:'1rem',
                        background:'linear-gradient(135deg,#22c55e,#16a34a)',
                        display:'inline-flex', alignItems:'center', justifyContent:'center',
                        fontSize:'1.8rem', marginBottom:'1rem',
                        boxShadow:'0 8px 20px rgba(34,197,94,0.3)',
                    }}>📚</div>
                    <h1 style={{ fontSize:'1.6rem', fontWeight:800, color:'#1e293b', margin:'0 0 0.3rem' }}>Create Account</h1>
                    <p style={{ color:'#64748b', fontSize:'0.88rem', margin:0 }}>Join Book Vault and start shopping</p>
                </div>

                <form id="main-signup-form" onSubmit={handleSignup} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    {/* ── Email + OTP Section ── */}
                    <div>
                        <label style={lbl}>Email Address</label>
                        <div style={{ display:'flex', gap:'0.5rem' }}>
                            <input id="signup-email" name="email" type="email" placeholder="you@example.com"
                                readOnly={emailLocked}
                                style={{ ...getInputStyle('email'), flex: 1 }}
                                onFocus={e => { if (!emailLocked) { e.target.style.borderColor='#22c55e'; e.target.style.boxShadow='0 0 0 3px rgba(34,197,94,0.1)'; }}}
                                onBlur={e => { e.target.style.borderColor=fieldErrors.email?'#fca5a5':'#e2e8f0'; e.target.style.boxShadow='none'; }} />
                            {!otpVerified && (
                                <button type="button" disabled={otpLoading || cooldown > 0}
                                    onClick={() => {
                                        const emailInput = document.getElementById('signup-email');
                                        handleSendOtp(emailInput.value);
                                    }}
                                    style={{
                                        padding: '0.72rem 1rem',
                                        background: otpLoading || cooldown > 0 ? '#d1d5db' : 'linear-gradient(135deg,#3b82f6,#2563eb)',
                                        color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                                        border: 'none', borderRadius: '0.75rem',
                                        cursor: otpLoading || cooldown > 0 ? 'not-allowed' : 'pointer',
                                        whiteSpace: 'nowrap', minWidth: '90px',
                                    }}>
                                    {otpLoading ? '⏳' : cooldown > 0 ? `${cooldown}s` : otpSent ? 'Resend' : 'Send OTP'}
                                </button>
                            )}
                            {otpVerified && (
                                <div style={{
                                    padding: '0.72rem 1rem',
                                    background: '#dcfce7', borderRadius: '0.75rem',
                                    display: 'flex', alignItems: 'center',
                                    fontSize: '0.85rem', fontWeight: 700, color: '#16a34a',
                                }}>✅</div>
                            )}
                        </div>
                        {fieldErrors.email && <p style={errStyle}>⚠ {fieldErrors.email}</p>}
                        {emailLocked && !otpVerified && (
                            <button type="button" onClick={() => { setEmailLocked(false); setOtpSent(false); setOtpValue(''); setCooldown(0); }}
                                style={{ background:'none', border:'none', color:'#3b82f6', fontSize:'0.75rem', cursor:'pointer', padding:'0.2rem 0', marginTop:'0.2rem' }}>
                                Change email
                            </button>
                        )}
                    </div>

                    {/* ── OTP Input (shows after sending OTP) ── */}
                    {otpSent && !otpVerified && (
                        <div style={{
                            background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '0.75rem',
                            padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                        }}>
                            <label style={{ ...lbl, margin: 0, color: '#1d4ed8' }}>Enter 6-digit OTP</label>
                            <p style={{ color: '#60a5fa', fontSize: '0.75rem', margin: '0 0 0.3rem' }}>
                                Check your inbox for the verification code
                            </p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    id="otp-input"
                                    type="text"
                                    maxLength={6}
                                    value={otpValue}
                                    onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                    placeholder="000000"
                                    style={{
                                        ...inp, flex: 1,
                                        textAlign: 'center', letterSpacing: '6px',
                                        fontSize: '1.2rem', fontWeight: 800,
                                        background: '#fff',
                                    }}
                                />
                                <button type="button" disabled={otpLoading || otpValue.length !== 6}
                                    onClick={() => {
                                        const emailInput = document.getElementById('signup-email');
                                        handleVerifyOtp(emailInput.value);
                                    }}
                                    style={{
                                        padding: '0.72rem 1.2rem',
                                        background: otpLoading || otpValue.length !== 6 ? '#d1d5db' : 'linear-gradient(135deg,#22c55e,#16a34a)',
                                        color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                                        border: 'none', borderRadius: '0.75rem',
                                        cursor: otpLoading || otpValue.length !== 6 ? 'not-allowed' : 'pointer',
                                    }}>
                                    {otpLoading ? '⏳' : 'Verify'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Verified Success Banner ── */}
                    {otpVerified && (
                        <div style={{
                            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem',
                            padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                        }}>
                            <span style={{ fontSize: '1.1rem' }}>✅</span>
                            <p style={{ color: '#16a34a', fontSize: '0.83rem', fontWeight: 600, margin: 0 }}>
                                Email verified successfully!
                            </p>
                        </div>
                    )}

                    {/* ── Name & Password (always visible) ── */}
                    <div>
                        <label style={lbl}>Full Name</label>
                        <input id="signup-name" name="name" type="text" placeholder="John Doe"
                            style={getInputStyle('name')}
                            onFocus={e => { e.target.style.borderColor='#22c55e'; e.target.style.boxShadow='0 0 0 3px rgba(34,197,94,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor=fieldErrors.name?'#fca5a5':'#e2e8f0'; e.target.style.boxShadow='none'; }} />
                        {fieldErrors.name && <p style={errStyle}>⚠ {fieldErrors.name}</p>}
                    </div>
                    <div>
                        <label style={lbl}>Password</label>
                        <div style={{ position:'relative' }}>
                            <input id="signup-password" name="password" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                                style={getInputStyle('password')}
                                onFocus={e => { e.target.style.borderColor='#22c55e'; e.target.style.boxShadow='0 0 0 3px rgba(34,197,94,0.1)'; }}
                                onBlur={e => { e.target.style.borderColor=fieldErrors.password?'#fca5a5':'#e2e8f0'; e.target.style.boxShadow='none'; }} />
                            <button type="button" onClick={() => setShowPass(p => !p)}
                                style={{ position:'absolute', right:'0.85rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:'1rem', padding:0 }}>
                                {showPass ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {fieldErrors.password && <p style={errStyle}>⚠ {fieldErrors.password}</p>}
                        {!fieldErrors.password && (
                            <p style={{ color:'#94a3b8', fontSize:'0.73rem', margin:'0.25rem 0 0' }}>
                                Must be 6+ characters with letters and numbers
                            </p>
                        )}
                    </div>

                    {errorMessage && (
                        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'0.75rem', padding:'0.75rem 1rem' }}>
                            <p style={{ color:'#dc2626', fontSize:'0.83rem', margin:0 }}>⚠️ {errorMessage}</p>
                        </div>
                    )}

                    <p style={{ textAlign:'center', color:'#64748b', fontSize:'0.85rem', margin:'0.1rem 0 0' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color:'#16a34a', fontWeight:600, textDecoration:'none' }}>Login here →</Link>
                    </p>

                    <button id="signup-submit-btn" type="submit" disabled={loading || !otpVerified} style={{
                        width:'100%', padding:'0.85rem',
                        background: loading || !otpVerified ? '#d1d5db' : 'linear-gradient(135deg,#22c55e,#16a34a)',
                        color:'#fff', fontWeight:700, fontSize:'0.95rem',
                        border:'none', borderRadius:'0.875rem',
                        cursor: loading || !otpVerified ? 'not-allowed' : 'pointer',
                        boxShadow: !otpVerified ? 'none' : '0 4px 14px rgba(34,197,94,0.35)',
                        transition:'all 0.2s',
                    }}>
                        {loading ? '⏳ Creating account...' : !otpVerified ? '🔒 Verify Email First' : '✨ Create Account'}
                    </button>

                    {/* Divider */}
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        <div style={{ flex:1, height:'1px', background:'#e2e8f0' }} />
                        <span style={{ color:'#94a3b8', fontSize:'0.8rem', whiteSpace:'nowrap' }}>want to sell books?</span>
                        <div style={{ flex:1, height:'1px', background:'#e2e8f0' }} />
                    </div>

                    <button id="signup-as-vendor-btn" type="button" disabled={loading}
                        onClick={() => navigate('/create-vendor')}
                        style={{
                            width:'100%', padding:'0.85rem',
                            background:'transparent',
                            border:'2px solid #f59e0b',
                            color:'#92400e', fontWeight:700, fontSize:'0.95rem',
                            borderRadius:'0.875rem', cursor:'pointer',
                            display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
                            transition:'background 0.2s',
                        }}>
                        🏪 Sign Up as Vendor
                    </button>
                </form>
            </div>
        </div>
    );
};

const lbl = { display:'block', fontSize:'0.83rem', fontWeight:600, color:'#374151', marginBottom:'0.4rem' };
const inp = {
    width:'100%', boxSizing:'border-box', padding:'0.72rem 1rem',
    border:'1.5px solid #e2e8f0', borderRadius:'0.75rem',
    fontSize:'0.93rem', color:'#1e293b', background:'#f8fafc',
    outline:'none', transition:'border-color 0.2s, box-shadow 0.2s',
};
const errStyle = { color:'#ef4444', fontSize:'0.78rem', margin:'0.25rem 0 0' };

export default Signup;