import React, { useEffect, useState } from 'react';
import BackButton from '../../components/BackButton';
import { fetchPredictionHistory } from '../../config/api';
import { Calendar, Filter, Search, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const Predictions = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [selectedConfidence, setSelectedConfidence] = useState('all');

  useEffect(() => {
    fetchPredictionHistory()
      .then(res => {
        console.log('📦 Raw API Response:', res.data);
        // Ensure confidence_score is a number
        const processedData = res.data.map(item => ({
          ...item,
          confidence_score: parseFloat(item.confidence_score),
          field_name: item.field_name || 'Unknown Field'
        }));
        console.log('✅ Processed Data:', processedData);
        setHistory(processedData);
        setFilteredHistory(processedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('❌ Error fetching predictions:', error);
        setHistory([]);
        setFilteredHistory([]);
        setLoading(false);
      });
  }, []);

  // Filter history based on search and filters
  useEffect(() => {
    let filtered = [...history];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.disease_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.field_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Field filter
    if (selectedField !== 'all') {
      filtered = filtered.filter(item => item.field_name === selectedField);
    }

    // Confidence filter
    if (selectedConfidence !== 'all') {
      filtered = filtered.filter(item => {
        const confidence = item.confidence_score;
        if (selectedConfidence === 'high') return confidence >= 0.8;
        if (selectedConfidence === 'medium') return confidence >= 0.6 && confidence < 0.8;
        if (selectedConfidence === 'low') return confidence < 0.6;
        return true;
      });
    }

    setFilteredHistory(filtered);
  }, [searchTerm, selectedField, selectedConfidence, history]);

  // Get unique field names for filter
  const uniqueFields = [...new Set(history.map(item => item.field_name))];

  // Group history by date
  const groupByDate = (items) => {
    const grouped = {};
    items.forEach(item => {
      const date = new Date(item.detected_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  const groupedHistory = groupByDate(filteredHistory);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 0.6) return <AlertCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  // Statistics
  const totalPredictions = history.length;
  const uniqueDiseases = new Set(history.map(item => item.disease_name)).size;
  const avgConfidence = history.length > 0
    ? (history.reduce((sum, item) => {
        const conf = parseFloat(item.confidence_score) || 0;
        return sum + conf;
      }, 0) / history.length * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                📊 Disease Detection History
              </h1>
              <p className="text-gray-600 font-medium">Complete history of all disease predictions</p>
            </div>
            <BackButton />
          </div>

          {loading ? (
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-12 text-center border border-blue-200">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading prediction history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-16 text-center border-2 border-dashed border-blue-300">
              <svg className="w-24 h-24 mx-auto mb-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Predictions Yet</h3>
              <p className="text-gray-500 text-lg">Upload your first plant image to get started with disease detection</p>
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600 font-semibold">Total Predictions</span>
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {totalPredictions}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600 font-semibold">Unique Diseases</span>
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {uniqueDiseases}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600 font-semibold">Avg. Confidence</span>
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {avgConfidence}%
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search disease or field..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Field Filter */}
                  <select
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Fields</option>
                    {uniqueFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>

                  {/* Confidence Filter */}
                  <select
                    value={selectedConfidence}
                    onChange={(e) => setSelectedConfidence(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Confidence Levels</option>
                    <option value="high">High (≥80%)</option>
                    <option value="medium">Medium (60-79%)</option>
                    <option value="low">Low (&lt;60%)</option>
                  </select>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  Showing {filteredHistory.length} of {totalPredictions} predictions
                </div>
              </div>

              {/* History grouped by date */}
              <div className="space-y-8">
                {Object.keys(groupedHistory).length === 0 ? (
                  <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <p className="text-gray-500">No predictions match your filters</p>
                  </div>
                ) : (
                  Object.entries(groupedHistory).map(([date, items]) => (
                    <div key={date} className="bg-white rounded-xl shadow-lg overflow-hidden">
                      {/* Date Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          <h3 className="text-lg font-semibold">{date}</h3>
                          <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm">
                            {items.length} {items.length === 1 ? 'prediction' : 'predictions'}
                          </span>
                        </div>
                      </div>

                      {/* Predictions for this date */}
                      <div className="divide-y divide-gray-200">
                        {items.map((item, index) => (
                          <div key={item.image_id + item.detected_at} className="p-6 hover:bg-gray-50 transition">
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Image */}
                              <div className="flex-shrink-0">
                                <img
                                  src={item.image_url}
                                  alt="Plant"
                                  className="w-32 h-32 object-cover rounded-lg shadow-md"
                                />
                              </div>

                              {/* Details */}
                              <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                                  <div>
                                    <h4 className="text-xl font-semibold text-gray-900 mb-1">
                                      {item.disease_name}
                                    </h4>
                                    <p className="text-gray-600">Field: {item.field_name}</p>
                                  </div>
                                  <div className="mt-2 md:mt-0">
                                    <span className="text-sm text-gray-500">{formatTime(item.detected_at)}</span>
                                  </div>
                                </div>

                                {/* Confidence Badge */}
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getConfidenceColor(item.confidence_score)}`}>
                                  {getConfidenceIcon(item.confidence_score)}
                                  <span className="font-semibold">
                                    {getConfidenceLabel(item.confidence_score)}: {(item.confidence_score * 100).toFixed(1)}%
                                  </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          item.confidence_score >= 0.8 ? 'bg-green-600' :
                                          item.confidence_score >= 0.6 ? 'bg-yellow-600' :
                                          'bg-red-600'
                                        }`}
                                        style={{ width: `${item.confidence_score * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>

                                {/* Recommendations if available */}
                                {item.recommendations && (
                                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h5 className="font-semibold text-blue-900 mb-2">Recommendations:</h5>
                                    <p className="text-blue-800 text-sm">{item.recommendations}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predictions;
