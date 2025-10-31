import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../config/api';
import Navbar from '../components/NavBar';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Wheat, TrendingUp, AlertTriangle } from 'lucide-react';

export default function FarmerDetails() {
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);
  const [fields, setFields] = useState([]);
  const [crops, setCrops] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFarmerDetails();
  }, [id]);

  const fetchFarmerDetails = async () => {
    try {
      const response = await api.get(`/admin/farmers/${id}`);
      if (response.data.success) {
        const data = response.data.data;
        setFarmer(data);
        setFields(data.fields || []);
        setCrops(data.crops || []);
        setPredictions(data.predictions || []);
      }
    } catch (error) {
      toast.error('Failed to load farmer details');
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

  if (!farmer) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Farmer not found</h2>
            <Link to="/admin/farmers" className="text-purple-600 hover:underline mt-4 inline-block">
              Back to Farmers
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
          <Link to="/admin/farmers" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Farmers
          </Link>

          {/* Farmer Info Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center mr-6">
                  <span className="text-purple-600 font-bold text-3xl">{farmer.name.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{farmer.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {farmer.phone}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {farmer.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {farmer.village}, {farmer.mandal}, {farmer.district}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Joined {new Date(farmer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comprehensive Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Fields</p>
                  <p className="text-3xl font-bold text-gray-900">{fields.length}</p>
                </div>
                <MapPin className="w-10 h-10 text-blue-600 opacity-50" />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <span className="text-green-600 font-medium">
                  {fields.filter(f => f.status === 'admin_approved').length} Approved
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Crops</p>
                  <p className="text-3xl font-bold text-gray-900">{crops.length}</p>
                </div>
                <Wheat className="w-10 h-10 text-green-600 opacity-50" />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <span className="text-green-600 font-medium">
                  {crops.filter(c => c.status === 'admin_approved').length} Approved
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Diseases</p>
                  <p className="text-3xl font-bold text-gray-900">{predictions.length}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-yellow-600 opacity-50" />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                <span className="text-red-600 font-medium">
                  {predictions.filter(p => p.severity === 'high').length} High Severity
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Total Area</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {fields.reduce((sum, f) => sum + parseFloat(f.area || 0), 0).toFixed(2)}
                  </p>
                </div>
                <MapPin className="w-10 h-10 text-purple-600 opacity-50" />
              </div>
              <p className="text-xs text-gray-500 mt-2">acres</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-pink-500">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Crop Area</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {crops.reduce((sum, c) => sum + parseFloat(c.area || 0), 0).toFixed(2)}
                  </p>
                </div>
                <Wheat className="w-10 h-10 text-pink-600 opacity-50" />
              </div>
              <p className="text-xs text-gray-500 mt-2">acres cultivated</p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-4">Fields Status Breakdown</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Approved</span>
                  <span className="text-lg font-bold text-blue-900">
                    {fields.filter(f => f.status === 'admin_approved').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Verified</span>
                  <span className="text-lg font-bold text-blue-900">
                    {fields.filter(f => f.status === 'employee_verified').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-800">Pending</span>
                  <span className="text-lg font-bold text-blue-900">
                    {fields.filter(f => f.status === 'pending').length}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-green-900 mb-4">Crops by Season</h3>
              <div className="space-y-2">
                {['Kharif', 'Rabi', 'Zaid', 'Summer'].map(season => {
                  const count = crops.filter(c => c.season === season).length;
                  return count > 0 ? (
                    <div key={season} className="flex items-center justify-between">
                      <span className="text-sm text-green-800">{season}</span>
                      <span className="text-lg font-bold text-green-900">{count}</span>
                    </div>
                  ) : null;
                })}
                {crops.length === 0 && (
                  <p className="text-sm text-green-700">No crops yet</p>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-yellow-900 mb-4">Disease Severity</h3>
              <div className="space-y-2">
                {['high', 'medium', 'low'].map(severity => {
                  const count = predictions.filter(p => p.severity === severity).length;
                  return (
                    <div key={severity} className="flex items-center justify-between">
                      <span className="text-sm text-yellow-800 capitalize">{severity}</span>
                      <span className={`text-lg font-bold ${
                        severity === 'high' ? 'text-red-600' :
                        severity === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Fields Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-blue-600" />
              All Fields ({fields.length})
            </h2>
            {fields.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Survey No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Soil</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crops</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fields.map((field) => (
                      <tr key={field.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {field.field_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {field.survey_number || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {field.village_name}, {field.mandal_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {field.area} acres
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {field.soil_type || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {field.crop_count || 0} crops
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            field.status === 'admin_approved' ? 'bg-green-100 text-green-800' :
                            field.status === 'employee_verified' ? 'bg-blue-100 text-blue-800' :
                            field.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {field.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link to={`/admin/fields/${field.id}`} className="text-purple-600 hover:text-purple-800 font-medium">
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No fields registered</p>
            )}
          </div>

          {/* Crops Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Wheat className="w-6 h-6 mr-2 text-green-600" />
              All Crops ({crops.length})
            </h2>
            {crops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crops.map((crop) => (
                  <div key={crop.id} className="border-2 border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-green-300 transition">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Wheat className="w-5 h-5 text-green-600 mr-2" />
                        <h3 className="font-bold text-gray-900">{crop.crop_name}</h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        crop.status === 'admin_approved' ? 'bg-green-100 text-green-800' : 
                        crop.status === 'employee_verified' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {crop.status?.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Season:</span>
                        <span className="font-medium text-gray-900">{crop.season}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Area:</span>
                        <span className="font-bold text-green-600">{crop.area} acres</span>
                      </div>
                      {crop.crop_year && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Year:</span>
                          <span className="font-medium text-gray-900">{crop.crop_year}</span>
                        </div>
                      )}
                      {crop.field_name && (
                        <div className="text-sm">
                          <span className="text-gray-600">Field: </span>
                          <span className="font-medium text-gray-900">{crop.field_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <Link 
                        to={`/admin/crops/${crop.id}`} 
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center"
                      >
                        View Full Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No crops registered</p>
            )}
          </div>

          {/* Disease Predictions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-yellow-600" />
              Disease Detection History ({predictions.length})
            </h2>
            {predictions.length > 0 ? (
              <div className="space-y-3">
                {predictions.map((pred) => (
                  <div 
                    key={pred.id} 
                    className={`border-l-4 p-4 rounded-r-lg ${
                      pred.severity === 'high' ? 'border-red-500 bg-red-50' :
                      pred.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                      'border-green-500 bg-green-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900">{pred.predicted_disease}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            pred.severity === 'high' ? 'bg-red-200 text-red-900' :
                            pred.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                            'bg-green-200 text-green-900'
                          }`}>
                            {pred.severity?.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">Crop</p>
                            <p className="text-sm font-medium text-gray-900">{pred.crop_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Field</p>
                            <p className="text-sm font-medium text-gray-900">{pred.field_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Confidence</p>
                            <p className="text-sm font-bold text-blue-600">{pred.confidence}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Detected On</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(pred.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No disease detections yet - Great job! 🌾</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
