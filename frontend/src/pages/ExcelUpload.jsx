import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Upload, FileSpreadsheet, Download, CheckCircle, XCircle,
  AlertCircle, Loader, Plus
} from 'lucide-react';
import NavBar from '../components/NavBar';
import { getAuthHeader } from '../utils/auth';
import { toast } from '../utils/toast';

export default function ExcelUpload() {
  const [activeTab, setActiveTab] = useState('excel'); // 'excel' or 'form'
  
  // Excel upload state
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [preview, setPreview] = useState(null);

  // Form upload state
  const [formData, setFormData] = useState({
    farmer_phone: '',
    field_id: '',
    crop_name: '',
    area: '',
    season: 'Kharif',
    crop_year: new Date().getFullYear(),
    sowing_date: '',
    expected_harvest_date: ''
  });
  const [farmers, setFarmers] = useState([]);
  const [fields, setFields] = useState([]);
  const [cropTypes, setCropTypes] = useState([]);
  const [landInfo, setLandInfo] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'form') {
      fetchCropTypes();
    }
  }, [activeTab]);

  useEffect(() => {
    if (formData.farmer_phone && formData.farmer_phone.length === 10) {
      fetchFarmerFields(formData.farmer_phone);
    }
  }, [formData.farmer_phone]);

  useEffect(() => {
    if (formData.field_id) {
      fetchFieldLandInfo(formData.field_id);
    }
  }, [formData.field_id]);

  const fetchCropTypes = async () => {
    try {
      const headers = getAuthHeader();
      const response = await axios.get('/api/employee/crop-types', { headers });
      setCropTypes(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching crop types:', error);
    }
  };

  const fetchFarmerFields = async (phone) => {
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`/api/employee/farmers/${phone}/fields`, { headers });
      setFields(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching fields:', error);
      setFields([]);
    }
  };

  const fetchFieldLandInfo = async (fieldId) => {
    try {
      const headers = getAuthHeader();
      const response = await axios.get(`/api/employee/fields/${fieldId}/land-info`, { headers });
      setLandInfo(response.data.data);
    } catch (error) {
      console.error('Error fetching land info:', error);
      setLandInfo(null);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);
    setResults(null);
    
    // Optional: Parse and preview (would need xlsx library on frontend)
    // For now, just show file info
    setPreview({
      name: selectedFile.name,
      size: (selectedFile.size / 1024).toFixed(2) + ' KB',
      type: selectedFile.type
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    setResults(null);

    try {
      const headers = getAuthHeader();
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await axios.post('/api/employee/crops/upload-excel', formDataObj, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = response.data.results || response.data.data || response.data;
      setResults(data);
      
      if (data.success > 0 || data.success_count > 0) {
        toast.success(`Successfully uploaded ${data.success || data.success_count} crops!`);
      }
      if (data.failed > 0 || data.failed_count > 0) {
        toast.warning(`${data.failed || data.failed_count} rows failed - check errors below`);
      }
      
      // Clear file input
      setFile(null);
      setPreview(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.farmer_phone || !formData.field_id || !formData.crop_name || !formData.area) {
      toast.error('Please fill all required fields');
      return;
    }

    setFormLoading(true);
    try {
      const headers = getAuthHeader();
      const response = await axios.post('/api/employee/crops/upload-form', formData, { headers });
      
      toast.success(response.data.message || 'Crop added successfully');
      
      // Show land info update
      if (response.data.land_info) {
        const info = response.data.land_info;
        toast.success(`Land utilization: ${info.occupied_after.toFixed(2)}/${info.field_area} acres used. ${info.remaining_after.toFixed(2)} acres remaining.`);
      }
      
      // Reset form
      setFormData({
        farmer_phone: '',
        field_id: '',
        crop_name: '',
        area: '',
        season: 'Kharif',
        crop_year: new Date().getFullYear(),
        sowing_date: '',
        expected_harvest_date: ''
      });
      setLandInfo(null);
      setFields([]);
    } catch (error) {
      console.error('Form upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to add crop');
    } finally {
      setFormLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV template
    const headers = [
      'farmer_name', 'farmer_phone', 'field_name', 'crop_name', 'area',
      'season', 'crop_year', 'village_name', 'mandal_name', 'soil_type'
    ];
    const sampleRow = [
      'John Doe', '9876543210', 'North Field', 'Rice', '5.5',
      'kharif', '2025', 'Sample Village', 'Sample Mandal', 'loamy'
    ];
    
    const csvContent = [
      headers.join(','),
      sampleRow.join(','),
      // Empty row for user to fill
      ',,,,,,,,'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crop_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Template downloaded');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Upload Crops</h1>
              <p className="text-gray-600 mt-1">Add crop data via Excel or form</p>
            </div>
            <Link 
              to="/employee/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('excel')}
              className={`${
                activeTab === 'excel'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel Upload (Bulk)</span>
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`${
                activeTab === 'form'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <Plus className="w-4 h-4" />
              <span>Simple Form (Single)</span>
            </button>
          </nav>
        </div>

        {/* Excel Upload Tab */}
        {activeTab === 'excel' && (
          <>
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Upload Instructions</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Download the template below and fill in crop data</li>
                <li>• Required columns: farmer_name, farmer_phone, field_name, crop_name, area, season, crop_year, village_name, mandal_name</li>
                <li>• If farmer doesn't exist, a new account will be created with password: <strong>test123</strong></li>
                <li>• Fields will be created automatically if they don't exist</li>
                <li>• Supported file formats: .xlsx, .xls</li>
              </ul>
            </div>

        {/* Template Download */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Download Template</h3>
              <p className="text-sm text-gray-600">Get the Excel template with sample data</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Upload Excel File</h3>
          
          {/* File Input */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                {preview ? preview.name : 'Click to select Excel file or drag and drop'}
              </p>
              <p className="text-xs text-gray-500">
                {preview ? `${preview.size} • ${preview.type}` : 'XLSX or XLS (Max 5MB)'}
              </p>
            </label>
          </div>

          {/* Upload Button */}
          {file && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload & Process</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Upload Results */}
        {results && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Upload Results</h3>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{results.total_rows || 0}</p>
                <p className="text-sm text-blue-900">Total Rows</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{results.success_count || 0}</p>
                <p className="text-sm text-green-900">Successful</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{results.failed_count || 0}</p>
                <p className="text-sm text-red-900">Failed</p>
              </div>
            </div>

            {/* Progress Bar */}
            {results.total_rows > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Success Rate</span>
                  <span>{((results.success_count / results.total_rows) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(results.success_count / results.total_rows) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Errors */}
            {results.errors && results.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  Errors ({results.errors.length})
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {results.errors.map((error, idx) => (
                    <div key={idx} className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-sm font-medium text-red-900">Row {error.row}</p>
                      <p className="text-xs text-red-700 mt-1">{error.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            {results.failed_count === 0 && results.success_count > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Upload Successful!</p>
                  <p className="text-sm text-green-700 mt-1">
                    All {results.success_count} crops have been uploaded and are pending admin approval.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
          </>
        )}

        {/* Simple Form Tab */}
        {activeTab === 'form' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add Single Crop</h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Farmer Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Farmer Phone Number *
                </label>
                <input
                  type="text"
                  value={formData.farmer_phone}
                  onChange={(e) => setFormData({...formData, farmer_phone: e.target.value})}
                  placeholder="10-digit phone number"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              {/* Field Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Field *
                </label>
                <select
                  value={formData.field_id}
                  onChange={(e) => setFormData({...formData, field_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                  disabled={fields.length === 0}
                >
                  <option value="">
                    {fields.length === 0 ? 'Enter farmer phone first' : 'Select a field...'}
                  </option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.field_name} - {field.area} acres ({field.village_name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Land Info Display */}
              {landInfo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Land Utilization</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-green-700">Total Area:</p>
                      <p className="font-semibold text-green-900">{landInfo.total_area} acres</p>
                    </div>
                    <div>
                      <p className="text-green-700">Occupied:</p>
                      <p className="font-semibold text-green-900">{landInfo.occupied_area.toFixed(2)} acres</p>
                    </div>
                    <div>
                      <p className="text-green-700">Available:</p>
                      <p className="font-semibold text-green-900">{landInfo.remaining_area.toFixed(2)} acres</p>
                    </div>
                    <div>
                      <p className="text-green-700">Utilization:</p>
                      <p className="font-semibold text-green-900">{landInfo.utilization_percentage}%</p>
                    </div>
                  </div>
                  {landInfo.active_crops && landInfo.active_crops.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs font-medium text-green-900 mb-1">Active Crops:</p>
                      {landInfo.active_crops.map((crop) => (
                        <p key={crop.id} className="text-xs text-green-700">
                          • {crop.crop_name}: {crop.area} acres ({crop.season} {crop.crop_year})
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Crop Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Type *
                </label>
                <select
                  value={formData.crop_name}
                  onChange={(e) => setFormData({...formData, crop_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select crop type...</option>
                  {cropTypes.map((crop) => (
                    <option key={crop.id} value={crop.crop_name}>
                      {crop.crop_name} ({crop.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area (acres) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  placeholder="e.g., 2.5"
                  max={landInfo?.remaining_area || undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
                {landInfo && formData.area && parseFloat(formData.area) > landInfo.remaining_area && (
                  <p className="text-xs text-red-600 mt-1">
                    Exceeds available land ({landInfo.remaining_area.toFixed(2)} acres)
                  </p>
                )}
              </div>

              {/* Season and Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Season *
                  </label>
                  <select
                    value={formData.season}
                    onChange={(e) => setFormData({...formData, season: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="Kharif">Kharif</option>
                    <option value="Rabi">Rabi</option>
                    <option value="Zaid">Zaid</option>
                    <option value="Whole Year">Whole Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Year *
                  </label>
                  <input
                    type="number"
                    value={formData.crop_year}
                    onChange={(e) => setFormData({...formData, crop_year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sowing Date
                  </label>
                  <input
                    type="date"
                    value={formData.sowing_date}
                    onChange={(e) => setFormData({...formData, sowing_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    value={formData.expected_harvest_date}
                    onChange={(e) => setFormData({...formData, expected_harvest_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      farmer_phone: '',
                      field_id: '',
                      crop_name: '',
                      area: '',
                      season: 'Kharif',
                      crop_year: new Date().getFullYear(),
                      sowing_date: '',
                      expected_harvest_date: ''
                    });
                    setLandInfo(null);
                    setFields([]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Crop</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
