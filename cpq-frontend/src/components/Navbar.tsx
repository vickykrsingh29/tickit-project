import React, { useEffect, useState } from "react";
import {
  FaBox,
  FaChevronDown,
  FaChevronLeft,
  FaFileInvoice,
  FaHandshake,
  FaHome,
  FaMoon,
  FaSignOutAlt,
  FaTags,
  FaUser,
  FaUsers,
  FaUserShield,
} from "react-icons/fa";
import { IoDocuments } from "react-icons/io5";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const Navbar: React.FC = () => {
  const { isAuthenticated, isLoading, user, getAccessTokenSilently, logout } = useAuth0();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActiveTab, setIsActiveTab] = useState("dashboard");
  const [isLiaisoningOpen, setIsLiaisoningOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false); // New state for Products dropdown

  useEffect(() => {
    const checkUser = async () => {
      if (isLoading) return;
      if (!isAuthenticated || !user?.email) {
        return;
      }
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/checkUser`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: user.email }),
          }
        );
        const data = await response.json();
        if (data.role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkUser();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently]);

  return (
    <div className={`${isCollapsed ? "w-20" : "w-64"} min-h-screen flex flex-col shadow-lg transition-all duration-300`} style={{ background: "#c8dce8" }}>
      <div className="p-6 border-b border-black/10 flex justify-between items-center">
        <h1 className={`text-2xl font-bold text-black flex items-center gap-2 ${isCollapsed ? "hidden" : ""}`}>
          <FaFileInvoice className="text-xl" />
          <span>TickIT</span>
        </h1>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg hover:bg-[#057dcd] hover:text-white transition-colors ${isCollapsed ? "rotate-180" : ""} transition-transform duration-300`}
        >
          <FaChevronLeft />
        </button>
      </div>

      <nav className="flex-grow p-4">
        <ul className="space-y-1">
          <li>
            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors group ${isActiveTab === "dashboard" ? "bg-[#057dcd] text-white" : ""}`}
              title="Dashboard"
              onClick={() => {
                setIsActiveTab("dashboard");
              }}
            >
              <FaHome className="text-xl" />
              <span className={`font-medium whitespace-nowrap ${isCollapsed ? "hidden" : ""}`}>Dashboard</span>
            </Link>
          </li>

          <li className="relative">
            <button
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors"
            >
              <FaBox className="text-xl min-w-[1.25rem]" />
              <span className={`font-medium flex-grow text-left ${isCollapsed ? "hidden" : ""}`}>Products</span>
              {!isCollapsed && (
                <FaChevronDown className={`ml-auto transition-transform duration-200 ${isProductsOpen ? "rotate-180" : ""}`} />
              )}
            </button>

            {isProductsOpen && !isCollapsed && (
              <ul className="mt-1 space-y-1 pl-8">
                <li>
                  <Link
                    to="/products"
                    className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors ${isActiveTab === "catalogue" ? "bg-[#057dcd] text-white" : ""}`}
                    onClick={() => {
                      setIsActiveTab("catalogue");
                    }}
                  >
                    <span className="font-medium">Catalogue</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products-supplied"
                    className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors ${isActiveTab === "products-supplied" ? "bg-[#057dcd] text-white" : ""}`}
                    onClick={() => {
                      setIsActiveTab("products-supplied");
                    }}
                  >
                    <span className="font-medium">Products Supplied</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link
              to="/customers"
              className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors ${isActiveTab === "customers" ? "bg-[#057dcd] text-white" : ""}`}
              onClick={() => {
                setIsActiveTab("customers");
              }}
            >
              <FaUsers className="text-xl" />
              <span className={`font-medium whitespace-nowrap ${isCollapsed ? "hidden" : ""}`}>Customers</span>
            </Link>
          </li>
          <li>
            <Link
              to="/orders"
              className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors ${isActiveTab === "orders" ? "bg-[#057dcd] text-white" : ""}`}
              onClick={() => {
                setIsActiveTab("orders");
              }}
            >
              <IoDocuments className="text-xl" />
              <span className={`font-medium whitespace-nowrap ${isCollapsed ? "hidden" : ""}`}>Orders</span>
            </Link>
          </li>
          <li>
            <Link
              to="/quotes"
              className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors ${isActiveTab === "quotes" ? "bg-[#057dcd] text-white" : ""}`}
              onClick={() => {
                setIsActiveTab("quotes");
              }}
            >
              <FaFileInvoice className="text-xl" />
              <span className={`font-medium whitespace-nowrap ${isCollapsed ? "hidden" : ""}`}>Quotes</span>
            </Link>
          </li>

          <li className="relative">
            <button
              onClick={() => setIsLiaisoningOpen(!isLiaisoningOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors"
            >
              <FaHandshake className="text-xl min-w-[1.25rem]" />
              <span className={`font-medium flex-grow text-left ${isCollapsed ? "hidden" : ""}`}>Liaisoning</span>
              {!isCollapsed && (
                <FaChevronDown className={`ml-auto transition-transform duration-200 ${isLiaisoningOpen ? "rotate-180" : ""}`} />
              )}
            </button>

            {isLiaisoningOpen && !isCollapsed && (
              <ul className="mt-1 space-y-1 pl-8">
                <li>
                  <Link
                    to="/licenses"
                    className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors ${isActiveTab === "licenses" ? "bg-[#057dcd] text-white" : ""}`}
                    onClick={() => {
                      setIsActiveTab("licenses");
                    }}
                  >
                    <span className="font-medium">Licenses</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/liaisoning-requests"
                    className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors ${isActiveTab === "requests" ? "bg-[#057dcd] text-white" : ""}`}
                    onClick={() => {
                      setIsActiveTab("requests");
                    }}
                  >
                    <span className="font-medium">Requests</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link
              to="/pricing"
              className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors ${isActiveTab === "pricing" ? "bg-[#057dcd] text-white" : ""}`}
              onClick={() => {
                setIsActiveTab("pricing");
              }}
            >
              <FaTags className="text-xl" />
              <span className={`font-medium whitespace-nowrap ${isCollapsed ? "hidden" : ""}`}>Pricing</span>
            </Link>
          </li>
          <li>
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors ${isActiveTab === "profile" ? "bg-[#057dcd] text-white" : ""}`}
              title="Profile"
              onClick={() => {
                setIsActiveTab("profile");
              }}
            >
              <FaUser className="text-xl" />
              <span className={`font-medium whitespace-nowrap ${isCollapsed ? "hidden" : ""}`}>Profile</span>
            </Link>
          </li>
          {isAdmin && (
            <li>
              <Link
                to="/users"
                className={`flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-[#057dcd]/80 hover:text-white transition-colors ${isActiveTab === "users" ? "bg-[#057dcd] text-white" : ""}`}
                onClick={() => {
                  setIsActiveTab("users");
                }}
              >
                <FaUserShield className="text-xl" />
                <span className={`font-medium whitespace-nowrap ${isCollapsed ? "hidden" : ""}`}>User Management</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className={`p-4 border-t border-black/10 ${isCollapsed ? "items-center" : ""}`}>
        {isAuthenticated && (
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="flex items-center gap-2 w-full px-4 py-2 mb-3 rounded-lg bg-[#057dcd] text-white hover:bg-[#057dcd]/80 transition-colors font-medium"
            title="Logout"
          >
            <FaSignOutAlt />
            <span className={isCollapsed ? "hidden" : ""}>Logout</span>
          </button>
        )}
        <button
          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-[#057dcd] text-white hover:bg-[#057dcd]/80 transition-colors font-medium"
          title="Dark Mode"
        >
          <FaMoon />
          <span className={isCollapsed ? "hidden" : ""}>Dark Mode</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;