import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import SearchBar from "./SearchBar";

import API_URL from "../api";

const categories = [
    { name: "Trending", icon: "fa-solid fa-fire" },
    { name: "Rooms", icon: "fa-solid fa-bed" },
    { name: "Iconic Cities", icon: "fa-solid fa-city" },
    { name: "Mountain", icon: "fa-solid fa-mountain" },
    { name: "Castles", icon: "fa-solid fa-chess-rook" },
    { name: "Amazing Pools", icon: "fa-solid fa-water" },
    { name: "Camping", icon: "fa-solid fa-campground" },
    { name: "Farms", icon: "fa-solid fa-tree" },
    { name: "Arctic", icon: "fa-solid fa-snowflake" },
    { name: "Domes", icon: "fa-solid fa-house" },
    { name: "Boats", icon: "fa-solid fa-sailboat" }
];

function Navbar() {

    const [user, setUser] = useState(null);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const [showTaxes, setShowTaxes] = useState(
        localStorage.getItem("showTaxes") === "true"
    );

    const navigate = useNavigate();

    // Check logged-in user
    useEffect(() => {

        const checkUser = async () => {

            try {

                const response = await fetch(`${API_URL}/auth/me`, {
                    credentials: "include"
                });

                if (!response.ok) {
                    setUser(null);
                    return;
                }

                const data = await response.json();

                setUser(data.success ? data.user : null);

            } catch (error) {

                console.error("User check failed:", error);
                setUser(null);

            }

        };

        checkUser();

    }, []);

    // Handle logout
    const handleLogout = async () => {

        if (logoutLoading) return;

        setLogoutLoading(true);

        try {

            const response = await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Logout failed.");
            }

            setUser(null);
            setMenuOpen(false);
            navigate("/");

        } catch (error) {

            console.error("Logout failed:", error);

        } finally {

            setLogoutLoading(false);

        }

    };

    // Handle tax toggle
    const handleTaxToggle = () => {

        const newValue = !showTaxes;

        setShowTaxes(newValue);

        localStorage.setItem("showTaxes", String(newValue));

        window.dispatchEvent(new Event("taxPreferenceChanged"));

    };

    // Close mobile menu
    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (

        <header className={`roamnest-navbar ${menuOpen ? "menu-open" : ""}`}>

            {/* Top Navbar */}
            <div className="navbar-top">

                <div className="navbar-left">

<Link
    to="/"
    className="site-logo"
    onClick={closeMenu}
    aria-label="RoamNest Home"
>
                        <svg
                            viewBox="0 0 48 48"
                            width="42"
                            height="42"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="#fe424d"
                                strokeWidth="3.5"
                            />

                            <path
                                d="M29.5 15L25.5 25.5L15 29.5L19 19L29.5 15Z"
                                fill="#fe424d"
                                stroke="#fe424d"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                            />

                            <circle
                                cx="22.3"
                                cy="22.3"
                                r="2.5"
                                fill="white"
                            />

                        </svg>

                    </Link>

                    <Link
                        to="/"
                        className="RoamNest-link"
                        onClick={closeMenu}
                    >
                        RoamNest
                    </Link>

                </div>

                <div className="navbar-search">
                    <SearchBar />
                </div>

                <nav className="navbar-right">

                    <Link to="/my-bookings" className="host-link">
                        My Bookings
                    </Link>

                    {user ? (
                        <>
                            <Link to="/listings/new" className="account-link">
                                New Listing
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="nav-logout"
                                disabled={logoutLoading}
                            >
                                {logoutLoading ? "Logging out..." : "Logout"}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/signup" className="account-link">
                                Sign up
                            </Link>

                            <Link to="/login" className="account-link">
                                Log in
                            </Link>
                        </>
                    )}

                </nav>

                {/* Mobile Hamburger */}
                <button
                    type="button"
                    className="mobile-menu-btn"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                >
                    <i className={menuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
                </button>

            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="mobile-menu">

                    <Link to="/my-bookings" onClick={closeMenu}>
                        My Bookings
                    </Link>

                    {user ? (
                        <>
                            <Link to="/listings/new" onClick={closeMenu}>
                                New Listing
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={logoutLoading}
                            >
                                {logoutLoading ? "Logging out..." : "Logout"}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/signup" onClick={closeMenu}>
                                Sign up
                            </Link>

                            <Link to="/login" onClick={closeMenu}>
                                Log in
                            </Link>
                        </>
                    )}

                </div>
            )}

            {/* Category Navbar */}
            <div className="navbar-bottom">

                <div className="category-list">

                    {categories.map((category) => (

                        <button
                            className="category-item"
                            key={category.name}
                            type="button"
                        >

                            <span className="category-icon">
                                <i className={category.icon}></i>
                            </span>

                            <span className="category-name">
                                {category.name}
                            </span>

                        </button>

                    ))}

                </div>

                <div className="tax-toggle">

                    <span>Display total after taxes</span>

                    <button
                        type="button"
                        className={`toggle-switch ${showTaxes ? "active" : ""}`}
                        onClick={handleTaxToggle}
                        aria-label="Display total after taxes"
                        aria-pressed={showTaxes}
                    >
                        <span></span>
                    </button>

                </div>

            </div>

        </header>

    );

}

export default Navbar;