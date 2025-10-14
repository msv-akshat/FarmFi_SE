import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, MapPin, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import logo from '../assets/navlogo.png';
import { endpoints } from '../config/api';

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mandals, setMandals] = useState([]);
    const [villages, setVillages] = useState([]);
    const [loadingMandals, setLoadingMandals] = useState(true);
    const [loadingVillages, setLoadingVillages] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
        mandal_id: '',
        village_id: ''
    });
    const [errors, setErrors] = useState({});

    // Fetch mandals on component mount
    useEffect(() => {
        fetchMandals();
    }, []);

    // Fetch villages when mandal changes
    useEffect(() => {
        if (formData.mandal_id) {
            fetchVillages(formData.mandal_id);
        } else {
            setVillages([]);
        }
    }, [formData.mandal_id]);

    const fetchMandals = async () => {
        try {
            setLoadingMandals(true);
            const response = await fetch(endpoints.mandals);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch mandals');
            }

            setMandals(data.data || []);
        } catch (error) {
            console.error('Error fetching mandals:', error);
            toast.error('Failed to load mandals. Please refresh the page.');
        } finally {
            setLoadingMandals(false);
        }
    };

    const fetchVillages = async (mandalId) => {
        try {
            setLoadingVillages(true);
            const response = await fetch(endpoints.villagesByMandal(mandalId));
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch villages');
            }

            setVillages(data.data || []);
        } catch (error) {
            console.error('Error fetching villages:', error);
            toast.error('Failed to load villages. Please try again.');
        } finally {
            setLoadingVillages(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset village when mandal changes
            ...(name === 'mandal_id' ? { village_id: '' } : {})
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        } else if (formData.name.trim().length > 100) {
            newErrors.name = 'Name must be less than 100 characters';
        }

        // Phone validation (Indian format)
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Mandal validation
        if (!formData.mandal_id) {
            newErrors.mandal_id = 'Please select a mandal';
        }

        // Village validation
        if (!formData.village_id) {
            newErrors.village_id = 'Please select a village';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;
        setIsLoading(true);

        try {
            const registrationData = {
                name: formData.name.trim(),
                phone: formData.phone,
                password: formData.password,
                mandal_id: parseInt(formData.mandal_id),
                village_id: parseInt(formData.village_id)
            };

            const response = await fetch(endpoints.register, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            if (data.success && data.data.token) {
                // Store token and user info in localStorage
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.farmer));
                localStorage.setItem('userType', 'farmer');

                toast.success('Registration successful! Welcome to FarmFi.');
                navigate('/dashboard');
            } else {
                throw new Error('Invalid response format from server');
            }

        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Something went wrong. Please try again.');
            if (error.message?.toLowerCase().includes('phone')) {
                setErrors(prev => ({ ...prev, phone: 'This phone number is already registered' }));
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-2xl">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <img
                            src={logo}
                            alt="FarmFi"
                            className="h-16 w-auto mx-auto mb-4 transition-transform hover:scale-105"
                        />
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Farmer Registration</h1>
                    <p className="text-gray-600">Join FarmFi and start your smart farming journey</p>
                </div>

                {/* Registration Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    maxLength="100"
                                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${errors.name
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-teal-500'
                                        }`}
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit phone number"
                                    maxLength="10"
                                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${errors.phone
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-teal-500'
                                        }`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.phone}
                                </p>
                            )}
                        </div>

                        {/* Mandal Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mandal <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    name="mandal_id"
                                    value={formData.mandal_id}
                                    onChange={handleChange}
                                    disabled={loadingMandals}
                                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors appearance-none bg-white ${errors.mandal_id
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-teal-500'
                                        } ${loadingMandals ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loadingMandals ? (
                                        <option value="">Loading mandals...</option>
                                    ) : (
                                        <>
                                            <option value="">Select Mandal</option>
                                            {mandals.map((mandal) => (
                                                <option key={mandal.id} value={mandal.id}>
                                                    {mandal.name}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>
                            {errors.mandal_id && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.mandal_id}
                                </p>
                            )}
                        </div>

                        {/* Village Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Village <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    name="village_id"
                                    value={formData.village_id}
                                    onChange={handleChange}
                                    disabled={!formData.mandal_id || loadingVillages}
                                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors appearance-none bg-white ${errors.village_id
                                            ? 'border-red-300 focus:border-red-500'
                                            : 'border-gray-200 focus:border-teal-500'
                                        } ${(!formData.mandal_id || loadingVillages) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {!formData.mandal_id ? (
                                        <option value="">Select mandal first</option>
                                    ) : loadingVillages ? (
                                        <option value="">Loading villages...</option>
                                    ) : (
                                        <>
                                            <option value="">Select Village</option>
                                            {villages.map((village) => (
                                                <option key={village.id} value={village.id}>
                                                    {village.name}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>
                            {errors.village_id && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.village_id}
                                </p>
                            )}
                        </div>

                        {/* Password Fields in Grid */}
                        <div className="grid md:grid-cols-2 gap-5">
                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create password"
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
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-colors ${errors.confirmPassword
                                                ? 'border-red-300 focus:border-red-500'
                                                : 'border-gray-200 focus:border-teal-500'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.confirmPassword}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="flex items-start gap-3 p-4 bg-teal-50 rounded-xl border border-teal-200">
                            <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700">
                                By registering, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-3 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Register
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
                                Login here
                            </Link>
                        </p>
                    </div>
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

export default Register;