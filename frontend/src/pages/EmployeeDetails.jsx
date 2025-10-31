import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../config/api';
import Navbar from '../components/NavBar';
import { ArrowLeft, Mail, Calendar, CheckCircle, XCircle, MapPin, Wheat } from 'lucide-react';

export default function EmployeeDetails() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentWork, setRecentWork] = useState({ fields: [], crops: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await api.get(`/admin/employees/${id}`);
      if (response.data.success) {
        const data = response.data.data;
        setEmployee(data);
        setStats(data.stats || {});
        setRecentWork({ fields: data.recent_fields || [], crops: data.recent_crops || [] });
      }
    } catch (error) {
      toast.error('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </>
    );
  }

  if (!employee) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Employee not found</h2>
            <Link to="/admin/employees" className="text-purple-600 hover:underline mt-4 inline-block">
              Back to Employees
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <Link
            to="/admin/employees"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Employees
          </Link>

          {/* Employee Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center mr-6">
                  <span className="text-purple-600 font-bold text-3xl">
                    {employee.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{employee.username}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {employee.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined {new Date(employee.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Performance Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Fields</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_fields || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Submitted</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Verified Fields</p>
              <p className="text-3xl font-bold text-green-600">{stats?.verified_fields || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Employee Verified</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Approved Fields</p>
              <p className="text-3xl font-bold text-purple-600">{stats?.approved_fields || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Admin Approved</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Crops</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_crops || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Uploaded</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-pink-500">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Approved Crops</p>
              <p className="text-3xl font-bold text-pink-600">{stats?.approved_crops || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Admin Approved</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">Field Approval Rate</h3>
              <div className="flex items-end">
                <p className="text-4xl font-bold text-blue-600">
                  {stats?.total_fields > 0 
                    ? Math.round((stats.approved_fields / stats.total_fields) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-blue-700 ml-2 mb-1">
                  {stats?.approved_fields || 0}/{stats?.total_fields || 0}
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-green-900 mb-3">Crop Approval Rate</h3>
              <div className="flex items-end">
                <p className="text-4xl font-bold text-green-600">
                  {stats?.total_crops > 0 
                    ? Math.round((stats.approved_crops / stats.total_crops) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-green-700 ml-2 mb-1">
                  {stats?.approved_crops || 0}/{stats?.total_crops || 0}
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-purple-900 mb-3">Total Work Items</h3>
              <div className="flex items-end">
                <p className="text-4xl font-bold text-purple-600">
                  {(stats?.total_fields || 0) + (stats?.total_crops || 0)}
                </p>
                <p className="text-sm text-purple-700 ml-2 mb-1">Fields + Crops</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Fields */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Fields ({recentWork.fields.length})
                </h3>
              </div>
              <div className="space-y-3">
                {recentWork.fields.length > 0 ? (
                  recentWork.fields.map((field) => (
                    <div
                      key={field.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{field.field_name || `Field #${field.id}`}</p>
                          <p className="text-sm text-gray-600">{field.village_name}, {field.mandal_name}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          field.status === 'admin_approved' ? 'bg-green-100 text-green-800' :
                          field.status === 'employee_verified' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {field.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Area: {field.area} acres</span>
                        <span>{new Date(field.created_at).toLocaleDateString()}</span>
                      </div>
                      {field.farmer_name && (
                        <p className="text-xs text-gray-500 mt-1">Farmer: {field.farmer_name}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent fields</p>
                )}
              </div>
            </div>

            {/* Recent Crops */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Wheat className="w-5 h-5 mr-2 text-green-600" />
                  Recent Crops ({recentWork.crops?.length || 0})
                </h3>
              </div>
              <div className="space-y-3">
                {recentWork.crops && recentWork.crops.length > 0 ? (
                  recentWork.crops.map((crop) => (
                    <div
                      key={crop.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{crop.crop_name}</p>
                          <p className="text-sm text-gray-600">{crop.season} {crop.crop_year || ''}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          crop.status === 'admin_approved' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {crop.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Area: {crop.area} acres</span>
                        <span>{new Date(crop.created_at).toLocaleDateString()}</span>
                      </div>
                      {crop.field_name && (
                        <p className="text-xs text-gray-500 mt-1">Field: {crop.field_name}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent crops</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
