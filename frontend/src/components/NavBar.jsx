import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../assets/navlogo.png';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Listen for login status changes
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    window.addEventListener('scroll', handleScroll);

    // Initial check
    setIsLoggedIn(!!localStorage.getItem('token'));

    // Listen to localStorage change and custom event
    const storageListener = () => setIsLoggedIn(!!localStorage.getItem('token'));
    window.addEventListener('storage', storageListener);
    window.addEventListener('authChange', storageListener);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', storageListener);
      window.removeEventListener('authChange', storageListener);
    };
  }, []);

  // Utility to smoothly scroll to landing section (works across routes)
  const scrollToSection = (section) => {
    if (location.pathname !== "/") {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 250); // Wait for route transition and page paint
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
      <button
        type="button"
        onClick={() => scrollToSection("home")}
        className="text-gray-700 hover:text-teal-600 font-medium transition-colors bg-transparent border-0"
      >
        Home
      </button>
      <button
        type="button"
        onClick={() => scrollToSection("features")}
        className="text-gray-700 hover:text-teal-600 font-medium transition-colors bg-transparent border-0"
      >
        Features
      </button>
      <button
        type="button"
        onClick={() => scrollToSection("about")}
        className="text-gray-700 hover:text-teal-600 font-medium transition-colors bg-transparent border-0"
      >
        About
      </button>
      <Link to="/login" className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
        Login
      </Link>
    </>
  );

  const authLinks = (
    <>
      <Link to="/dashboard" className="text-gray-700 hover:text-teal-600 font-medium transition-colors">
        Dashboard
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all"
      >
        Logout
      </button>
    </>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-gradient-to-r from-teal-50 to-green-50 shadow-lg' : 'bg-gradient-to-r from-teal-50/90 to-green-50/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="FarmFi"
              className="h-24 w-auto transition-transform hover:scale-105"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {isLoggedIn ? authLinks : unauthLinks}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-gray-200 pt-4">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="block text-gray-700 hover:text-teal-600 font-medium py-2">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-6 py-2.5 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-full font-semibold text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => scrollToSection("home")}
                  className="block text-gray-700 hover:text-teal-600 font-medium py-2 bg-transparent border-0 w-full text-left"
                >
                  Home
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("features")}
                  className="block text-gray-700 hover:text-teal-600 font-medium py-2 bg-transparent border-0 w-full text-left"
                >
                  Features
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("about")}
                  className="block text-gray-700 hover:text-teal-600 font-medium py-2 bg-transparent border-0 w-full text-left"
                >
                  About
                </button>
                <Link to="/login" className="block w-full px-6 py-2.5 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-full font-semibold text-center">
                  Login
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
