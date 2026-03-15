import React, { useContext, useEffect } from 'react'
import { Spinner } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthProvider';

const Logout = () => {
    const navigate = useNavigate();
    const { logOut } = useContext(AuthContext);

    useEffect(() => {
        const handleSignOut = async () => {
            try {
                // Clear any local storage tokens
                localStorage.removeItem('bookstore-token');
                
                // Call context logout (e.g. Firebase signOut)
                if (logOut) {
                    await logOut();
                }
                
                // Redirect to Home
                navigate('/', { replace: true });
            } catch (error) {
                console.error("Logout error", error);
                navigate('/', { replace: true });
            }
        };

        handleSignOut();
    }, [logOut, navigate]);

    return (
        <div className='h-screen flex flex-col items-center justify-center bg-gray-50'>
            <Spinner size="xl" />
            <p className="mt-4 text-gray-600 font-medium">Logging you out...</p>
        </div>
    )
}

export default Logout