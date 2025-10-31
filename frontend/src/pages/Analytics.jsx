import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';
import NavBar from '../components/NavBar';
import { getAuthHeader } from '../utils/auth';
import { 
  SeverityPieChart, 
  CropDistributionChart, 
  FieldStatusChart, 
  PredictionsTrendChart, 
  AreaDistributionChart 
} from '../components/Analytics';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const headers = getAuthHeader();
      const response = await axios.get('/api/farmer/dashboard/analytics', { headers });
      console.log('Analytics data:', response.data);
      setAnalytics(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  // Loading skeleton component
  const ChartSkeleton = () => (
    <div className="card min-h-[400px] flex flex-col animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="flex-1 flex items-center justify-center">
        <div className="space-y-4 w-full p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Charts Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
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
          <div className="flex items-center mb-2">
            <BarChart3 className="w-8 h-8 mr-3 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Farm Analytics</h1>
          </div>
          <p className="text-gray-600 ml-11">
            Comprehensive insights and visualizations of your farming operations
          </p>
        </div>

        {analytics ? (
          <div className="space-y-8">
            {/* Disease Analytics Section */}
            <section>
              <div className="flex items-center mb-4">
                <Activity className="w-6 h-6 mr-2 text-red-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Disease Analysis</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Disease Severity */}
                <div className="card min-h-[400px] flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                    Disease Severity Distribution
                  </h3>
                  <div className="flex-1 flex items-center">
                    <SeverityPieChart data={analytics.severity} />
                  </div>
                  <p className="text-sm text-gray-500 mt-4 pt-3 border-t border-gray-100">
                    Breakdown of disease predictions by severity level
                  </p>
                </div>

                {/* Predictions Trend */}
                <div className="card min-h-[400px] flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                    Disease Predictions Trend
                  </h3>
                  <div className="flex-1 flex items-center">
                    <PredictionsTrendChart data={analytics.predictionsTrend} />
                  </div>
                  <p className="text-sm text-gray-500 mt-4 pt-3 border-t border-gray-100">
                    Daily disease prediction counts over the last 30 days
                  </p>
                </div>
              </div>
            </section>

            {/* Field & Crop Analytics Section */}
            <section>
              <div className="flex items-center mb-4">
                <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900">Field & Crop Analysis</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Field Status */}
                <div className="card min-h-[400px] flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                    Field Status Overview
                  </h3>
                  <div className="flex-1 flex items-center">
                    <FieldStatusChart data={analytics.fieldStatus} />
                  </div>
                  <p className="text-sm text-gray-500 mt-4 pt-3 border-t border-gray-100">
                    Current approval status of all your registered fields
                  </p>
                </div>

                {/* Crop Distribution */}
                <div className="card min-h-[400px] flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                    Crop Type Distribution
                  </h3>
                  <div className="flex-1 flex items-center">
                    <CropDistributionChart data={analytics.cropDistribution} />
                  </div>
                  <p className="text-sm text-gray-500 mt-4 pt-3 border-t border-gray-100">
                    Distribution of approved crops across different types
                  </p>
                </div>

                {/* Area Distribution */}
                <div className="card min-h-[400px] flex flex-col lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                    Field Area Distribution
                  </h3>
                  <div className="flex-1 flex items-center">
                    <AreaDistributionChart data={analytics.areaDistribution} />
                  </div>
                  <p className="text-sm text-gray-500 mt-4 pt-3 border-t border-gray-100">
                    Land area (in acres) for each of your approved fields
                  </p>
                </div>
              </div>
            </section>

            {/* Summary Stats */}
            <section className="bg-gradient-to-r from-primary-50 to-green-50 rounded-lg p-6 border border-primary-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <PieChartIcon className="w-6 h-6 mr-2 text-primary-600" />
                Quick Stats Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Total Predictions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {(parseInt(analytics.severity?.high || 0) + 
                      parseInt(analytics.severity?.medium || 0) + 
                      parseInt(analytics.severity?.low || 0))}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Total Fields</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {(parseInt(analytics.fieldStatus?.admin_approved || 0) + 
                      parseInt(analytics.fieldStatus?.employee_verified || 0) + 
                      parseInt(analytics.fieldStatus?.pending || 0))}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Crop Types</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analytics.cropDistribution?.length || 0}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-sm text-gray-600">Total Area</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {analytics.areaDistribution?.reduce((sum, field) => 
                      sum + parseFloat(field.area || 0), 0).toFixed(1)} acres
                  </p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data Available</h3>
            <p className="text-gray-600">
              Start adding fields, crops, and disease predictions to see your farm analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
