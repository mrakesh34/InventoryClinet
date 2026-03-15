import React from 'react';
import { Avatar, Dropdown, Navbar } from 'flowbite-react';
import { HiBookOpen, HiCollection, HiCloudUpload, HiShoppingCart, HiUsers, HiLogout, HiChartPie, HiArchive, HiClipboardList } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';

const navLinks = [
  { to: '/admin/dashboard',           label: 'Dashboard',        icon: HiChartPie },
  { to: '/admin/dashboard/manage',    label: 'Books Inventory',  icon: HiBookOpen },
  { to: '/admin/dashboard/stock',     label: 'Stock Management', icon: HiArchive },
  { to: '/admin/dashboard/add-stock', label: 'Add Book Stock',   icon: HiCollection },
  { to: '/admin/dashboard/upload',    label: 'Add New Book',     icon: HiCloudUpload },
  { to: '/admin/dashboard/orders',    label: 'Orders',           icon: HiShoppingCart },
  { to: '/admin/dashboard/users',     label: 'Users & Purchases',icon: HiUsers },
  { to: '/admin/dashboard/activity',  label: 'Stock Activity',   icon: HiClipboardList },
];

const MobileDashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="px-4 border-b border-gray-100 shadow-sm">
      <Navbar fluid rounded>
        <Navbar.Brand as={Link} to="/admin/dashboard">
          <span className="self-center whitespace-nowrap text-2xl font-bold text-blue-700 flex items-center gap-2">
            📦 Inventory
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
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Navbar.Link key={to} as={Link} to={to} className="flex items-center gap-2 py-2">
              <Icon className="w-4 h-4 text-blue-600" />
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

export default MobileDashboard;