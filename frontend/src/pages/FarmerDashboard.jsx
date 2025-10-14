import React, { useEffect, useState } from 'react';
import { User, Database, MapPin } from 'lucide-react';
import { fetchFarmerProfile, fetchFarmerFields } from '../config/api';
import { Link } from 'react-router-dom';

const FarmerDashboard = () => {
  const [farmer, setFarmer] = useState(null);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, fieldsRes] = await Promise.all([
          fetchFarmerProfile(),
          fetchFarmerFields()
        ]);
        setFarmer(profileRes.data.data);
        setFields(fieldsRes.data.data);
        setLoading(false);
      } catch {
        setError("Unable to load dashboard data.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      <div className="max-w-6xl mx-auto py-12 px-6">
        {/* Profile / Summary */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8 flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-green-700 flex items-center gap-2">
              <User /> Welcome, {farmer.name}
            </h2>
            <div className="flex gap-8 text-gray-600 text-lg mt-4">
              <span className="flex items-center gap-1"><MapPin className="w-5 h-5" /> Village ID: {farmer.village_id}, Mandal ID: {farmer.mandal_id}</span>
              <span className="flex items-center gap-1"><Database className="w-5 h-5" /> {fields.length} fields</span>
            </div>
          </div>
        </section>

        {/* Dashboard Navigation Links */}
        <div className="flex flex-col md:flex-row gap-8 justify-between my-8">
          <Link to="/my-fields" className="px-10 py-6 flex-1 bg-gradient-to-br from-teal-100 to-green-200 rounded-xl text-center font-bold text-teal-800 shadow hover:scale-105 transition">
            🌾 Manage My Fields
          </Link>
          <Link to="/predictions" className="px-10 py-6 flex-1 bg-gradient-to-br from-blue-100 to-teal-200 rounded-xl text-center font-bold text-blue-800 shadow hover:scale-105 transition">
            📈 Yield Predictions
          </Link>
        </div>

        {/* Add more dashboard widgets/charts here as data grows */}
      </div>
    </div>
  );
};

export default FarmerDashboard;
