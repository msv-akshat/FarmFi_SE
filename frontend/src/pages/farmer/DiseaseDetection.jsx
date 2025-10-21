import React, { useEffect, useState } from 'react';
import BackButton from '../../components/BackButton';
import { fetchVerifiedFields, uploadImageAndPredict, fetchCropData } from '../../config/api';
import { Leaf, MapPin } from 'lucide-react';

const DiseaseDetection = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [fieldCrops, setFieldCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCrops, setLoadingCrops] = useState(false);

  useEffect(() => {
    fetchVerifiedFields()
      .then(res => setFields(res.data))
      .catch(() => setFields([]));
  }, []);

  useEffect(() => {
    if (selectedField) {
      setLoadingCrops(true);
      fetchCropData()
        .then(res => {
          const cropsArray = res.data.data || res.data;
          const currentYear = new Date().getFullYear();
          const cropsForField = cropsArray.filter(crop => {
            return crop.field_id === parseInt(selectedField) && crop.verified === true && crop.crop_year === currentYear;
          });
          setFieldCrops(cropsForField);
          setLoadingCrops(false);
          setSelectedCrop('');
        })
        .catch(() => {
          setFieldCrops([]);
          setLoadingCrops(false);
        });
    } else {
      setFieldCrops([]);
      setSelectedCrop('');
    }
  }, [selectedField]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedField || (fieldCrops.length > 0 && !selectedCrop)) return;
    setLoading(true);
    try {
      const res = await uploadImageAndPredict(selectedField, file, selectedCrop || null);
      setResult(res.data);
    } catch (e) {
      setResult({ error: e.response?.data?.error || "Prediction failed. Please try again." });
    }
    setLoading(false);
  };

  const getSeasonBadgeColor = (season) => {
    if (season === 'Kharif') return 'bg-green-100 text-green-700 border-green-200';
    if (season === 'Rabi') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="min-h-screen pt-24 pb-10 bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                🔬 Disease Detection
              </h1>
              <p className="text-gray-600 font-medium">Upload plant images for AI-powered disease analysis</p>
            </div>
            <BackButton />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-xl p-8 border border-orange-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Upload & Analyze
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    Select Verified Field
                  </label>
                  <select
                    value={selectedField}
                    onChange={e => setSelectedField(e.target.value)}
                    required
                    className="w-full p-3 border-2 border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition bg-white shadow-sm font-medium"
                  >
                    <option value="">-- Choose Field --</option>
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.field_name} ({f.area} ha)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedField && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-5 shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                        <Leaf className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-blue-900">Select Crop for Detection ({new Date().getFullYear()})</h3>
                    </div>
                    {loadingCrops ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">Loading crops...</p>
                      </div>
                    ) : fieldCrops.length === 0 ? (
                      <div className="text-center py-4 bg-white/50 rounded-lg">
                        <svg className="w-12 h-12 mx-auto mb-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-sm text-gray-600 font-medium">
                          No crops currently growing in this field for {new Date().getFullYear()}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                            Click on a crop to select it for disease detection
                          </p>
                          {selectedCrop && (
                            <button
                              type="button"
                              onClick={() => setSelectedCrop('')}
                              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Deselect
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {fieldCrops.map((crop, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedCrop(selectedCrop === crop.id ? '' : crop.id)}
                              className={`w-full group flex items-center justify-between rounded-xl p-4 border-2 transition-all duration-300 cursor-pointer ${
                                selectedCrop === crop.id
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-600 shadow-lg scale-105'
                                  : 'bg-white border-blue-100 hover:border-green-400 hover:shadow-md hover:scale-102'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {selectedCrop === crop.id && (
                                  <div className="flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                                <div className="text-left">
                                  <div className={`font-bold text-lg ${selectedCrop === crop.id ? 'text-white' : 'text-gray-900'}`}>
                                    {crop.crop_name}
                                  </div>
                                  <div className={`text-xs flex items-center gap-2 mt-1 ${selectedCrop === crop.id ? 'text-green-50' : 'text-gray-600'}`}>
                                    <span className="font-semibold">{crop.area} ha</span>
                                    <span className={selectedCrop === crop.id ? 'text-green-200' : 'text-gray-400'}>•</span>
                                    <span>Year: {crop.crop_year}</span>
                                  </div>
                                </div>
                              </div>
                              <span className={`px-3 py-1.5 text-xs rounded-full font-bold shadow-sm border ${
                                selectedCrop === crop.id 
                                  ? 'bg-white text-green-700 border-white' 
                                  : getSeasonBadgeColor(crop.season)
                              }`}>
                                {crop.season}
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Upload Plant Image
                  </label>
                  {file ? (
                    <div className="relative border-2 border-green-300 rounded-xl overflow-hidden group">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <p className="font-bold text-sm truncate">{file.name}</p>
                        <p className="text-xs text-green-200">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <label 
                        htmlFor="file-upload" 
                        className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/0 hover:bg-black/20 transition-all duration-300"
                      >
                        <span className="bg-white/90 px-4 py-2 rounded-lg font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm">
                          Click to change
                        </span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setFile(e.target.files[0])}
                        required
                        className="hidden"
                        id="file-upload"
                      />
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-orange-300 rounded-xl p-8 text-center hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-300 cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setFile(e.target.files[0])}
                        required
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-gray-500 group-hover:text-orange-600 transition-colors">
                          <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="font-bold text-lg mb-1">Click to select image</p>
                          <p className="text-sm mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !file || !selectedField || (fieldCrops.length > 0 && !selectedCrop)}
                  className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    "🔬 Upload & Predict"
                  )}
                </button>

                {selectedField && fieldCrops.length === 0 && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800 text-center flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">No crops found for {new Date().getFullYear()}. Disease detection requires current crop data.</span>
                    </p>
                  </div>
                )}
              </form>
            </div>

            <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-xl p-8 border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Analysis Results
                </h2>
              </div>

              {result ? (
                result.error ? (
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 shadow-md">
                    <svg className="w-12 h-12 mx-auto mb-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-red-600 font-bold text-center">{result.error}</div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="relative group">
                      <img 
                        src={result.image_url} 
                        alt="Analyzed leaf" 
                        className="w-full h-64 object-cover rounded-2xl shadow-lg border-4 border-white group-hover:shadow-2xl transition-shadow duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 shadow-md">
                      <div className="flex items-center gap-2 mb-3">
                        <Leaf className="w-6 h-6 text-green-600" />
                        <span className="text-sm font-bold text-gray-600">CROP:</span>
                        <span className="text-xl font-bold text-green-700">{result.crop}</span>
                      </div>
                      
                      <div className="h-px bg-green-200 my-4"></div>
                      
                      <div className="mb-3">
                        <div className="text-sm font-bold text-gray-600 mb-1">DETECTED DISEASE:</div>
                        <div className="text-2xl font-bold text-green-800">
                          {result.prediction}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-gray-600">CONFIDENCE:</span>
                          <span className="text-lg font-bold text-green-600">
                            {(result.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full shadow-lg transition-all duration-500"
                            style={{width: `${result.confidence * 100}%`}}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-400 py-16">
                  <svg className="w-24 h-24 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="font-semibold text-lg">Upload an image to see analysis results</p>
                  <p className="text-sm mt-2">Your AI-powered diagnosis will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;