import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../config/api';
import Navbar from '../components/NavBar';
import { Search, Filter, CheckCircle, XCircle, Eye, MapPin, Wheat } from 'lucide-react';

export default function FieldsCropsManagement() {
  const [view, setView] = useState('fields');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [villageFilter, setVillageFilter] = useState('');
  const [mandalFilter, setMandalFilter] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (view === 'fields') fetchFields();
    else fetchCrops();
  }, [view, statusFilter]);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await api.get(`/admin/fields${params}`);
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch fields');
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await api.get(`/admin/crops${params}`);
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch crops');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, type) => {
    try {
      if (type === 'field') {
        await api.patch(`/admin/fields/${id}/approve`);
        toast.success('Field approved successfully');
        fetchFields();
      } else {
        await api.patch(`/admin/crops/${id}/approve`);
        toast.success('Crop approved successfully');
        fetchCrops();
      }
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      if (selectedItem.type === 'field') {
        await api.patch(`/admin/fields/${selectedItem.id}/reject`, { rejection_reason: rejectionReason });
        toast.success('Field rejected');
        fetchFields();
      } else {
        await api.patch(`/admin/crops/${selectedItem.id}/reject`, { rejection_reason: rejectionReason });
        toast.success('Crop rejected');
        fetchCrops();
      }
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedItem(null);
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = view === 'fields'
      ? (item.survey_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      : (item.crop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesVillage = !villageFilter || item.village?.toLowerCase().includes(villageFilter.toLowerCase());
    const matchesMandal = !mandalFilter || item.mandal?.toLowerCase().includes(mandalFilter.toLowerCase());
    
    return matchesSearch && matchesVillage && matchesMandal;
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Fields & Crops Management</h1>
            <p className="text-gray-600 mt-1">Review and approve farmer submissions</p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setView('fields')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition ${
                view === 'fields'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-5 h-5 mr-2" />
              Fields
            </button>
            <button
              onClick={() => setView('crops')}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition ${
                view === 'crops'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Wheat className="w-5 h-5 mr-2" />
              Crops
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="w-4 h-4 inline mr-1" />
                  Search
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={view === 'fields' ? 'Survey No, Farmer...' : 'Crop, Farmer...'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
                <input
                  type="text"
                  value={villageFilter}
                  onChange={(e) => setVillageFilter(e.target.value)}
                  placeholder="Filter by village"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mandal</label>
                <input
                  type="text"
                  value={mandalFilter}
                  onChange={(e) => setMandalFilter(e.target.value)}
                  placeholder="Filter by mandal"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="employee_verified">Employee Verified</option>
                  <option value="admin_approved">Admin Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No {view} found matching your filters</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {view === 'fields' ? (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Survey No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Season</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      {view === 'fields' ? (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {item.survey_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {item.farmer_name || `ID: ${item.farmer_id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.village}, {item.mandal}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.total_area} acres
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {item.crop_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {item.farmer_name || `ID: ${item.farmer_id}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.village || 'N/A'}, {item.mandal || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.season}
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === 'admin_approved' ? 'bg-green-100 text-green-800' :
                          item.status === 'employee_verified' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={view === 'fields' ? `/admin/fields/${item.id}` : `/admin/crops/${item.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
                          >
                            <Eye className="w-4 h-4 mr-1" /> View
                          </Link>
                          {item.status !== 'admin_approved' && (
                            <>
                              <button
                                onClick={() => handleApprove(item.id, view === 'fields' ? 'field' : 'crop')}
                                className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                              </button>
                              <button
                                onClick={() => { setSelectedItem({ ...item, type: view === 'fields' ? 'field' : 'crop' }); setShowRejectModal(true); }}
                                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition"
                              >
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {showRejectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject {selectedItem?.type}</h2>
                <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows="4"
                  placeholder="Enter rejection reason..."
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleReject}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 font-medium transition"
                  >
                    Confirm Reject
                  </button>
                  <button
                    onClick={() => { setShowRejectModal(false); setRejectionReason(''); setSelectedItem(null); }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2.5 rounded-lg hover:bg-gray-300 font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
