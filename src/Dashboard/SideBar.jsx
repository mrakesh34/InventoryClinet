import { Sidebar } from 'flowbite-react';
import {
  HiChartPie,
  HiBookOpen,
  HiPlusCircle,
  HiShoppingCart,
  HiUsers,
  HiLogout,
  HiArchive,
  HiClipboardList,
  HiCollection,
  HiCloudUpload,
} from 'react-icons/hi';
import img from '../../src/assets/profile.jpg';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthProvider';
import { useLocation, Link } from 'react-router-dom';
import MobileDashboard from './MobileDashboard';

const menuItems = [
  { to: '/admin/dashboard',              icon: HiChartPie,       label: 'Dashboard' },
  { to: '/admin/dashboard/manage',       icon: HiBookOpen,       label: 'Books Inventory' },
  { to: '/admin/dashboard/stock',        icon: HiArchive,        label: 'Stock Management' },
  { to: '/admin/dashboard/add-stock',    icon: HiCollection,     label: 'Add Book Stock' },
  { to: '/admin/dashboard/upload',       icon: HiCloudUpload,    label: 'Add New Book' },
  { to: '/admin/dashboard/orders',       icon: HiShoppingCart,   label: 'Orders' },
  { to: '/admin/dashboard/users',        icon: HiUsers,          label: 'Users & Purchases' },
  { to: '/admin/dashboard/activity',     icon: HiClipboardList,  label: 'Stock Activity' },
];

const SideBar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  return (
    <div>
      {/* Desktop Sidebar */}
      <Sidebar aria-label="Inventory Admin Sidebar" className="hidden md:block min-h-screen shadow-lg">
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
          <span className="text-xs text-gray-400 font-normal">Inventory Admin</span>
        </Sidebar.Logo>

        <Sidebar.Items>
          {/* Main Nav */}
          <Sidebar.ItemGroup>
            {menuItems.map(({ to, icon, label }) => {
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
        <MobileDashboard />
      </div>
    </div>
  );
};

export default SideBar;