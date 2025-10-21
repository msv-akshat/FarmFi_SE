import React, { useEffect, useState } from 'react';
import BackButton from '../../components/BackButton';
import { fetchVerifiedFields, uploadImageAndPredict } from '../../config/api';

const DiseaseDetection = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVerifiedFields()
      .then(res => setFields(res.data))
      .catch(() => setFields([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !selectedField) return;
    setLoading(true);
    try {
      const res = await uploadImageAndPredict(selectedField, file);
      setResult(res.data);
    } catch (e) {
      setResult({ error: "Prediction failed. Please try again." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 flex items-center">
              🔬 Disease Detection
            </h1>
            <BackButton />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Upload Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload & Analyze</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Field Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Verified Field
                  </label>
                  <select
                    value={selectedField}
                    onChange={e => setSelectedField(e.target.value)}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  >
                    <option value="">-- Choose Field --</option>
                    {fields.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.field_name} (Area: {f.area} acres)
                      </option>
                    ))}
                  </select>
                </div>
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Plant Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setFile(e.target.files[0])}
                      required
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {file ? (
                        <div className="text-green-600">
                          ✅ {file.name}
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          📸 Click to select image
                          <p className="text-sm mt-1">PNG, JPG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !file || !selectedField}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {loading ? "🔄 Analyzing..." : "🚀 Upload & Predict"}
                </button>
              </form>
            </div>

            {/* Results Display */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Analysis Results</h2>
              {result ? (
                result.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-600 font-medium">❌ {result.error}</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Image Preview */}
                    <div className="text-center">
                      <img 
                        src={result.image_url} 
                        alt="Analyzed leaf" 
                        className="max-w-full h-48 object-cover rounded-lg mx-auto shadow-md"
                      />
                    </div>
                    {/* Prediction Results */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-lg font-semibold text-gray-800 mb-2">
                        🌱 Crop: <span className="font-bold">{result.crop}</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-800 mb-2">
                        🔍 Detected Disease:
                      </div>
                      <div className="text-xl font-bold text-green-700 mb-2">
                        {result.prediction}
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Confidence: </span>
                        <div className="ml-2 flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{width: `${result.confidence * 100}%`}}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium text-green-600">
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-400 py-12">
                  🌱 Upload an image to see analysis results
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
