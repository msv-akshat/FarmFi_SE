import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../config/api';
import Navbar from '../components/NavBar';
import { ArrowLeft, Wheat, User, Calendar, CheckCircle, XCircle, MapPin, TrendingUp, Droplet, Sun, AlertCircle } from 'lucide-react';

export default function CropDetails() {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCropDetails();
  }, [id]);

  const fetchCropDetails = async () => {
    try {
      const response = await api.get(`/admin/crops/${id}`);
      if (response.data.success) {
        setCrop(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load crop details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.patch(`/admin/crops/${id}/approve`);
      toast.success('Crop approved successfully');
      fetchCropDetails();
    } catch (error) {
      toast.error('Failed to approve crop');
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

  if (!crop) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Crop not found</h2>
            <Link to="/admin/fields" className="text-purple-600 hover:underline mt-4 inline-block">
              Back to Crops Management
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
        <div className="max-w-5xl mx-auto">
          <Link to="/admin/fields" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Crops Management
          </Link>

          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Wheat className="w-10 h-10 text-green-600" />
                  <h1 className="text-3xl font-bold text-gray-900">{crop.crop_name}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    crop.status === 'admin_approved' ? 'bg-green-100 text-green-800' :
                    crop.status === 'employee_verified' ? 'bg-blue-100 text-blue-800' :
                    crop.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {crop.status?.replace('_', ' ').toUpperCase()}
                  </span>
                  {crop.status !== 'admin_approved' && (
                    <button
                      onClick={handleApprove}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Crop
                    </button>
                  )}
                </div>
              </div>
            </div>

            {crop.rejection_reason && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-center mb-2">
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="font-semibold text-red-900">Rejection Reason</p>
                </div>
                <p className="text-red-700">{crop.rejection_reason}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Farmer</h3>
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{crop.farmer_name || 'N/A'}</p>
                    {crop.farmer_id && (
                      <Link
                        to={`/admin/farmers/${crop.farmer_id}`}
                        className="text-purple-600 hover:text-purple-800 text-sm"
                      >
                        View Profile →
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Field</h3>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">{crop.field_survey_number || `ID: ${crop.field_id}`}</p>
                    {crop.field_id && (
                      <Link
                        to={`/admin/fields/${crop.field_id}`}
                        className="text-purple-600 hover:text-purple-800 text-sm"
                      >
                        View Field →
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Created On</h3>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <p className="font-medium text-gray-900">
                    {new Date(crop.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Crop Details */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comprehensive Crop Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-green-50 rounded-lg p-5 border-l-4 border-green-500">
                <div className="flex items-center mb-2">
                  <Sun className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-sm font-medium text-gray-600">Season</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{crop.season}</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-5 border-l-4 border-blue-500">
                <div className="flex items-center mb-2">
                  <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-sm font-medium text-gray-600">Area Under Cultivation</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{crop.area} 
                  <span className="text-lg text-gray-600 ml-1">acres</span>
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-5 border-l-4 border-purple-500">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                  <p className="text-sm font-medium text-gray-600">Crop Year</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{crop.crop_year || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                {crop.sowing_date && (
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Sowing Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(crop.sowing_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {crop.expected_harvest_date && (
                  <div className="flex items-start">
                    <Wheat className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Expected Harvest</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(crop.expected_harvest_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {crop.variety && (
                  <div className="flex items-start">
                    <Wheat className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Variety</p>
                      <p className="font-semibold text-gray-900">{crop.variety}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {crop.village_name && crop.mandal_name && (
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Location</p>
                      <p className="font-semibold text-gray-900">{crop.village_name}, {crop.mandal_name}</p>
                    </div>
                  </div>
                )}

                {crop.uploaded_by && (
                  <div className="flex items-start">
                    <User className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Uploaded By</p>
                      <p className="font-semibold text-gray-900">Employee ID: {crop.uploaded_by}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Created On</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(crop.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Disease Predictions */}
          {crop.predictions && crop.predictions.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <AlertCircle className="w-6 h-6 mr-2 text-red-600" />
                Disease Detections & Analysis ({crop.predictions.length})
              </h2>
              <div className="space-y-4">
                {crop.predictions.map((pred, index) => (
                  <div 
                    key={pred.id} 
                    className={`border-l-4 p-5 rounded-r-lg ${
                      pred.severity === 'high' ? 'border-red-500 bg-red-50' :
                      pred.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-green-500 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          pred.severity === 'high' ? 'bg-red-200' :
                          pred.severity === 'medium' ? 'bg-yellow-200' :
                          'bg-green-200'
                        }`}>
                          <AlertCircle className={`w-6 h-6 ${
                            pred.severity === 'high' ? 'text-red-700' :
                            pred.severity === 'medium' ? 'text-yellow-700' :
                            'text-green-700'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{pred.disease_name}</h3>
                          <p className="text-sm text-gray-600">Detection #{index + 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          pred.severity === 'high' ? 'bg-red-200 text-red-900' :
                          pred.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                          'bg-green-200 text-green-900'
                        }`}>
                          {pred.severity?.toUpperCase()} SEVERITY
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(pred.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Confidence Level</p>
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${pred.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-blue-600">{pred.confidence}%</span>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Disease Type</p>
                        <p className="font-semibold text-gray-900">{pred.disease_name}</p>
                      </div>
                      
                      <div className="bg-white rounded-lg p-3 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Risk Level</p>
                        <p className={`font-semibold ${
                          pred.severity === 'high' ? 'text-red-600' :
                          pred.severity === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {pred.severity === 'high' ? '⚠️ Critical' :
                           pred.severity === 'medium' ? '⚡ Moderate' :
                           '✓ Low'}
                        </p>
                      </div>
                    </div>

                    {pred.treatment && (
                      <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <Droplet className="w-4 h-4 mr-2 text-blue-600" />
                          Recommended Treatment:
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">{pred.treatment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Detections</p>
                  <p className="text-2xl font-bold text-gray-900">{crop.predictions.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">High Severity</p>
                  <p className="text-2xl font-bold text-red-600">
                    {crop.predictions.filter(p => p.severity === 'high').length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Average Confidence</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(crop.predictions.reduce((sum, p) => sum + p.confidence, 0) / crop.predictions.length)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
