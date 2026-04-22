import React from 'react';
import { Avatar, Dropdown, Navbar } from 'flowbite-react';
import {
    HiBookOpen, HiCloudUpload, HiShoppingCart,
    HiLogout, HiChartPie, HiArchive, HiClipboardList
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

const navLinks = [
    { to: '/vendor/dashboard',           label: 'Dashboard',        icon: HiChartPie },
    { to: '/vendor/dashboard/my-books',  label: 'My Books',         icon: HiBookOpen },
    { to: '/vendor/dashboard/stock',     label: 'Stock Management', icon: HiArchive },
    { to: '/vendor/dashboard/upload',    label: 'Upload New Book',  icon: HiCloudUpload },
    { to: '/vendor/dashboard/orders',    label: 'My Orders',        icon: HiShoppingCart },
    { to: '/vendor/dashboard/activity',  label: 'Stock Activity',   icon: HiClipboardList },
];

const VendorMobileDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="px-4 border-b border-gray-100 shadow-sm">
            <Navbar fluid rounded>
                <Navbar.Brand as={Link} to="/vendor/dashboard">
                    <span className="self-center whitespace-nowrap text-2xl font-bold text-amber-600 flex items-center gap-2">
                        🏪 Vendor
                    </span>
                </Navbar.Brand>
                <div className="flex gap-3 items-center">
                    <Dropdown
                        arrowIcon={false}
                        inline
                        label={
                            <Avatar
                                alt="Vendor"
                                img={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Vendor')}&background=f59e0b&color=fff`}
                                rounded
                            />
                        }
                    >
                        <Dropdown.Header>
                            <span className="block text-sm font-semibold">{user?.name || 'Vendor'}</span>
                            <span className="block truncate text-sm text-gray-500">{user?.email}</span>
                        </Dropdown.Header>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to="/logout" icon={HiLogout}>
                            Logout
                        </Dropdown.Item>
                    </Dropdown>
                    <Navbar.Toggle />
                </div>
                <Navbar.Collapse>
                    {navLinks.map(({ to, label, icon: Icon }) => (
                        <Navbar.Link key={to} as={Link} to={to} className="flex items-center gap-2 py-2">
                            <Icon className="w-4 h-4 text-amber-600" />
                            {label}
                        </Navbar.Link>
                    ))}
                    <Navbar.Link as={Link} to="/logout" className="text-red-500 flex items-center gap-2 py-2">
                        <HiLogout className="w-4 h-4" /> Logout
                    </Navbar.Link>
                </Navbar.Collapse>
            </Navbar>
        </div>
    );
};

export default VendorMobileDashboard;
