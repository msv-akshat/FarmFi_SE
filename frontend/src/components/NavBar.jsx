import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../assets/navlogo.png';

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="Udhyan Setu" 
              className="h-14 w-auto transition-transform hover:scale-105"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-teal-600 font-medium transition-colors">
              Home
            </Link>
            <a href="#features" className="text-gray-700 hover:text-teal-600 font-medium transition-colors">
              Features
            </a>
            <a href="#about" className="text-gray-700 hover:text-teal-600 font-medium transition-colors">
              About
            </a>
            <Link to="/login" className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all">
              Login
            </Link>
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
            <Link to="/" className="block text-gray-700 hover:text-teal-600 font-medium py-2">
              Home
            </Link>
            <a href="#features" className="block text-gray-700 hover:text-teal-600 font-medium py-2">
              Features
            </a>
            <a href="#about" className="block text-gray-700 hover:text-teal-600 font-medium py-2">
              About
            </a>
            <Link to="/login" className="block w-full px-6 py-2.5 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-full font-semibold text-center">
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;