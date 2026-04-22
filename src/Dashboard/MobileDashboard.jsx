import React, { useState, useEffect } from 'react';
import { Avatar, Dropdown, Navbar } from 'flowbite-react';
import {
  HiChartPie,
  HiShoppingCart,
  HiUsers,
  HiLogout,
  HiClipboardList,
  HiBadgeCheck,
  HiUserGroup,
  HiDocumentReport,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';
import API_BASE from '../utils/api';

const MobileDashboard = () => {
  const { user } = useContext(AuthContext);
  const [pendingCount, setPendingCount] = useState(0);

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
  }, []);

  const navLinks = [
    { to: '/admin/dashboard',                   label: 'Dashboard',        icon: HiChartPie },
    { to: '/admin/dashboard/vendor-approvals',  label: 'Vendor Approvals', icon: HiBadgeCheck, badge: pendingCount },
    { to: '/admin/dashboard/vendors',           label: 'Manage Vendors',   icon: HiUserGroup },
    { to: '/admin/dashboard/users',             label: 'Users & Purchases',icon: HiUsers },
    { to: '/admin/dashboard/orders',            label: 'All Orders',       icon: HiShoppingCart },
    { to: '/admin/dashboard/activity',         label: 'Stock Activity',   icon: HiClipboardList },
    { to: '/admin/dashboard/reports',           label: 'Reports',          icon: HiDocumentReport },
  ];

  return (
    <div className="px-4 border-b border-gray-100 shadow-sm">
      <Navbar fluid rounded>
        <Navbar.Brand as={Link} to="/admin/dashboard">
          <span className="self-center whitespace-nowrap text-2xl font-bold text-blue-700 flex items-center gap-2">
            🛡️ Admin
          </span>
        </Navbar.Brand>
        <div className="flex gap-3 items-center">
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="Admin"
                img={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'Admin')}&background=3b82f6&color=fff`}
                rounded
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-semibold">{user?.displayName || 'Admin'}</span>
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
          {navLinks.map(({ to, label, icon: Icon, badge }) => (
            <Navbar.Link key={to} as={Link} to={to} className="flex items-center gap-2 py-2">
              <Icon className="w-4 h-4 text-blue-600" />
              {label}
              {badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full animate-pulse">
                  {badge}
                </span>
              )}
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

export default MobileDashboard;