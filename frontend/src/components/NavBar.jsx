import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../assets/navlogo.png';

// Navbar style constants
const navBase = 
  "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-teal-100";
const navBg = (isScrolled) => (
  isScrolled
    ? "bg-white/95 shadow-xl backdrop-blur-lg"
    : "bg-white/80 backdrop-blur-lg"
);

// Modern font, uppercase, wide tracking on nav
const baseBtn = 
  "px-5 py-2 mx-1 rounded-full font-bold shadow-sm " +
  "transition-colors duration-200 focus:outline-none font-montserrat tracking-wider uppercase text-base";

const btnOutline =
  `${baseBtn} border border-teal-400 bg-white text-teal-800 hover:bg-teal-50 hover:text-teal-900`;
const btnGrad =
  `${baseBtn} bg-gradient-to-r from-teal-500 to-green-600 text-white hover:from-teal-600 hover:to-green-700`;
const btnLogout =
  `${baseBtn} bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700`;

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    setIsLoggedIn(!!localStorage.getItem('token'));
    const storageListener = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', storageListener);
    window.addEventListener('authChange', storageListener);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', storageListener);
      window.removeEventListener('authChange', storageListener);
    };
  }, []);

  const scrollToSection = (section) => {
    if (location.pathname !== "/") {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 250);
    } else {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    setIsLoggedIn(false);
    setIsMobileMenuOpen(false);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const unauthLinks = (
    <>
      <button type="button" onClick={() => scrollToSection("home")} className={btnOutline}>
        Home
      </button>
      <button type="button" onClick={() => scrollToSection("features")} className={btnOutline}>
        Features
      </button>
      <button type="button" onClick={() => scrollToSection("about")} className={btnOutline}>
        About
      </button>
      <Link to="/login" className={btnGrad}>
        Login
      </Link>
    </>
  );

  const authLinks = (
    <>
      <Link to="/dashboard" className={btnOutline}>
        Dashboard
      </Link>
      <Link to="/my-fields" className={btnOutline}>
        My Fields
      </Link>
      <Link to="/crops" className={btnOutline}>
        Crops
      </Link>
      <Link to="/predictions" className={btnOutline}>
        Predictions
      </Link>
      <Link to="/disease-detection" className={btnOutline}>
        Disease
      </Link>
      <button type="button" onClick={handleLogout} className={btnLogout}>
        Logout
      </button>
    </>
  );

  return (
    <nav className={`${navBase} ${navBg(isScrolled)} font-montserrat`}>
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
            <img
              src={logo}
              alt="FarmFi"
              className="h-16 w-auto transition-transform hover:scale-105 drop-shadow-lg"
            />
          </Link>
          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? authLinks : unauthLinks}
          </div>
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pb-4 space-y-2 border-t border-gray-200 pt-3 bg-white/95 rounded-b-xl shadow-lg font-montserrat">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className={`${btnOutline} block w-full text-left mb-1`} onClick={() => setIsMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/my-fields" className={`${btnOutline} block w-full text-left mb-1`} onClick={() => setIsMobileMenuOpen(false)}>
                  My Fields
                </Link>
                <Link to="/crops" className={`${btnOutline} block w-full text-left mb-1`} onClick={() => setIsMobileMenuOpen(false)}>
                  Crops
                </Link>
                <Link to="/predictions" className={`${btnOutline} block w-full text-left mb-1`} onClick={() => setIsMobileMenuOpen(false)}>
                  Predictions
                </Link>
                <Link to="/disease-detection" className={`${btnOutline} block w-full text-left mb-1`} onClick={() => setIsMobileMenuOpen(false)}>
                  Disease Detection
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`${btnLogout} block w-full text-left px-6 mt-2`}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => scrollToSection("home")} className={`${btnOutline} block w-full text-left mb-1`}>Home</button>
                <button type="button" onClick={() => scrollToSection("features")} className={`${btnOutline} block w-full text-left mb-1`}>Features</button>
                <button type="button" onClick={() => scrollToSection("about")} className={`${btnOutline} block w-full text-left mb-1`}>About</button>
                <Link to="/login" className={`${btnGrad} block w-full text-left mb-1`}>Login</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
