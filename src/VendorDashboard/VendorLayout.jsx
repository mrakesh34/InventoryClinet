import React from 'react';
import VendorSidebar from './VendorSidebar';
import { Outlet } from 'react-router-dom';

const VendorLayout = () => {
    return (
        <div className="flex gap-4 flex-col md:flex-row min-h-screen bg-gray-50">
            <div>
                <VendorSidebar />
            </div>
            <div className="flex-1 p-0 md:p-4">
                <Outlet />
            </div>
        </div>
    );
};

export default VendorLayout;
