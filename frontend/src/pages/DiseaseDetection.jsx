import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Upload, Image as ImageIcon, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import NavBar from '../components/NavBar';
import { getAuthHeader } from '../utils/auth';

export default function DiseaseDetection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({
    field_id: '',
    crop_id: '',
    image: null
  });
  const [crops, setCrops] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadFields();
  }, []);

  useEffect(() => {
    if (formData.field_id) {
      loadCurrentCrops(formData.field_id);
    } else {
      setCrops([]);
      setFormData(prev => ({ ...prev, crop_id: '' }));
    }
  }, [formData.field_id]);

  const loadFields = async () => {
    try {
      const headers = getAuthHeader();
      const res = await axios.get('/api/farmer/fields', { headers });
      // Only approved fields
      const approvedFields = (res.data.data || []).filter(f => f.status === 'admin_approved');
      setFields(approvedFields);
    } catch (error) {
      console.error('Failed to load fields:', error);
    }
  };

  const loadCurrentCrops = async (fieldId) => {
    try {
      const headers = getAuthHeader();
      const res = await axios.get(`/api/farmer/fields/${fieldId}/current-crops`, { headers });
      setCrops(res.data.data || []);
    } catch (error) {
      console.error('Failed to load crops:', error);
      setCrops([]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPrediction(null);
    
    if (!formData.image) {
      setError('Please select an image to upload');
      return;
    }

    const data = new FormData();
    data.append('field_id', formData.field_id);
    data.append('crop_id', formData.crop_id);
    data.append('image', formData.image);

    setLoading(true);
    
    try {
      const headers = getAuthHeader();
      const res = await axios.post('/api/farmer/predictions', data, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.success) {
        setPrediction(res.data.prediction);
        setSuccess('Disease analysis completed successfully!');
        
        // Scroll to results
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[severity] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Disease Detection</h1>
          <p className="text-gray-600 mt-1">Upload crop images for AI-powered disease analysis</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Upload Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Field <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.field_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, field_id: e.target.value, crop_id: '' }))}
                  className="input-field"
                  required
                >
                  <option value="">Choose a field</option>
                  {fields.map(field => (
                    <option key={field.id} value={field.id}>
                      {field.field_name} ({field.mandal_name}, {field.village_name})
                    </option>
                  ))}
                </select>
                {fields.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No approved fields available</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Current Crop <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.crop_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, crop_id: e.target.value }))}
                  className="input-field"
                  required
                  disabled={!formData.field_id}
                >
                  <option value="">Choose a crop</option>
                  {crops.map(crop => (
                    <option key={crop.id} value={crop.id}>
                      {crop.crop_name} ({crop.season} {crop.crop_year})
                    </option>
                  ))}
                </select>
                {!formData.field_id && (
                  <p className="text-xs text-gray-500 mt-1">Select field first</p>
                )}
                {formData.field_id && crops.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No approved crops growing currently</p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Crop Image <span className="text-red-500">*</span>
              </label>
              
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-gray-400 mb-4" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> For best results, take a clear photo of the affected leaf or plant part. 
                Ensure good lighting and focus on the diseased area.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.field_id || !formData.crop_id || !formData.image}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Analyze Image
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results */}
        {prediction && (
          <div id="results" className="card mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Analysis Results</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Prediction Details */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Disease Detected</label>
                  <p className="text-xl font-bold text-gray-900 mt-1">{prediction.disease_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Confidence Level</label>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl font-bold text-primary-600">
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-primary-600 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${prediction.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Severity Level</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(prediction.severity)}`}>
                      {prediction.severity.charAt(0).toUpperCase() + prediction.severity.slice(1)}
                    </span>
                  </div>
                </div>

                {prediction.recommendations && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Recommendations</label>
                    <p className="text-gray-900 mt-1">{prediction.recommendations}</p>
                  </div>
                )}
              </div>

              {/* Uploaded Image */}
              {imagePreview && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Analyzed Image</label>
                  <img 
                    src={imagePreview} 
                    alt="Analyzed crop" 
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => {
                  setPrediction(null);
                  setImagePreview(null);
                  setFormData({ field_id: '', crop_id: '', image: null });
                  setSuccess('');
                }}
                className="btn-secondary"
              >
                Analyze Another Image
              </button>
              <button
                onClick={() => navigate('/predictions')}
                className="btn-primary"
              >
                View All Predictions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
