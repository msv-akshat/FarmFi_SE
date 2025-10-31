import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, User, Phone, CheckCircle, XCircle, Search, Filter,
  Calendar, ChevronLeft, ChevronRight
} from 'lucide-react';
import NavBar from '../components/NavBar';
import { getAuthHeader } from '../utils/auth';
import { toast } from '../utils/toast';

export default function PendingFields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  
  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Common rejection reasons
  const commonReasons = [
    'Incorrect survey number',
    'Invalid field area',
    'Duplicate field entry',
    'Missing required documents',
    'Boundary issues',
    'Land ownership verification failed',
    'Other'
  ];
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    mandal_id: '',
    village_id: '',
    status: 'pending'
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchLocations();
    fetchFields();
  }, [filters, page]);

  const fetchLocations = async () => {
    try {
      const headers = getAuthHeader();
      const response = await axios.get('/api/auth/locations', { headers });
      setMandals(response.data.mandals || []);
      setVillages(response.data.villages || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchFields = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeader();
      const params = new URLSearchParams({
        ...filters,
        page,
        limit
      });
      
      const response = await axios.get(`/api/employee/fields/pending?${params}`, { headers });
      const data = response.data.data || response.data;
      setFields(Array.isArray(data) ? data : []);
      
      // If response has pagination info
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages || 1);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching fields:', error);
      toast.error('Failed to load pending fields');
      setLoading(false);
    }
  };

  const handleVerifyField = async (fieldId, action, fieldName) => {
    if (action === 'reject') {
      // Open rejection modal
      const field = fields.find(f => f.id === fieldId);
      setSelectedField(field);
      setShowRejectModal(true);
      return;
    }

    if (!confirm(`Are you sure you want to approve the field "${fieldName}"?`)) {
      return;
    }

    setActionLoading(fieldId);
    try {
      const headers = getAuthHeader();
      await axios.patch(`/api/employee/fields/${fieldId}/verify`, { action }, { headers });
      
      toast.success('Field approved successfully');
      
      // Remove from list
      setFields(prev => prev.filter(f => f.id !== fieldId));
    } catch (error) {
      console.error('Error verifying field:', error);
      toast.error('Failed to approve field');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason) {
      toast.error('Please select a rejection reason');
      return;
    }

    setActionLoading(selectedField.id);
    try {
      const headers = getAuthHeader();
      await axios.patch(`/api/employee/fields/${selectedField.id}/verify`, { 
        action: 'reject',
        rejection_reason: rejectionReason
      }, { headers });
      
      toast.success('Field rejected successfully');
      
      // Remove from list
      setFields(prev => prev.filter(f => f.id !== selectedField.id));
      
      // Close modal
      setShowRejectModal(false);
      setSelectedField(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting field:', error);
      toast.error('Failed to reject field');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredVillages = filters.mandal_id 
    ? villages.filter(v => v.mandal_id === parseInt(filters.mandal_id))
    : villages;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pending Fields</h1>
              <p className="text-gray-600 mt-1">Review and approve farmer field registrations</p>
            </div>
            <Link 
              to="/employee/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search farmer or field..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Mandal */}
            <select
              value={filters.mandal_id}
              onChange={(e) => setFilters({ ...filters, mandal_id: e.target.value, village_id: '' })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Mandals</option>
              {mandals.map(m => (
                <option key={m.id} value={m.id}>{m.name || m.mandal_name}</option>
              ))}
            </select>

            {/* Village */}
            <select
              value={filters.village_id}
              onChange={(e) => setFilters({ ...filters, village_id: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              disabled={!filters.mandal_id}
            >
              <option value="">All Villages</option>
              {filteredVillages.map(v => (
                <option key={v.id} value={v.id}>{v.name || v.village_name}</option>
              ))}
            </select>

            {/* Status */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="pending">Pending</option>
              <option value="employee_verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="">All Status</option>
            </select>
          </div>
        </div>

        {/* Fields Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading fields...</p>
            </div>
          ) : fields.length === 0 ? (
            <div className="p-8 text-center">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No pending fields found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area (ha)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Soil Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fields.map((field) => (
                    <tr key={field.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium text-gray-900">{field.field_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start flex-col">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">{field.farmer_name || '—'}</span>
                          </div>
                          {field.farmer_phone && (
                            <div className="flex items-center mt-1">
                              <Phone className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">{field.farmer_phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {field.mandal_name || '—'} / {field.village_name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{field.area}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{field.soil_type || '—'}</td>
                      <td className="px-6 py-4">
                        {field.status === 'employee_verified' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(field.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {field.status === 'employee_verified' ? (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Already Verified
                          </span>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleVerifyField(field.id, 'verify', field.field_name)}
                              disabled={actionLoading === field.id}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleVerifyField(field.id, 'reject', field.field_name)}
                              disabled={actionLoading === field.id}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 text-sm"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Field: {selectedField?.field_name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection *
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select a reason...</option>
                {commonReasons.map((reason, idx) => (
                  <option key={idx} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            {rejectionReason === 'Other' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specify Reason
                </label>
                <textarea
                  value={rejectionReason === 'Other' ? '' : rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  placeholder="Enter the specific reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedField(null);
                  setRejectionReason('');
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading || !rejectionReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Field'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
