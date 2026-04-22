import React, { useContext, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';
import toast from 'react-hot-toast';

export default function Login() {
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    const { login } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || '/';

    const validate = (email, password) => {
        const errors = {};
        if (!email.trim()) errors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Please enter a valid email address';
        if (!password) errors.password = 'Password is required';
        else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
        return errors;
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        setErrorMessage(''); setFieldErrors({});
        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;

        const errors = validate(email, password);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            const firstError = Object.values(errors)[0];
            toast.error(firstError);
            return;
        }

        setLoading(true);
        try {
            const data = await login(email, password);
            toast.success('Login successful!');
            if (data.user.role === 'admin') navigate('/admin/dashboard', { replace: true });
            else if (data.user.role === 'vendor') navigate('/vendor/dashboard', { replace: true });
            else navigate(from, { replace: true });
        } catch (error) {
            const msg = error.message || 'Login failed. Please try again.';
            setErrorMessage(msg); toast.error(msg);
        } finally { setLoading(false); }
    };

    const getInputStyle = (field) => ({
        ...inp,
        ...(fieldErrors[field] ? { borderColor: '#fca5a5' } : {}),
        ...(field === 'password' ? { paddingRight: '3rem' } : {}),
    });

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter','Segoe UI',sans-serif",
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Subtle decorative circles */}
            <div style={{ position:'absolute', top:'-120px', right:'-120px', width:'400px', height:'400px', borderRadius:'50%', background:'rgba(59,130,246,0.08)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:'-100px', left:'-100px', width:'350px', height:'350px', borderRadius:'50%', background:'rgba(99,102,241,0.07)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', top:'30%', left:'-60px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(59,130,246,0.05)', pointerEvents:'none' }} />

            {/* Login card */}
            <div style={{
                position: 'relative', zIndex: 1,
                width: '92%', maxWidth: '440px',
                background: '#ffffff',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 60px rgba(59,130,246,0.12), 0 4px 16px rgba(0,0,0,0.06)',
                padding: '2.5rem 2.25rem',
                border: '1px solid rgba(59,130,246,0.1)',
            }}>
                {/* Header */}
                <div style={{ textAlign:'center', marginBottom:'2rem' }}>
                    <div style={{
                        width:'60px', height:'60px', borderRadius:'1rem',
                        background:'linear-gradient(135deg,#3b82f6,#6366f1)',
                        display:'inline-flex', alignItems:'center', justifyContent:'center',
                        fontSize:'1.8rem', marginBottom:'1rem',
                        boxShadow:'0 8px 20px rgba(59,130,246,0.3)',
                    }}>📚</div>
                    <h1 style={{ fontSize:'1.6rem', fontWeight:800, color:'#1e293b', margin:'0 0 0.3rem' }}>Welcome back</h1>
                    <p style={{ color:'#64748b', fontSize:'0.88rem', margin:0 }}>Sign in to your Book Vault account</p>
                </div>

                <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
                    <div>
                        <label style={lbl}>Email Address</label>
                        <input id="email" name="email" type="email" placeholder="you@example.com"
                            style={getInputStyle('email')}
                            onFocus={e=>{ e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'; }}
                            onBlur={e=>{ e.target.style.borderColor=fieldErrors.email?'#fca5a5':'#e2e8f0'; e.target.style.boxShadow='none'; }} />
                        {fieldErrors.email && <p style={errStyle}>⚠ {fieldErrors.email}</p>}
                    </div>

                    <div>
                        <label style={lbl}>Password</label>
                        <div style={{ position:'relative' }}>
                            <input id="password" name="password" type={showPass?'text':'password'} placeholder="••••••••"
                                style={getInputStyle('password')}
                                onFocus={e=>{ e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 3px rgba(59,130,246,0.1)'; }}
                                onBlur={e=>{ e.target.style.borderColor=fieldErrors.password?'#fca5a5':'#e2e8f0'; e.target.style.boxShadow='none'; }} />
                            <button type="button" onClick={()=>setShowPass(p=>!p)}
                                style={{ position:'absolute', right:'0.85rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94a3b8', fontSize:'1rem', padding:0 }}>
                                {showPass ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {fieldErrors.password && <p style={errStyle}>⚠ {fieldErrors.password}</p>}
                    </div>

                    {errorMessage && (
                        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'0.75rem', padding:'0.75rem 1rem' }}>
                            <p style={{ color:'#dc2626', fontSize:'0.83rem', margin:0 }}>⚠️ {errorMessage}</p>
                        </div>
                    )}

                    <p style={{ textAlign:'center', color:'#64748b', fontSize:'0.85rem', margin:'0.25rem 0 0' }}>
                        Don't have an account?{' '}
                        <Link to='/create-user' style={{ color:'#3b82f6', fontWeight:600, textDecoration:'none' }}>Sign up →</Link>
                    </p>

                    <button type="submit" disabled={loading} style={{
                        width:'100%', padding:'0.85rem',
                        background: loading ? '#93c5fd' : 'linear-gradient(135deg,#3b82f6,#2563eb)',
                        color:'#fff', fontWeight:700, fontSize:'0.95rem',
                        border:'none', borderRadius:'0.875rem', cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow:'0 4px 14px rgba(59,130,246,0.35)', transition:'all 0.2s',
                    }}>
                        {loading ? '⏳ Signing in...' : 'Sign In →'}
                    </button>
                </form>
            </div>
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
const errStyle = { color:'#ef4444', fontSize:'0.78rem', margin:'0.25rem 0 0' };
