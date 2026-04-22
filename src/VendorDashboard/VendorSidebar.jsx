import { Sidebar } from 'flowbite-react';
import {
    HiChartPie,
    HiBookOpen,
    HiPlusCircle,
    HiShoppingCart,
    HiLogout,
    HiArchive,
    HiClipboardList,
    HiCloudUpload,
    HiCurrencyDollar,
} from 'react-icons/hi';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';
import { useLocation, Link } from 'react-router-dom';
import VendorMobileDashboard from './VendorMobileDashboard';
import LowStockBell from '../components/LowStockBell';

const menuItems = [
    { to: '/vendor/dashboard',               icon: HiChartPie,        label: 'Dashboard' },
    { to: '/vendor/dashboard/my-books',      icon: HiBookOpen,        label: 'My Books' },
    { to: '/vendor/dashboard/stock',         icon: HiArchive,         label: 'Stock Management' },
    { to: '/vendor/dashboard/upload',        icon: HiCloudUpload,     label: 'Upload New Book' },
    { to: '/vendor/dashboard/orders',        icon: HiShoppingCart,    label: 'My Orders' },
    { to: '/vendor/dashboard/activity',      icon: HiClipboardList,   label: 'Stock Activity' },
    { to: '/vendor/dashboard/earnings',      icon: HiCurrencyDollar,  label: 'My Earnings' },
];

const VendorSidebar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    return (
        <div>
            {/* Desktop Sidebar */}
            <Sidebar aria-label="Vendor Sidebar" className="hidden md:block min-h-screen shadow-lg">
                {/* Logo / Brand */}
                <Sidebar.Logo
                    href="/vendor/dashboard"
                    imgAlt="Vendor"
                    className="w-10 h-10 rounded-full object-cover"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🏪</span>
                        <div>
                            <span className="text-sm font-semibold truncate max-w-[120px] block">
                                {user?.name || user?.email || 'Vendor'}
                            </span>
                            <span className="text-xs text-amber-500 font-semibold">Vendor Panel</span>
                        </div>
                    </div>
                </Sidebar.Logo>

                <Sidebar.Items>
                    {/* Low Stock Bell */}
                    <div className="px-3 pb-2 pt-1">
                        <div className="flex items-center gap-2">
                            <LowStockBell dashboardPath="/vendor/dashboard/stock" />
                            <span className="text-xs text-gray-400 font-medium">Low Stock Alerts</span>
                        </div>
                    </div>

                    <Sidebar.ItemGroup>
                        {menuItems.map(({ to, icon, label }) => {
                            const isActive =
                                to === '/vendor/dashboard'
                                    ? location.pathname === '/vendor/dashboard'
                                    : location.pathname.startsWith(to);
                            return (
                                <Sidebar.Item
                                    key={to}
                                    as={Link}
                                    to={to}
                                    icon={icon}
                                    className={
                                        isActive
                                            ? 'bg-amber-50 text-amber-700 font-semibold border-r-4 border-amber-500 rounded-r-lg'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }
                                >
                                    {label}
                                </Sidebar.Item>
                            );
                        })}
                    </Sidebar.ItemGroup>

                    {/* Logout */}
                    <Sidebar.ItemGroup>
                        <Sidebar.Item
                            as={Link}
                            to="/logout"
                            icon={HiLogout}
                            className="text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                        >
                            Logout
                        </Sidebar.Item>
                    </Sidebar.ItemGroup>
                </Sidebar.Items>
            </Sidebar>

            {/* Mobile Nav */}
            <div className="md:hidden">
                <VendorMobileDashboard />
            </div>
        </div>
    );
};

export default VendorSidebar;
