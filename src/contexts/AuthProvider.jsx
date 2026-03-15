import React from 'react';
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_BASE = 'http://localhost:5000/api';

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, restore user from stored token
    useEffect(() => {
        const token = localStorage.getItem('bookstore-token');
        const storedUser = localStorage.getItem('bookstore-user');
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('bookstore-token');
                localStorage.removeItem('bookstore-user');
            }
        }
        setLoading(false);
    }, []);

    // Signup with email, password, name, role
    const createUser = async (email, password, name, role = 'user') => {
        setLoading(true);
        const res = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, role })
        });
        const data = await res.json();
        if (!res.ok) {
            setLoading(false);
            throw new Error(data.error || 'Signup failed');
        }
        localStorage.setItem('bookstore-token', data.token);
        localStorage.setItem('bookstore-user', JSON.stringify(data.user));
        setUser(data.user);
        setLoading(false);
        return data;
    };

    // Login with email, password
    const login = async (email, password) => {
        setLoading(true);
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
            setLoading(false);
            throw new Error(data.error || 'Login failed');
        }
        localStorage.setItem('bookstore-token', data.token);
        localStorage.setItem('bookstore-user', JSON.stringify(data.user));
        setUser(data.user);
        setLoading(false);
        return data;
    };

    // Logout
    const logOut = () => {
        localStorage.removeItem('bookstore-token');
        localStorage.removeItem('bookstore-user');
        setUser(null);
    };

    const authInfo = {
        user,
        loading,
        createUser,
        login,
        logOut,
        // keep signUpWithGmail as a stub so old references don't crash
        signUpWithGmail: () => Promise.reject(new Error('Google login not available'))
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;