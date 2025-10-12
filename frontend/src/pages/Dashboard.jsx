import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, MapPin } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationDetails, setLocationDetails] = useState({ mandal: '', village: '' });

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            const userType = localStorage.getItem('userType');

            if (!token || !userData || !userType) {
                navigate('/login');
                return;
            }

            setUser(JSON.parse(userData));
            fetchLocationDetails(JSON.parse(userData));
        };

        checkAuth();
    }, [navigate]);

    const fetchLocationDetails = async (userData) => {
        if (userData.mandal_id) {
            try {
                // Fetch mandal name
                const mandalResponse = await fetch(`http://localhost:5000/api/mandals`);
                const mandalData = await mandalResponse.json();
                const mandal = mandalData.data.find(m => m.id === userData.mandal_id);

                // Fetch village name
                const villageResponse = await fetch(`http://localhost:5000/api/mandals/${userData.mandal_id}/villages`);
                const villageData = await villageResponse.json();
                const village = villageData.data.find(v => v.id === userData.village_id);

                setLocationDetails({
                    mandal: mandal?.name || 'Unknown Mandal',
                    village: village?.name || 'Unknown Village'
                });
            } catch (error) {
                console.error('Error fetching location details:', error);
            }
        }
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-teal-600">Udhyan Setu</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User Info Card */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-teal-100 rounded-lg">
                            <User className="w-8 h-8 text-teal-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
                            <p className="text-gray-600">Phone: {user?.phone}</p>
                            <div className="flex items-center gap-2 mt-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{locationDetails.village}, {locationDetails.mandal}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Welcome Message */}
                <div className="bg-gradient-to-br from-teal-500 to-green-600 rounded-xl shadow-md p-8 text-white">
                    <h2 className="text-2xl font-bold mb-2">Welcome to Udhyan Setu! 🌱</h2>
                    <p className="text-teal-50">
                        Your smart farming journey begins here. Start exploring our features to manage your agricultural data 
                        and get insights for better farming decisions.
                    </p>
                </div>

                {/* Feature Grid - Placeholder for future features */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Field Management</h3>
                        <p className="text-gray-600">Coming soon...</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Crop Data</h3>
                        <p className="text-gray-600">Coming soon...</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Disease Detection</h3>
                        <p className="text-gray-600">Coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;