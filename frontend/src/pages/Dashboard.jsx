import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Wheat, Camera, TrendingUp, Plus, ArrowRight,
  CheckCircle, Clock, AlertCircle, Leaf, BarChart3
} from 'lucide-react';
import { SeverityPieChart, CropDistributionChart, FieldStatusChart } from '../components/Analytics';
import NavBar from '../components/NavBar';
import { getAuthHeader } from '../utils/auth';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentFields, setRecentFields] = useState([]);
  const [recentCrops, setRecentCrops] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const headers = getAuthHeader();
      
      // Fetch dashboard stats
      const statsRes = await axios.get('/api/farmer/dashboard/stats', { headers });
      setStats(statsRes.data.data); // Extract data from response

      // Fetch recent fields
      const fieldsRes = await axios.get('/api/farmer/fields?limit=3', { headers });
      setRecentFields(fieldsRes.data.data || []); // Extract data from response

      // Fetch recent crops
      const cropsRes = await axios.get('/api/farmer/crops?limit=3', { headers });
      setRecentCrops(cropsRes.data.data || []); // Extract data from response

      // Fetch analytics data
      const analyticsRes = await axios.get('/api/farmer/dashboard/analytics', { headers });
      console.log('Analytics Response:', analyticsRes.data);
      setAnalytics(analyticsRes.data.data); // Extract data from response

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      employee_verified: 'text-blue-600 bg-blue-50 border-blue-200',
      admin_approved: 'text-green-600 bg-green-50 border-green-200',
      rejected: 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      employee_verified: CheckCircle,
      admin_approved: CheckCircle,
      rejected: AlertCircle,
    };
    const Icon = icons[status] || Clock;
    return Icon;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your farming overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Fields */}
          <div className="card hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Fields</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_fields || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>{stats?.approved_fields || 0} approved</span>
            </div>
          </div>

          {/* Total Crops */}
          <div className="card hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Crops</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_crops || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Wheat className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>{stats?.approved_crops || 0} approved</span>
            </div>
          </div>

          {/* Active Crops */}
          <div className="card hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Crops</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.active_crops || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Currently growing</span>
            </div>
          </div>

          {/* Total Predictions */}
          <div className="card hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Disease Checks</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.total_predictions || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>AI predictions</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/fields/new"
              className="card hover:shadow-lg transition-all group cursor-pointer border-2 border-transparent hover:border-primary-500"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Plus className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add New Field</h3>
                  <p className="text-sm text-gray-600">Register a new farming field</p>
                </div>
              </div>
            </Link>

            <Link
              to="/crops/new"
              className="card hover:shadow-lg transition-all group cursor-pointer border-2 border-transparent hover:border-green-500"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add New Crop</h3>
                  <p className="text-sm text-gray-600">Plant a new crop on your field</p>
                </div>
              </div>
            </Link>

            <Link
              to="/detection"
              className="card hover:shadow-lg transition-all group cursor-pointer border-2 border-transparent hover:border-purple-500"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Camera className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Detect Disease</h3>
                  <p className="text-sm text-gray-600">Check crop health with AI</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Analytics Section */}
        {loading ? (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Skeleton loaders for charts */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="card min-h-[400px] flex flex-col animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4 pb-3"></div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="space-y-4 w-full p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-32 bg-gray-200 rounded-full mx-auto w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : analytics && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-primary-600" />
                Farm Analytics
              </h2>
              <Link 
                to="/analytics" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
              >
                View Detailed Analytics
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Disease Severity Distribution */}
              <div className="card min-h-[400px] flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Disease Severity
                </h3>
                <div className="flex-1 flex items-center">
                  <SeverityPieChart data={analytics.severity} />
                </div>
              </div>

              {/* Crop Distribution */}
              <div className="card min-h-[400px] flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Crop Distribution
                </h3>
                <div className="flex-1 flex items-center">
                  <CropDistributionChart data={analytics.cropDistribution} />
                </div>
              </div>

              {/* Field Status */}
              <div className="card min-h-[400px] flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  Field Status
                </h3>
                <div className="flex-1 flex items-center">
                  <FieldStatusChart data={analytics.fieldStatus} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Fields */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Fields</h2>
              <Link to="/fields" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {recentFields.length > 0 ? (
              <div className="space-y-3">
                {recentFields.map((field) => {
                  const StatusIcon = getStatusIcon(field.status);
                  return (
                    <Link
                      key={field.id}
                      to={`/fields/${field.id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{field.field_name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(field.status)}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {field.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{field.mandal_name}, {field.village_name}</span>
                        <span className="mx-2">•</span>
                        <span>{field.area_acres} acres</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No fields added yet</p>
                <Link to="/fields/new" className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">
                  Add your first field
                </Link>
              </div>
            )}
          </div>

          {/* Recent Crops */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Crops</h2>
              <Link to="/crops" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            {recentCrops.length > 0 ? (
              <div className="space-y-3">
                {recentCrops.map((crop) => {
                  const StatusIcon = getStatusIcon(crop.status);
                  return (
                    <Link
                      key={crop.id}
                      to={`/crops/${crop.id}`}
                      className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{crop.crop_name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(crop.status)}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {crop.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Wheat className="w-4 h-4 mr-1" />
                        <span>{crop.season} {crop.crop_year}</span>
                        <span className="mx-2">•</span>
                        <span>{crop.field_name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wheat className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No crops planted yet</p>
                <Link to="/crops/new" className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">
                  Plant your first crop
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
