import React, { useEffect, useState } from 'react';
import { Database, BarChart2, TrendingUp } from 'lucide-react';
import { fetchFarmerProfile, fetchFarmerFields } from '../../config/api';

// Import all components
import StatCard from '../../components/dashboard/StatCard';
import ProfileSummary from '../../components/dashboard/ProfileSummary';
import FieldsQuickTable from '../../components/dashboard/FieldsQuickTable';
import QuickActions from '../../components/dashboard/QuickActions';
import InsightsWidget from '../../components/dashboard/InsightsWidget';

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

  // Calculate stats
  const fieldsCount = fields.length;
  const cropTypes = [...new Set(fields.map(f => f.crop_name))].length;
  const pendingFields = fields.filter(f => f.status === 'pending').length;
  const approvedFields = fields.filter(f => f.status === 'approved').length;

  if (loading) return <div className="text-center py-10">Loading dashboard...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      <div className="max-w-7xl mx-auto py-8 px-3 md:px-7">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="My Fields" stat={fieldsCount} icon={<Database className="w-6 h-6 text-green-700" />} />
          <StatCard title="Crop Types" stat={cropTypes} icon={<BarChart2 className="w-6 h-6 text-yellow-600" />} />
          <StatCard title="Pending" stat={pendingFields} icon={<TrendingUp className="w-6 h-6 text-orange-600" />} />
          <StatCard title="Approved" stat={approvedFields} icon={<TrendingUp className="w-6 h-6 text-blue-700" />} />
        </div>

        {/* Main Layout */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <ProfileSummary farmer={farmer} />
            <FieldsQuickTable fields={fields} />
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-8">
            <QuickActions />
            <InsightsWidget fields={fields} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
