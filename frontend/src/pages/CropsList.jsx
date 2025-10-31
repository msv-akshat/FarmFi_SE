import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Wheat, Plus, Filter, Search, CheckCircle, Clock, AlertCircle, XCircle, Calendar } from 'lucide-react';
import NavBar from '../components/NavBar';
import { getAuthHeader } from '../utils/auth';

export default function CropsList() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    season: '',
    search: ''
  });

  useEffect(() => {
    fetchCrops();
  }, [filters]);

  const fetchCrops = async () => {
    try {
      const headers = getAuthHeader();
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.season) params.append('season', filters.season);
      
      const response = await axios.get(`/api/farmer/crops?${params.toString()}`, { headers });
      
      let cropsData = response.data.data || []; // Extract data from response
      
      if (filters.search) {
        cropsData = cropsData.filter(crop =>
          crop.crop_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          crop.field_name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setCrops(cropsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crops:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, text: 'Pending' },
      employee_verified: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle, text: 'Verified' },
      admin_approved: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle, text: 'Rejected' },
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getSeasonColor = (season) => {
    const colors = {
      'Rabi': 'bg-blue-100 text-blue-700',
      'Kharif': 'bg-green-100 text-green-700',
      'Whole Year': 'bg-purple-100 text-purple-700'
    };
    return colors[season] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Crops</h1>
            <p className="text-gray-600 mt-1">Manage all your planted crops</p>
          </div>
          <Link to="/crops/new" className="mt-4 sm:mt-0 btn-primary inline-flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add New Crop
          </Link>
        </div>

        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Crops
              </label>
              <input
                type="text"
                placeholder="Search by crop or field name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Season
              </label>
              <select
                value={filters.season}
                onChange={(e) => setFilters({ ...filters, season: e.target.value })}
                className="input-field"
              >
                <option value="">All Seasons</option>
                <option value="Rabi">Rabi</option>
                <option value="Kharif">Kharif</option>
                <option value="Whole Year">Whole Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input-field"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="employee_verified">Verified</option>
                <option value="admin_approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading crops...</p>
          </div>
        ) : crops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <Link key={crop.id} to={`/crops/${crop.id}`} className="card hover:shadow-xl transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {crop.crop_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{crop.field_name}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Season:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeasonColor(crop.season)}`}>
                      {crop.season}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium text-gray-900">{crop.crop_year}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Planted:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(crop.planting_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  {getStatusBadge(crop.status)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <Wheat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No crops found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.status || filters.season
                ? 'Try adjusting your filters' 
                : 'Start by planting your first crop'}
            </p>
            {!filters.search && !filters.status && !filters.season && (
              <Link to="/crops/new" className="btn-primary inline-flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Plant Your First Crop
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
