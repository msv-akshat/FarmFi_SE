import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import NavBar from '../components/NavBar';
import { getAuthHeader } from '../utils/auth';

export default function AddField() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    field_name: '',
    area_acres: '',
    mandal_id: '',
    village_id: '',
    soil_type: '',
    location_coordinates: ''
  });
  const [locations, setLocations] = useState({ mandals: [], villages: [] });
  const [filteredVillages, setFilteredVillages] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (formData.mandal_id) {
      const filtered = locations.villages.filter(
        v => v.mandal_id === parseInt(formData.mandal_id)
      );
      setFilteredVillages(filtered);
      
      if (formData.village_id) {
        const villageExists = filtered.find(v => v.id === parseInt(formData.village_id));
        if (!villageExists) {
          setFormData(prev => ({ ...prev, village_id: '' }));
        }
      }
    } else {
      setFilteredVillages([]);
      setFormData(prev => ({ ...prev, village_id: '' }));
    }
  }, [formData.mandal_id, locations.villages]);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/auth/locations');
      setLocations(response.data);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const headers = getAuthHeader();
      const fieldData = {
        field_name: formData.field_name,
        area: parseFloat(formData.area_acres),
        mandal_id: parseInt(formData.mandal_id),
        village_id: parseInt(formData.village_id),
        soil_type: formData.soil_type || null,
        survey_number: formData.location_coordinates || null
      };

      await axios.post('/api/farmer/fields', fieldData, { headers });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/fields');
      }, 2000);
    } catch (err) {
      console.error('Add field error:', err);
      setError(err.response?.data?.message || 'Failed to add field. Please try again.');
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Field Added Successfully!</h2>
            <p className="text-gray-600 mb-4">Your field has been registered and is pending verification.</p>
            <p className="text-sm text-gray-500">Redirecting to fields list...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Field</h1>
          <p className="text-gray-600 mt-1">Register a new farming field</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Field Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="field_name"
                    value={formData.field_name}
                    onChange={handleChange}
                    placeholder="e.g., North Field"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area (in acres) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="area_acres"
                    value={formData.area_acres}
                    onChange={handleChange}
                    placeholder="e.g., 2.5"
                    className="input-field"
                    required
                    min="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Soil Type (Optional)
                </label>
                <select
                  name="soil_type"
                  value={formData.soil_type}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select soil type</option>
                  <option value="Clay">Clay</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Loamy">Loamy</option>
                  <option value="Red Soil">Red Soil</option>
                  <option value="Black Soil">Black Soil</option>
                  <option value="Alluvial">Alluvial</option>
                </select>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                Location Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mandal <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="mandal_id"
                    value={formData.mandal_id}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select Mandal</option>
                    {locations.mandals && locations.mandals.map(mandal => (
                      <option key={mandal.id} value={mandal.id}>
                        {mandal.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Village <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="village_id"
                    value={formData.village_id}
                    onChange={handleChange}
                    className="input-field"
                    required
                    disabled={!formData.mandal_id}
                  >
                    <option value="">Select Village</option>
                    {filteredVillages && filteredVillages.map(village => (
                      <option key={village.id} value={village.id}>
                        {village.name}
                      </option>
                    ))}
                  </select>
                  {!formData.mandal_id && (
                    <p className="text-xs text-gray-500 mt-1">Select mandal first</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GPS Coordinates (Optional)
                </label>
                <input
                  type="text"
                  name="location_coordinates"
                  value={formData.location_coordinates}
                  onChange={handleChange}
                  placeholder="e.g., 16.3067, 80.4365"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Format: latitude, longitude</p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your field will be reviewed by our team before approval. 
                You can add crops to this field once it's verified.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding Field...' : 'Add Field'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/fields')}
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
