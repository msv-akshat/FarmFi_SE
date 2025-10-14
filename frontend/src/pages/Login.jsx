import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Lock, Eye, EyeOff, ArrowRight, User, Users, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import logo from '../assets/navlogo.png';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('farmer');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '', // phone for farmers, username for employees
    password: ''
  });
  const [errors, setErrors] = useState({});

  const userTypes = [
    { id: 'farmer', label: 'Farmer', icon: <User className="w-5 h-5" /> },
    { id: 'employee', label: 'Employee', icon: <Users className="w-5 h-5" /> },
    { id: 'admin', label: 'Admin', icon: <Shield className="w-5 h-5" /> }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.identifier) {
      newErrors.identifier = userType === 'farmer'
        ? 'Phone number is required'
        : 'Username is required';
    } else if (userType === 'farmer' && !/^[6-9]\d{9}$/.test(formData.identifier)) {
      newErrors.identifier = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          identifier: formData.identifier,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.data.token) {
        // Store token and user info
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('userType', userType);

        window.dispatchEvent(new Event('authChange'));
        toast.success('Login successful!');
        navigate('/dashboard');

      } else {
        throw new Error('Invalid response format from server');
      }

    } catch (error) {
      console.error('Login error:', error);
      toast.error(
        error.message === 'Invalid credentials'
          ? 'Invalid phone number/username or password'
          : 'Login failed. Please try again.'
      );
      setErrors({
        general: error.message === 'Invalid credentials'
          ? 'Invalid phone number/username or password'
          : error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img
              src={logo}
              alt="FarmFi"
              className="h-16 w-auto mx-auto mb-4 transition-transform hover:scale-105"
            />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue to FarmFi</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          {/* User Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Login as
            </label>
            <div className="grid grid-cols-3 gap-3">
              {userTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setUserType(type.id);
                    setFormData(prev => ({ ...prev, identifier: '' }));
                    setErrors({});
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl font-medium transition-all ${userType === type.id
                      ? 'bg-gradient-to-br from-teal-500 to-green-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {type.icon}
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Identifier Field (Phone/Username) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {userType === 'farmer' ? 'Phone Number' : 'Username'}
              </label>
              <div className="relative">
                {userType === 'farmer' ? (
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                ) : (
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  type={userType === 'farmer' ? 'tel' : 'text'}
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                  placeholder={userType === 'farmer' ? 'Enter your phone number' : 'Enter your username'}
                  maxLength={userType === 'farmer' ? "10" : "50"}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${errors.identifier
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-teal-500'
                    }`}
                />
              </div>
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${errors.password
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-teal-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-teal-600 hover:text-teal-700">
                Forgot password?
              </Link>
            </div>

            {/* General Error Message */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 text-center">{errors.general}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Conditional Register Link - Only for Farmers */}
          {userType === 'farmer' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">New Farmer?</span>
                </div>
              </div>

              <Link
                to="/register"
                className="block w-full py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-semibold text-center hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Register as Farmer
              </Link>
            </>
          )}

          {/* Info for Employee/Admin */}
          {userType !== 'farmer' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800 text-center">
                <strong>{userType === 'employee' ? 'Employees' : 'Administrators'}</strong> cannot register. Please contact your administrator for login credentials.
              </p>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-teal-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;