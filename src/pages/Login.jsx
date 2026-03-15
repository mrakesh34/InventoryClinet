import React, { useContext, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';
import toast from 'react-hot-toast';

export default function Login() {

    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);

    const location = useLocation();
    const navigate = useNavigate();

    const from = location.state?.from?.pathname || '/';

    const handleLogin = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setLoading(true);
        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;

        try {
            const data = await login(email, password);
            toast.success('Login successful!');
            if (data.user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (error) {
            const msg = error.message || 'Login failed. Please try again.';
            setErrorMessage(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <div className="max-w-md mx-auto">
                        <div>
                            <h1 className="text-3xl font-semibold">Login to Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-500">Enter your credentials to access the admin panel</p>
                        </div>
                        <div className="divide-y divide-gray-200">
                            <form onSubmit={handleLogin} className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                {errorMessage && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-red-600 text-sm">{errorMessage}</p>
                                    </div>
                                )}

                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <Link to='/create-user' className="underline text-blue-600 font-medium">Sign Up here</Link>
                                </p>

                                <div className="relative">
                                    <button
                                        type='submit'
                                        disabled={loading}
                                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg px-6 py-2 font-medium transition-colors"
                                    >
                                        {loading ? 'Logging in...' : 'Login'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
