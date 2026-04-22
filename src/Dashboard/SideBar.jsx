import { Sidebar } from 'flowbite-react';
import {
  HiChartPie,
  HiShoppingCart,
  HiUsers,
  HiLogout,
  HiClipboardList,
  HiBadgeCheck,
  HiUserGroup,
  HiChartBar,
  HiCurrencyDollar,
  HiDocumentReport,
} from 'react-icons/hi';
import img from '../../src/assets/profile.jpg';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthProvider';
import { useLocation, Link } from 'react-router-dom';
import MobileDashboard from './MobileDashboard';
import LowStockBell from '../components/LowStockBell';
import API_BASE from '../utils/api';

const SideBar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending vendor application count for badge
  useEffect(() => {
    const token = localStorage.getItem('bookstore-token');
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/vendor/applications/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.count || 0);
        }
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { to: '/admin/dashboard',                    icon: HiChartPie,        label: 'Dashboard' },
    {
      to: '/admin/dashboard/vendor-approvals',
      icon: HiBadgeCheck,
      label: 'Vendor Approvals',
      badge: pendingCount,
    },
    { to: '/admin/dashboard/vendors',            icon: HiUserGroup,       label: 'Manage Vendors' },
    { to: '/admin/dashboard/users',              icon: HiUsers,           label: 'Users & Purchases' },
    { to: '/admin/dashboard/orders',             icon: HiShoppingCart,    label: 'All Orders' },
    { to: '/admin/dashboard/activity',           icon: HiClipboardList,   label: 'Stock Activity' },
    { to: '/admin/dashboard/analytics',          icon: HiChartBar,        label: 'Analytics' },
    { to: '/admin/dashboard/settlements',        icon: HiCurrencyDollar,  label: 'Settlements' },
    { to: '/admin/dashboard/reports',             icon: HiDocumentReport,  label: 'Reports' },
  ];

  return (
    <div>
      {/* Desktop Sidebar */}
      <Sidebar aria-label="Admin Panel Sidebar" className="hidden md:block min-h-screen shadow-lg">
        {/* Logo / Brand */}
        <Sidebar.Logo
          href="/admin/dashboard"
          img={img}
          className="w-10 h-10 rounded-full object-cover"
          imgAlt="Admin"
        >
          <span className="text-sm font-semibold truncate max-w-[120px] block">
            {user?.displayName || user?.email || 'Admin'}
          </span>
          <span className="text-xs text-purple-600 font-semibold">Admin Panel</span>
        </Sidebar.Logo>

        <Sidebar.Items>
          {/* Low Stock Bell — placed at top of nav */}
          <div className="px-3 pb-2 pt-1">
            <div className="flex items-center gap-2">
              <LowStockBell dashboardPath="/admin/dashboard/activity" />
              <span className="text-xs text-gray-400 font-medium">Low Stock Alerts</span>
            </div>
          </div>

          {/* Main Nav */}
          <Sidebar.ItemGroup>
            {menuItems.map(({ to, icon, label, badge }) => {
              const isActive =
                to === '/admin/dashboard'
                  ? location.pathname === '/admin/dashboard'
                  : location.pathname.startsWith(to);
              return (
                <Sidebar.Item
                  key={to}
                  as={Link}
                  to={to}
                  icon={icon}
                  className={
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border-r-4 border-blue-600 rounded-r-lg'
                      : 'text-gray-600 hover:bg-gray-50'
                  }
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{label}</span>
                    {badge > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full animate-pulse">
                        {badge}
                      </span>
                    )}
                  </div>
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
        <MobileDashboard />
      </div>
    </div>
  );
};

export default SideBar;