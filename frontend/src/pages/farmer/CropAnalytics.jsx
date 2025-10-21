import React, { useEffect, useState } from 'react';
import { fetchDetailedCropAnalytics } from '../../config/api';
import BackButton from '../../components/BackButton';
import { TrendingUp, BarChart3, Calendar, Loader } from 'lucide-react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const CropAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetailedCropAnalytics()
      .then(res => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message || 'Failed to load data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen pt-24 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
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

  const { cropDetails, seasonDistribution, yearlyTrend, summary } = data;

  // Crop distribution pie chart
  const cropPieData = {
    labels: cropDetails.map(c => c.crop_name),
    datasets: [{
      data: cropDetails.map(c => c.total_area),
      backgroundColor: [
        '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
        '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
      ],
    }]
  };

  // Area by crop bar chart
  const areaBarData = {
    labels: cropDetails.map(c => c.crop_name),
    datasets: [{
      label: 'Total Area (ha)',
      data: cropDetails.map(c => c.total_area),
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
    }]
  };

  // Season distribution
  const seasonPieData = {
    labels: seasonDistribution.map(s => s.season),
    datasets: [{
      data: seasonDistribution.map(s => s.total_area),
      backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
    }]
  };

  // Yearly trend line chart
  const yearlyTrendData = {
    labels: yearlyTrend.map(y => y.crop_year),
    datasets: [
      {
        label: 'Total Area (ha)',
        data: yearlyTrend.map(y => y.total_area),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Total Production',
        data: yearlyTrend.map(y => y.total_production),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      }
    ]
  };

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 pb-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Crop Analytics</h1>
            <p className="text-gray-600">Comprehensive crop distribution and performance analysis</p>
          </div>
          <BackButton />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Crops</span>
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalCrops}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Area</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalArea.toFixed(2)} ha</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Total Production</span>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalProduction.toFixed(2)}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Fields</span>
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{summary.totalFields}</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Crop Distribution by Area</h3>
            <div className="h-80 flex items-center justify-center">
              <Pie data={cropPieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Area by Crop Type</h3>
            <div className="h-80">
              <Bar data={areaBarData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
            </div>
          </div>
        </div>

        {/* Season & Trend Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Season Distribution</h3>
            <div className="h-80 flex items-center justify-center">
              <Pie data={seasonPieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Yearly Trend</h3>
            <div className="h-80">
              <Line data={yearlyTrendData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }} />
            </div>
          </div>
        </div>

        {/* Detailed Crop Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Crop Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-teal-50 text-teal-700">
                <tr>
                  <th className="px-4 py-3 text-left">Crop Name</th>
                  <th className="px-4 py-3 text-left">Fields</th>
                  <th className="px-4 py-3 text-left">Total Area (ha)</th>
                  <th className="px-4 py-3 text-left">Avg Area</th>
                  <th className="px-4 py-3 text-left">Production</th>
                  <th className="px-4 py-3 text-left">Avg Yield</th>
                  <th className="px-4 py-3 text-left">Seasons</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cropDetails.map((crop, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{crop.crop_name}</td>
                    <td className="px-4 py-3 text-gray-600">{crop.field_count}</td>
                    <td className="px-4 py-3 text-gray-600">{crop.total_area?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{crop.avg_area_per_field?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{crop.total_production?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{crop.avg_yield?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex gap-1">
                        {crop.kharif_count > 0 && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">K: {crop.kharif_count}</span>}
                        {crop.rabi_count > 0 && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">R: {crop.rabi_count}</span>}
                        {crop.whole_year_count > 0 && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">W: {crop.whole_year_count}</span>}
                      </div>
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

export default CropAnalytics;
