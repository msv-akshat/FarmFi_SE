import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Plus, Filter, Search, CheckCircle, Clock, 
  AlertCircle, XCircle 
} from 'lucide-react';
import NavBar from '../components/NavBar';
import { getAuthHeader } from '../utils/auth';

export default function FieldsList() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchFields();
  }, [filters]);

  const fetchFields = async () => {
    try {
      const headers = getAuthHeader();
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      
      const response = await axios.get(`/api/farmer/fields?${params.toString()}`, { headers });
      
      let fieldsData = response.data.data || []; // Extract data from response
      
      // Client-side search filter
      if (filters.search) {
        fieldsData = fieldsData.filter(field =>
          field.field_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          field.mandal_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          field.village_name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setFields(fieldsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fields:', error);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Fields</h1>
            <p className="text-gray-600 mt-1">Manage all your farming fields</p>
          </div>
          <Link
            to="/fields/new"
            className="mt-4 sm:mt-0 btn-primary inline-flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Field
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Fields
              </label>
              <input
                type="text"
                placeholder="Search by name or location..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Filter by Status
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

        {/* Fields Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fields...</p>
          </div>
        ) : fields.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <Link
                key={field.id}
                to={`/fields/${field.id}`}
                className="card hover:shadow-xl transition-shadow group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {field.field_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {field.mandal_name}, {field.village_name}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-medium text-gray-900">{field.area_acres} acres</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Crops:</span>
                    <span className="font-medium text-gray-900">{field.crop_count || 0} planted</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  {getStatusBadge(field.status)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No fields found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.status 
                ? 'Try adjusting your filters' 
                : 'Start by adding your first field'}
            </p>
            {!filters.search && !filters.status && (
              <Link to="/fields/new" className="btn-primary inline-flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Field
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
