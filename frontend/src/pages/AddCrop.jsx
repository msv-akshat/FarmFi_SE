import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wheat, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import NavBar from '../components/NavBar';
import { getAuthHeader } from '../utils/auth';

export default function AddCrop() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    field_id: '',
    crop_type_id: '',
    season: '',
    crop_year: new Date().getFullYear().toString(),
    planting_date: '',
    expected_harvest_date: ''
  });
  const [fields, setFields] = useState([]);
  const [cropTypes, setCropTypes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFields();
    fetchCropTypes();
  }, []);

  const fetchFields = async () => {
    try {
      const headers = getAuthHeader();
      const response = await axios.get('/api/farmer/fields', { headers });
      // Only approved fields
      const approvedFields = (response.data.data || []).filter(f => f.status === 'admin_approved');
      setFields(approvedFields);
    } catch (err) {
      console.error('Failed to fetch fields:', err);
    }
  };

  const fetchCropTypes = async () => {
    try {
      const headers = getAuthHeader();
      const response = await axios.get('/api/farmer/crop-types', { headers });
      setCropTypes(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch crop types:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const headers = getAuthHeader();
      
      // Get the selected field and crop type details
      const selectedField = fields.find(f => f.id === parseInt(formData.field_id));
      const selectedCropType = cropTypes.find(ct => ct.id === parseInt(formData.crop_type_id));
      
      if (!selectedField || !selectedCropType) {
        setError('Please select valid field and crop type');
        setLoading(false);
        return;
      }

      const cropData = {
        field_id: parseInt(formData.field_id),
        crop_type_id: parseInt(formData.crop_type_id),
        crop_name: selectedCropType.crop_name,
        area: parseFloat(selectedField.area),
        season: formData.season,
        crop_year: parseInt(formData.crop_year),
        sowing_date: formData.planting_date,
        expected_harvest_date: formData.expected_harvest_date || null
      };

      console.log('Sending crop data:', cropData);
      await axios.post('/api/farmer/crops', cropData, { headers });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/crops');
      }, 2000);
    } catch (err) {
      console.error('Add crop error:', err);
      setError(err.response?.data?.message || 'Failed to add crop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getSeasonInfo = (season) => {
    const info = {
      'Rabi': {
        color: 'text-blue-600 bg-blue-50 border-blue-300',
        desc: 'Winter crop (Oct-Mar). Cannot coexist with Kharif or Whole Year crops.'
      },
      'Kharif': {
        color: 'text-green-600 bg-green-50 border-green-300',
        desc: 'Monsoon crop (Jun-Oct). Cannot coexist with Rabi or Whole Year crops.'
      },
      'Whole Year': {
        color: 'text-purple-600 bg-purple-50 border-purple-300',
        desc: 'Year-round crop. Only one per field per year allowed.'
      }
    };
    return info[season] || { color: '', desc: '' };
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Crop Added Successfully!</h2>
            <p className="text-gray-600 mb-4">Your crop has been registered and is pending verification.</p>
            <p className="text-sm text-gray-500">Redirecting to crops list...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Crop</h1>
          <p className="text-gray-600 mt-1">Plant a new crop on your field</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Field <span className="text-red-500">*</span>
              </label>
              <select
                name="field_id"
                value={formData.field_id}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Choose a field</option>
                {fields.map(field => (
                  <option key={field.id} value={field.id}>
                    {field.field_name} ({field.area_acres} acres - {field.mandal_name}, {field.village_name})
                  </option>
                ))}
              </select>
              {fields.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No approved fields available. Please add and get a field approved first.</p>
              )}
            </div>

            {/* Crop Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Wheat className="w-5 h-5 mr-2 text-primary-600" />
                Crop Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="crop_type_id"
                    value={formData.crop_type_id}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select crop type</option>
                    {cropTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.crop_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Season <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select season</option>
                    <option value="Rabi">Rabi (Winter)</option>
                    <option value="Kharif">Kharif (Monsoon)</option>
                    <option value="Whole Year">Whole Year</option>
                  </select>
                </div>
              </div>

              {/* Season Info */}
              {formData.season && (
                <div className={`p-4 rounded-lg border ${getSeasonInfo(formData.season).color}`}>
                  <p className="text-sm font-medium">
                    {getSeasonInfo(formData.season).desc}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="crop_year"
                    value={formData.crop_year}
                    onChange={handleChange}
                    min="2020"
                    max="2030"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Planting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="planting_date"
                    value={formData.planting_date}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Harvest Date (Optional)
                </label>
                <input
                  type="date"
                  name="expected_harvest_date"
                  value={formData.expected_harvest_date}
                  onChange={handleChange}
                  min={formData.planting_date}
                  className="input-field"
                />
              </div>
            </div>

            {/* Season Rules Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">Season Planting Rules:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Only one crop per season is allowed per field per year</li>
                <li>• You can grow one Rabi AND one Kharif crop in the same field in one year</li>
                <li>• Whole Year crops occupy the field for the entire year (no other crops allowed)</li>
                <li>• Crops will be reviewed by admins before approval</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading || fields.length === 0}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Crop...' : 'Add Crop'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/crops')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
