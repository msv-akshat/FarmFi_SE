import React, { useEffect, useState } from 'react';
import BackButton from '../../components/BackButton';
import { fetchPredictionHistory } from '../../config/api';

const Predictions = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictionHistory()
      .then(res => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center">
              📊 Disease Prediction History
            </h1>
            <BackButton />
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading prediction history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Predictions Yet</h3>
              <p className="text-gray-500">Upload your first plant image to get started!</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Field</th>
                      <th className="px-6 py-4 text-left font-semibold">Image</th>
                      <th className="px-6 py-4 text-left font-semibold">Disease</th>
                      <th className="px-6 py-4 text-left font-semibold">Confidence</th>
                      <th className="px-6 py-4 text-left font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, index) => (
                      <tr key={item.image_url + item.detected_at} 
                          className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{item.field_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <img 
                            src={item.image_url} 
                            alt="Plant" 
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {item.disease_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{width: `${item.confidence_score * 100}%`}}
                              ></div>
                            </div>
                            <span className={`font-medium ${getConfidenceColor(item.confidence_score)}`}>
                              {(item.confidence_score * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(item.detected_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {history.map((item) => (
                  <div key={item.image_url + item.detected_at} 
                       className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-4 mb-3">
                      <img 
                        src={item.image_url} 
                        alt="Plant" 
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.field_name}</h3>
                        <p className="text-sm text-gray-600">{formatDate(item.detected_at)}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Disease:</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {item.disease_name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <span className={`font-medium ${getConfidenceColor(item.confidence_score)}`}>
                          {(item.confidence_score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predictions;
