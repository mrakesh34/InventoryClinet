import { createBrowserRouter, Navigate } from "react-router-dom";
import API_BASE from '../utils/api';
import App from "../App";
import { Home } from "../pages/Home/Home";
import Shop from "../pages/Shop/Shop";
import { DashboardLayout } from "../Dashboard/DashboardLayout";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import AdminRoute from "../PrivateRoute/AdminRoute";
import VendorRoute from "../PrivateRoute/VendorRoute";
import Login from "../pages/Login";
import SingleBook from "../pages/shared/SingleBook";
import Dashboard from "../Dashboard/Dashboard";
import Signup from "../pages/Signup";
import VendorSignup from "../pages/VendorSignup";
import Logout from "../pages/Logout";
import ErrorPage from "../pages/shared/ErrorPage";
import About from "../pages/about/About";

import Profile from "../pages/Profile";
import Checkout from "../pages/Checkout/Checkout";
import PaymentSuccess from "../pages/Checkout/PaymentSuccess";
import UserOrders from "../pages/Orders/UserOrders";
import OrderDetails from "../pages/Orders/OrderDetails";
import AdminOrders from "../Dashboard/AdminOrders";
import AdminUsers from "../Dashboard/AdminUsers";
import StockActivityPage from "../Dashboard/StockActivityPage";
import AdminVendorApprovals from "../Dashboard/AdminVendorApprovals";
import AdminVendors from "../Dashboard/AdminVendors";
import AnalyticsDashboard from "../Dashboard/AnalyticsDashboard";
import VendorSettlements from "../Dashboard/VendorSettlements";
import ReportsPage from "../Dashboard/ReportsPage";

// Vendor Dashboard
import VendorLayout from "../VendorDashboard/VendorLayout";
import VendorDashboard from "../VendorDashboard/VendorDashboard";
import VendorManageBooks from "../VendorDashboard/VendorManageBooks";
import VendorUploadBook from "../VendorDashboard/VendorUploadBook";
import VendorEditBook from "../VendorDashboard/VendorEditBook";
import VendorOrders from "../VendorDashboard/VendorOrders";
import VendorStockManagement from "../VendorDashboard/VendorStockManagement";
import VendorStockActivity from "../VendorDashboard/VendorStockActivity";
import VendorEarnings from "../VendorDashboard/VendorEarnings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage/>,
    children: [
      { path: "/", element: <Home /> },
      { path: "/shop", element: <Shop /> },
      {
        path: "/book/:id",
        element: <SingleBook />,
        loader: ({ params }) => fetch(`${API_BASE}/books/${params.id}`)
      },
      { path: "/about", element: <About/> },

      { path: "/profile", element: <Profile/> },
      { path: "/checkout", element: <PrivateRoute><Checkout /></PrivateRoute> },
      { path: "/orders", element: <PrivateRoute><UserOrders /></PrivateRoute> },
      { path: "/payment-success", element: <PrivateRoute><PaymentSuccess /></PrivateRoute> },
      { path: "/purchase/:id", element: <PrivateRoute><OrderDetails /></PrivateRoute> },
    ]
  },

  // ─── Admin Dashboard ─────────────────────────────────────────────────────────
  {
    path: "/admin/dashboard",
    element: <AdminRoute><DashboardLayout /></AdminRoute>,
    children: [
      { path: "/admin/dashboard",                      element: <Dashboard /> },
      { path: "/admin/dashboard/vendor-approvals",     element: <AdminVendorApprovals /> },
      { path: "/admin/dashboard/vendors",              element: <AdminVendors /> },
      { path: "/admin/dashboard/users",                element: <AdminUsers /> },
      { path: "/admin/dashboard/orders",               element: <AdminOrders /> },
      { path: "/admin/dashboard/activity",             element: <StockActivityPage /> },
      { path: "/admin/dashboard/analytics",            element: <AnalyticsDashboard /> },
      { path: "/admin/dashboard/settlements",          element: <VendorSettlements /> },
      { path: "/admin/dashboard/reports",              element: <ReportsPage /> },
    ],
  },

  // ─── Vendor Dashboard ────────────────────────────────────────────────────────
  {
    path: "/vendor/dashboard",
    element: <VendorRoute><VendorLayout /></VendorRoute>,
    children: [
      { path: "/vendor/dashboard",               element: <VendorDashboard /> },
      { path: "/vendor/dashboard/my-books",      element: <VendorManageBooks /> },
      { path: "/vendor/dashboard/upload",        element: <VendorUploadBook /> },
      { path: "/vendor/dashboard/orders",        element: <VendorOrders /> },
      { path: "/vendor/dashboard/stock",         element: <VendorStockManagement /> },
      { path: "/vendor/dashboard/add-stock",     element: <Navigate to="/vendor/dashboard/stock" replace /> },
      { path: "/vendor/dashboard/activity",      element: <VendorStockActivity /> },
      { path: "/vendor/dashboard/earnings",      element: <VendorEarnings /> },
      {
        path: "/vendor/dashboard/edit-books/:id",
        element: <VendorEditBook />,
        loader: ({ params }) => fetch(`${API_BASE}/books/${params.id}`)
      },
    ],
  },

  { path: "login", element: <Login /> },
  { path: "/create-user",  element: <Signup/> },
  { path: "/create-vendor", element: <VendorSignup/> },
  { path: "/logout",        element: <Logout/> },
]);

export default router;