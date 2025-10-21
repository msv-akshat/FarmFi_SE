import React, { useEffect, useState } from 'react';
import { fetchDetailedFieldStatusAnalytics } from '../../config/api';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import { CheckCircle, Clock, XCircle, TrendingUp, Loader, ExternalLink } from 'lucide-react';
import { Pie, Bar, Line } from 'react-chartjs-2';

const FieldStatusAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetailedFieldStatusAnalytics()
      .then(res => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen pt-24 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
        <div className="container mx-auto px-4">
          <BackButton />
          <div className="text-center text-gray-500 mt-20">No data available</div>
        </div>
      </div>
    );
  }

  const { statusBreakdown, verificationTimeline, approvalStats, recentChanges, summary } = data;

  // Status breakdown pie chart
  const statusPieData = {
    labels: statusBreakdown.map(s => `${s.status}${s.verified ? ' (Verified)' : ''}`),
    datasets: [{
      data: statusBreakdown.map(s => s.count),
      backgroundColor: [
        '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
      ],
    }]
  };

  // Status count bar chart
  const statusBarData = {
    labels: statusBreakdown.map(s => `${s.status}${s.verified ? ' ✓' : ''}`),
    datasets: [{
      label: 'Field Count',
      data: statusBreakdown.map(s => s.count),
      backgroundColor: statusBreakdown.map(s => 
        s.status === 'approved' ? 'rgba(16, 185, 129, 0.8)' :
        s.status === 'pending' ? 'rgba(245, 158, 11, 0.8)' :
        'rgba(239, 68, 68, 0.8)'
      ),
    }]
  };

  // Verification timeline chart
  const timelineData = {
    labels: verificationTimeline.map(v => new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Created',
        data: verificationTimeline.map(v => v.total_created),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Verified',
        data: verificationTimeline.map(v => v.verified_count),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Approved',
        data: verificationTimeline.map(v => v.approved_count),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      }
    ]
  };

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Field Status Analytics</h1>
            <p className="text-gray-600">Track approval and verification status of your fields</p>
          </div>
          <BackButton />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Fields</span>
              <TrendingUp className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalFields}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Approval Rate</span>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-700">{summary.approvalRate}%</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Verification Rate</span>
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700">{summary.verificationRate}%</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Avg Approval Time</span>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {approvalStats.avg_approval_days ? `${approvalStats.avg_approval_days.toFixed(1)}d` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700 font-semibold">Approved</span>
            </div>
            <div className="text-4xl font-bold text-green-700">{approvalStats.approved || 0}</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl shadow-lg p-6 border border-yellow-200">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-yellow-600" />
              <span className="text-gray-700 font-semibold">Pending</span>
            </div>
            <div className="text-4xl font-bold text-yellow-700">{approvalStats.pending || 0}</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-6 h-6 text-red-600" />
              <span className="text-gray-700 font-semibold">Rejected</span>
            </div>
            <div className="text-4xl font-bold text-red-700">{approvalStats.rejected || 0}</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Status Distribution</h3>
            <div className="h-80 flex items-center justify-center">
              <Pie data={statusPieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Status Breakdown</h3>
            <div className="h-80">
              <Bar data={statusBarData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
            </div>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">30-Day Verification Timeline</h3>
          <div className="h-80">
            <Line data={timelineData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
          </div>
        </div>

        {/* Recent Changes Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Status Changes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50 text-purple-700">
                <tr>
                  <th className="px-4 py-3 text-left">Field Name</th>
                  <th className="px-4 py-3 text-left">Area (ha)</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Last Updated</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentChanges.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{field.field_name}</td>
                    <td className="px-4 py-3 text-gray-600">{parseFloat(field.area).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {field.village}, {field.mandal}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full inline-block ${
                          field.status === 'approved' ? 'bg-green-100 text-green-700' :
                          field.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {field.status}
                        </span>
                        {field.verified && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 inline-block">
                            Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(field.updated_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link 
                        to={`/my-fields/${field.id}`}
                        className="text-teal-600 hover:text-teal-700 flex items-center gap-1 text-sm"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Status Breakdown */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Detailed Status Breakdown</h3>
          {statusBreakdown.map((status, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  {status.status === 'approved' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                   status.status === 'pending' ? <Clock className="w-5 h-5 text-yellow-600" /> :
                   <XCircle className="w-5 h-5 text-red-600" />}
                  {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                  {status.verified && <span className="text-sm text-blue-600">(Verified)</span>}
                </h4>
                <span className="text-2xl font-bold text-gray-700">{status.count} fields</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">Total Area: {status.total_area?.toFixed(2)} ha</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {status.fields.slice(0, 3).map((field) => (
                  <div key={field.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="font-medium text-gray-900 text-sm mb-1">{field.field_name}</div>
                    <div className="text-xs text-gray-600">{field.area} ha • {field.village}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Created: {new Date(field.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
              {status.fields.length > 3 && (
                <div className="text-sm text-gray-500 mt-2">
                  +{status.fields.length - 3} more fields
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FieldStatusAnalytics;
