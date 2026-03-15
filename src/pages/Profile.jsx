import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthProvider";
import { Navigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaShoppingBag, FaBoxOpen, FaShoppingCart
} from "react-icons/fa";

const Profile = () => {
  const { user, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("profile");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600"></div>
          <div className="px-8 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-end gap-4 -mt-12">
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg flex-shrink-0">
                  {getInitials(user.name || user.email)}
                </div>
                <div className="pb-1">
                  <h1 className="text-2xl font-bold text-gray-800">{user.name || "User"}</h1>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200 border-b-2 ${
                activeTab === "profile"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-blue-500 hover:bg-gray-50"
              }`}
            >
              <FaUser className="w-4 h-4" />
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab("purchases")}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200 border-b-2 ${
                activeTab === "purchases"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-blue-500 hover:bg-gray-50"
              }`}
            >
              <FaShoppingBag className="w-4 h-4" />
              My Purchases
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "profile" && <ProfileDetailsTab user={user} />}
            {activeTab === "purchases" && <MyPurchasesTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ───── Profile Details Tab ───── */
const ProfileDetailsTab = ({ user }) => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-gray-800">Account Information</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <InfoCard icon={<FaUser className="text-blue-500" />} label="Full Name" value={user.name || "Not set"} />
      <InfoCard icon={<FaEnvelope className="text-blue-500" />} label="Email Address" value={user.email} />
    </div>

    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
      <p className="text-sm text-blue-700 font-medium">
        🔐 Your account is secured. To update your profile details, please contact support.
      </p>
    </div>
  </div>
);

const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-gray-800 font-semibold truncate">{value}</p>
    </div>
  </div>
);

/* ───── My Purchases Tab ───── */
const MyPurchasesTab = () => (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-gray-800">My Purchases</h2>

    {/* Under Construction Card */}
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 flex flex-col items-center text-center gap-4 shadow-sm">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
        <FaBoxOpen className="w-10 h-10 text-amber-500" />
      </div>

      {/* Under Construction Badge */}
      <div className="inline-flex items-center gap-2 bg-amber-200 text-amber-800 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
        <span>🚧</span> Under Construction
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-1">Purchase History Coming Soon</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          We're working hard to bring you your complete order history. Check back soon!
        </p>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => window.location.href = "/shop"}
        className="mt-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <FaShoppingCart className="w-4 h-4" />
        Add to Cart
      </button>
    </div>
  </div>
);

export default Profile;
