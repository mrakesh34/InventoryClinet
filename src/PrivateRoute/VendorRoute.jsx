import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';
import { Spinner } from 'flowbite-react';

const VendorRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spinner aria-label="Loading..." />
            </div>
        );
    }

    if (user && user.role === 'vendor') {
        return children;
    }

    if (user && user.role !== 'vendor') {
        // Logged in but wrong role
        return <Navigate to="/" replace />;
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
};

export default VendorRoute;
