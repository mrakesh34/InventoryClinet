import { createBrowserRouter } from "react-router-dom";
import API_BASE from '../utils/api';
import App from "../App";
import { Home } from "../pages/Home/Home";
import Shop from "../pages/Shop/Shop";
import { DashboardLayout } from "../Dashboard/DashboardLayout";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Login from "../pages/Login";
import SignleBook from "../pages/shared/SignleBook";
import UploadBook from "../Dashboard/UploadBook";
import Dashboard from "../Dashboard/Dashboard";
import ManageBooks from "../Dashboard/ManageBooks";
import EditBooks from "../Dashboard/EditBooks";
import Signup from "../pages/Signup";
import AdminSignup from "../pages/AdminSignup";
import Logout from "../pages/Logout";
import ErrorPage from "../pages/shared/ErrorPage";
import About from "../pages/about/About";
import Blog from "../pages/blog/Blog";
import Profile from "../pages/Profile";
import Checkout from "../pages/Checkout/Checkout";
import PaymentSuccess from "../pages/Checkout/PaymentSuccess";
import UserOrders from "../pages/Orders/UserOrders";
import OrderDetails from "../pages/Orders/OrderDetails";
import AdminOrders from "../Dashboard/AdminOrders";
import AdminUsers from "../Dashboard/AdminUsers";
import StockManagement from "../Dashboard/StockManagement";
import AddBookStock from "../Dashboard/AddBookStock";
import StockActivityPage from "../Dashboard/StockActivityPage";

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
        element: <SignleBook />,
        loader: ({ params }) => fetch(`${API_BASE}/books/${params.id}`)
      },
      { path: "/about", element: <About/> },
      { path: "/blog", element: <Blog/> },
      { path: "/profile", element: <Profile/> },
      { path: "/checkout", element: <PrivateRoute><Checkout /></PrivateRoute> },
      { path: "/orders", element: <PrivateRoute><UserOrders /></PrivateRoute> },
      { path: "/payment-success", element: <PrivateRoute><PaymentSuccess /></PrivateRoute> },
      { path: "/purchase/:id", element: <PrivateRoute><OrderDetails /></PrivateRoute> },
    ]
  },
  {
    path: "/admin/dashboard",
    element: <DashboardLayout />,
    children: [
      { path: "/admin/dashboard", element: <PrivateRoute><Dashboard /></PrivateRoute> },
      { path: "/admin/dashboard/upload", element: <UploadBook /> },
      { path: "/admin/dashboard/manage", element: <ManageBooks /> },
      { path: "/admin/dashboard/orders", element: <AdminOrders /> },
      { path: "/admin/dashboard/users", element: <AdminUsers /> },
      { path: "/admin/dashboard/stock", element: <StockManagement /> },
      { path: "/admin/dashboard/add-stock", element: <AddBookStock /> },
      { path: "/admin/dashboard/activity", element: <StockActivityPage /> },
      {
        path: "/admin/dashboard/edit-books/:id",
        element: <EditBooks />,
        loader: ({ params }) => fetch(`${API_BASE}/books/${params.id}`)
      },
    ],
  },
  { path: "login", element: <Login /> },
  { path: "/create-user", element: <Signup/> },
  { path: "/admin/signup", element: <AdminSignup/> },
  { path: "/logout", element: <Logout/> },
]);

export default router;