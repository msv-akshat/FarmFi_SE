import React, { useEffect, useState } from 'react';
import { fetchDetailedFieldAreaAnalytics } from '../../config/api';
import { Link } from 'react-router-dom';
import BackButton from '../../components/BackButton';
import { Map, TrendingUp, BarChart3, Loader, ExternalLink } from 'lucide-react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

const FieldAreaAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Fetching field area analytics...');
    fetchDetailedFieldAreaAnalytics()
      .then(res => {
        console.log('Field area analytics response:', res);
        console.log('Data:', res.data.data);
        setData(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching field area analytics:', err);
        console.error('Error response:', err.response);
        setError(err.response?.data?.message || err.message || 'Failed to load data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen pt-24 bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
        <div className="container mx-auto px-4">
          <BackButton />
          <div className="text-center text-gray-500 mt-20">
            {error ? (
              <div>
                <div className="text-red-600 font-semibold mb-2">Error loading data</div>
                <div className="text-sm text-gray-600">{error}</div>
              </div>
            ) : (
              <div>No data available</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { fieldDetails, areaByLocation, sizeCategories, summary } = data;

  // Field size distribution chart
  const sizeChart = {
    labels: sizeCategories.map(s => s.size_category),
    datasets: [{
      label: 'Number of Fields',
      data: sizeCategories.map(s => s.count),
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
    }]
  };

  // Area by location chart
  const locationChart = {
    labels: areaByLocation.map(l => l.mandal),
    datasets: [{
      label: 'Total Area (ha)',
      data: areaByLocation.map(l => l.total_area),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    }]
  };

  // Size category pie
  const sizePieData = {
    labels: sizeCategories.map(s => s.size_category),
    datasets: [{
      data: sizeCategories.map(s => s.total_area),
      backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
    }]
  };

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Field Area Analytics</h1>
            <p className="text-gray-600">Detailed breakdown of field sizes and distribution</p>
          </div>
          <BackButton />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Fields</span>
              <Map className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalFields}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Area</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalArea.toFixed(2)} ha</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Average Area</span>
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.averageArea.toFixed(2)} ha</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Verified</span>
              <BarChart3 className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.verifiedFields}</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Field Size Distribution</h3>
            <div className="h-80">
              <Bar data={sizeChart} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Area by Size Category</h3>
            <div className="h-80 flex items-center justify-center">
              <Doughnut data={sizePieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        {/* Location Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Area by Location</h3>
          <div className="h-80">
            <Bar data={locationChart} options={{ maintainAspectRatio: false, indexAxis: 'y', scales: { x: { beginAtZero: true } } }} />
          </div>
        </div>

        {/* Location Details Table */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Location Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50 text-blue-700">
                <tr>
                  <th className="px-4 py-3 text-left">Mandal</th>
                  <th className="px-4 py-3 text-left">Field Count</th>
                  <th className="px-4 py-3 text-left">Total Area (ha)</th>
                  <th className="px-4 py-3 text-left">Average Area (ha)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {areaByLocation.map((loc, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{loc.mandal}</td>
                    <td className="px-4 py-3 text-gray-600">{loc.field_count}</td>
                    <td className="px-4 py-3 text-gray-600">{loc.total_area?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{loc.avg_area?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Fields Detailed Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">All Fields</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-teal-50 text-teal-700">
                <tr>
                  <th className="px-4 py-3 text-left">Field Name</th>
                  <th className="px-4 py-3 text-left">Area (ha)</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Crops</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fieldDetails.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{field.field_name}</td>
                    <td className="px-4 py-3 text-gray-600">{parseFloat(field.area).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600 text-sm">
                      {field.village_name}, {field.mandal_name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{field.crop_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full inline-block ${
                          field.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          field.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {field.status}
                        </span>
                        {field.verified && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 inline-block">
                            Verified
                          </span>
                        )}
                      </div>
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
      </div>
    </div>
  );
};

export default FieldAreaAnalytics;
