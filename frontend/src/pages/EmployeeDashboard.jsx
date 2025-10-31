import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FileCheck, Upload, CheckCircle, Clock, XCircle, Users,
  TrendingUp, BarChart3, Activity
} from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import NavBar from '../components/NavBar';
import { getAuthHeader } from '../utils/auth';
import { toast } from '../utils/toast';

// Small helper to format date
const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
};

export default function EmployeeDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingFields, setPendingFields] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [weeklyActivity, setWeeklyActivity] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = getAuthHeader();
      const [statsRes, fieldsRes, uploadsRes] = await Promise.all([
        axios.get('/api/employee/dashboard/stats', { headers }),
        axios.get('/api/employee/fields/pending?limit=6', { headers }),
        axios.get('/api/employee/crops/uploaded?limit=6', { headers })
      ]);

      const statsData = statsRes.data.data;
      setStats(statsData);
      setWeeklyActivity(statsData.weeklyActivity || []);
      setPendingFields(fieldsRes.data.data || fieldsRes.data || []);
      setRecentUploads(uploadsRes.data.data || uploadsRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employee dashboard data:', error);
      setLoading(false);
    }
  };

  const handleVerifyField = async (fieldId, action) => {
    // action: 'verify' or 'reject'
    setActionLoading(true);
    try {
      const headers = getAuthHeader();
      await axios.patch(`/api/employee/fields/${fieldId}/verify`, { action }, { headers });
      // optimistic update
      setPendingFields((prev) => prev.filter(f => f.id !== fieldId));
      // refresh stats and activity data
      const s = await axios.get('/api/employee/dashboard/stats', { headers });
      const statsData = s.data.data;
      setStats(statsData);
      setWeeklyActivity(statsData.weeklyActivity || []);
      
      toast.success(`Field ${action === 'verify' ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      console.error('Error verifying field:', err);
      toast.error('Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const statusData = [
    { name: 'Pending', value: stats?.pending_fields || 0, color: '#f59e0b' },
    { name: 'Verified', value: stats?.verified_fields || 0, color: '#3b82f6' },
    { name: 'Approved', value: stats?.approved_crops || 0, color: '#10b981' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card h-32 bg-gray-200"></div>
              ))}
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage field approvals and upload crop data</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pending Fields */}
          <div className="card hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Fields</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.pending_fields || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/employee/fields/pending" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Review now →
              </Link>
            </div>
          </div>

          {/* Verified Fields */}
          <div className="card hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Verified Fields</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.verified_fields || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Awaiting admin approval</span>
            </div>
          </div>

          {/* Uploaded Crops */}
          <div className="card hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Uploaded Crops</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.uploaded_crops || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/employee/crops/uploaded" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all →
              </Link>
            </div>
          </div>

          {/* Approved Crops */}
          <div className="card hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved Crops</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.approved_crops || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>Admin approved</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Approve Fields */}
            <Link
              to="/employee/fields/pending"
              className="card hover:shadow-lg transition-all group cursor-pointer border-2 border-transparent hover:border-primary-500"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <FileCheck className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Approve Fields</h3>
                  <p className="text-sm text-gray-600">Review pending farmer fields</p>
                </div>
              </div>
            </Link>

            {/* Upload Crops */}
            <Link
              to="/employee/crops/upload"
              className="card hover:shadow-lg transition-all group cursor-pointer border-2 border-transparent hover:border-green-500"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Upload className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Upload Crops</h3>
                  <p className="text-sm text-gray-600">Bulk upload via Excel file</p>
                </div>
              </div>
            </Link>

            {/* View Uploads */}
            <Link
              to="/employee/crops/uploaded"
              className="card hover:shadow-lg transition-all group cursor-pointer border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Track Uploads</h3>
                  <p className="text-sm text-gray-600">View uploaded crop status</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        {/* Two column: Recent Pending Fields + Recent Uploads */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Pending Fields</h3>
                <Link to="/employee/fields/pending" className="text-sm text-primary-600">View all</Link>
              </div>

              {pendingFields.length === 0 ? (
                <p className="text-sm text-gray-500">No pending fields at the moment.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 uppercase">
                        <th className="py-2">Field</th>
                        <th className="py-2">Farmer</th>
                        <th className="py-2">Location</th>
                        <th className="py-2">Area (ha)</th>
                        <th className="py-2">Submitted</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingFields.map((f) => (
                        <tr key={f.id} className="border-b">
                          <td className="py-2">{f.field_name}</td>
                          <td className="py-2">{f.farmer_name || f.farmer || '—'}</td>
                          <td className="py-2">{f.mandal_name || ''} / {f.village_name || ''}</td>
                          <td className="py-2">{f.area}</td>
                          <td className="py-2">{fmtDate(f.created_at || f.created)}</td>
                          <td className="py-2">
                            <div className="flex items-center space-x-2">
                              <button disabled={actionLoading} onClick={() => handleVerifyField(f.id, 'verify')} className="px-2 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                              <button disabled={actionLoading} onClick={() => handleVerifyField(f.id, 'reject')} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs border border-red-100">Reject</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Recent Uploads</h3>
                <Link to="/employee/crops/uploaded" className="text-sm text-primary-600">View all</Link>
              </div>
              {recentUploads.length === 0 ? (
                <p className="text-sm text-gray-500">No recent uploads.</p>
              ) : (
                <ul className="space-y-3">
                  {recentUploads.map((u) => (
                    <li key={u.id} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{u.crop_name || u.file_name || 'Crop'}</p>
                        <p className="text-xs text-gray-500">{u.farmer_name || u.farmer || ''} • {u.season || u.status}</p>
                      </div>
                      <div className="text-xs text-gray-400">{fmtDate(u.created_at || u.submitted_at || u.created)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900">Notes</h4>
              <p className="text-xs text-blue-800 mt-2">Remember: when you approve a field it becomes visible to admins for final approval. Use the Upload page to bulk add crops.</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            {weeklyActivity.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-gray-500 text-sm">
                No activity data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsBar data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="fields" fill="#3b82f6" name="Fields Approved" />
                  <Bar dataKey="crops" fill="#10b981" name="Crops Uploaded" />
                </RechartsBar>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Status Distribution</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {statusData.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}