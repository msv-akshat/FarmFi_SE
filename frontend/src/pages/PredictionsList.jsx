import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { History, Filter, Search, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import NavBar from '../components/NavBar';
import { getAuthHeader } from '../utils/auth';

export default function PredictionsList() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    search: ''
  });

  useEffect(() => {
    fetchPredictions();
  }, [filters]);

  const fetchPredictions = async () => {
    try {
      const headers = getAuthHeader();
      const params = new URLSearchParams();
      
      if (filters.severity) params.append('severity', filters.severity);
      
      const response = await axios.get(`/api/farmer/predictions?${params.toString()}`, { headers });
      
      let predictionsData = response.data.data || []; // Extract data from response
      
      if (filters.search) {
        predictionsData = predictionsData.filter(pred =>
          pred.crop_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          pred.predicted_disease.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setPredictions(predictionsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      low: { color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle, text: 'Low' },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertCircle, text: 'Medium' },
      high: { color: 'bg-red-100 text-red-800 border-red-300', icon: AlertTriangle, text: 'High' },
    };
    
    const badge = badges[severity] || badges.low;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Prediction History</h1>
          <p className="text-gray-600 mt-1">View all disease detection predictions</p>
        </div>

        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search Predictions
              </label>
              <input
                type="text"
                placeholder="Search by crop or disease..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                className="input-field"
              >
                <option value="">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading predictions...</p>
          </div>
        ) : predictions.length > 0 ? (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{prediction.predicted_disease}</h3>
                      {getSeverityBadge(prediction.severity)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Crop: <span className="font-medium">{prediction.crop_name}</span> • 
                      Field: <span className="font-medium">{prediction.field_name}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Detected on {new Date(prediction.created_at).toLocaleDateString()} at {new Date(prediction.created_at).toLocaleTimeString()}
                    </p>
                    {prediction.confidence && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Confidence</span>
                          <span className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${prediction.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  {prediction.image_url && (
                    <img 
                      src={prediction.image_url} 
                      alt="Crop" 
                      className="w-24 h-24 rounded-lg object-cover ml-4"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No predictions found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.severity
                ? 'Try adjusting your filters' 
                : 'Start detecting diseases to see predictions here'}
            </p>
            {!filters.search && !filters.severity && (
              <Link to="/detection" className="btn-primary inline-flex items-center">
                Detect Disease
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
