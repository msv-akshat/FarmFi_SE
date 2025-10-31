import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LogOut, Menu, X, Home, Wheat, MapPin, Camera, 
  History, Settings, Bell, User, BarChart3, Upload, Users
} from 'lucide-react';
import { getUser, clearAuth } from '../utils/auth';
import navLogo from '../assets/navlogo.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // Different nav items based on user role
  const getNavItems = () => {
    if (user?.role === 'employee') {
      return [
        { name: 'Dashboard', path: '/employee/dashboard', icon: Home },
        { name: 'Pending Fields', path: '/employee/fields/pending', icon: MapPin },
        { name: 'Upload Crops', path: '/employee/crops/upload', icon: Upload },
        { name: 'Track Uploads', path: '/employee/crops/uploaded', icon: BarChart3 },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];
    } else if (user?.role === 'admin') {
      return [
        { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
        { name: 'Employees', path: '/admin/employees', icon: Users },
        { name: 'Farmers', path: '/admin/farmers', icon: User },
        { name: 'Fields & Crops', path: '/admin/fields', icon: MapPin },
        { name: 'Analytics', path: '/admin/analytics/diseases', icon: BarChart3 },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
      ];
    } else {
      // Farmer nav items (default)
      return [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Fields', path: '/fields', icon: MapPin },
        { name: 'Crops', path: '/crops', icon: Wheat },
        { name: 'Disease Detection', path: '/detection', icon: Camera },
        { name: 'Predictions', path: '/predictions', icon: History },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'Settings', path: '/settings', icon: Settings },
      ];
    }
  };

  const navItems = getNavItems();
  const location = useLocation();

  const isActive = (path) => {
    try {
      return location.pathname === path || location.pathname.startsWith(path + '/');
    } catch (e) {
      return false;
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user?.role === 'employee' ? '/employee/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center space-x-2">
            <img src={navLogo} alt="FarmFi Logo" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.name || user?.username || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.role || ''}{user?.phone ? ` • ${user.phone}` : ''}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-primary-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name || 'Farmer'}</p>
                  <p className="text-sm text-gray-500">{user?.phone}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
