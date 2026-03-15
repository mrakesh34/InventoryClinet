import { useContext, useEffect, useRef, useState } from "react";
import { FaXmark, FaBars, FaBarsStaggered, FaBlog, FaUser, FaRightFromBracket } from "react-icons/fa6";
import { MdShoppingCart } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthProvider";
import { CartContext } from "../../contexts/CartProvider";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user, logOut } = useContext(AuthContext);
    const { cartItems, isCartOpen, setIsCartOpen } = useContext(CartContext);
    const navigate = useNavigate();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 100);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        logOut();
        setIsDropdownOpen(false);
        navigate("/");
    };

    const baseNavItems = [
        { link: "Home", path: "/" },
        { link: "About", path: "/about" },
        { link: "Shop", path: "/shop" },
        { link: "Blog", path: "/blog" },
    ];

    const navItems = user?.role === 'admin'
        ? [...baseNavItems, { link: "Admin Dashboard", path: "/admin/dashboard" }]
        : baseNavItems;

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="w-full bg-transparent fixed top-0 left-0 right-0 transition-all ease-in duration-300" style={{ zIndex: 40 }}>
            <nav className={`py-4 lg:px-24 px-4 ${isSticky ? "sticky top-0 left-0 right-0 bg-blue-300 shadow-sm" : ""}`}>
                <div className="flex justify-between items-center text-base gap-8">
                    <Link to="/" className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                        <FaBlog className="inline-block" />Books
                    </Link>

                    <ul className="md:flex space-x-12 hidden navitems">
                        {navItems.map(({ link, path }) => (
                            <Link key={link} to={path} className="link block text-base cursor-pointer uppercase text-black hover:text-blue-700">
                                {link}
                            </Link>
                        ))}
                    </ul>

                    {/* Right side: Cart and avatar */}
                    <div className={`space-x-6 hidden lg:flex items-center transition-opacity duration-300 ${isCartOpen ? 'opacity-0 pointer-events-none' : ''}`}>
                        {/* Cart Button */}
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative text-black hover:text-blue-700 transition-colors p-1"
                            aria-label="Open cart"
                        >
                            <MdShoppingCart className="w-6 h-6" />
                            {totalCartItems > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] flex items-center justify-center rounded-full px-1 border-2 border-white box-content">
                                    {totalCartItems}
                                </span>
                            )}
                        </button>

                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={toggleDropdown}
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    title={user.name || user.email}
                                >
                                    {getInitials(user.name || user.email)}
                                </button>

                                {/* Dropdown menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-40">
                                        {/* User info header */}
                                        <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500">
                                            <p className="text-white font-semibold text-sm truncate">{user.name || "User"}</p>
                                            <p className="text-blue-100 text-xs truncate">{user.email}</p>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                                            >
                                                <FaUser className="w-4 h-4 text-blue-500" />
                                                My Profile
                                            </Link>
                                            <hr className="my-1 border-gray-100" />
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                                            >
                                                <FaRightFromBracket className="w-4 h-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu btn */}
                    <div className={`md:hidden flex items-center gap-4 transition-opacity duration-300 ${isCartOpen ? 'opacity-0 pointer-events-none' : ''}`}>
                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="relative text-black p-1"
                        >
                            <MdShoppingCart className="w-6 h-6" />
                            {totalCartItems > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] flex items-center justify-center rounded-full px-1 border-2 border-white box-content">
                                    {totalCartItems}
                                </span>
                            )}
                        </button>
                        <button onClick={toggleMenu} className="text-black focus:outline-none p-1">
                            {isMenuOpen ? <FaXmark className="h-6 w-6 text-black" /> : <FaBarsStaggered className="h-5 w-5 text-black" />}
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                <div className={`space-y-4 px-4 mt-16 py-7 bg-blue-700 z-40 ${isMenuOpen ? "block fixed top-0 right-0 left-0" : "hidden"}`}>
                    {navItems.map(({ link, path }) => (
                        <a href={path} key={link} onClick={toggleMenu} className="block text-white hover:text-gray-500">
                            {link}
                        </a>
                    ))}
                    {user ? (
                        <>
                            <Link to="/profile" onClick={toggleMenu} className="block text-white hover:text-gray-500">My Profile</Link>
                            <button onClick={() => { handleLogout(); toggleMenu(); }} className="block text-red-300 hover:text-red-100">Logout</button>
                        </>
                    ) : (
                        <Link to="/login" onClick={toggleMenu} className="block text-white hover:text-gray-500">Login</Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Navbar;