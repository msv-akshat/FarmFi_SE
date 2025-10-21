import React, { useEffect, useState } from 'react';
import { fetchFarmerFields, deleteFarmerField, fetchCropData, deleteCrop } from '../../config/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

const FieldView = () => {
  const { id } = useParams();
  const [field, setField] = useState(null);
  const [crops, setCrops] = useState([]);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    fetchFarmerFields().then(res => {
      const found = res.data.data.find(f => String(f.id) === String(id));
      if (found) setField(found);
    });
    // Get all crops, filter here for this field
    fetchCropData().then(res => {
      setCrops(res.data.data.filter(
        crop => String(crop.field_name) === String(field?.field_name) || String(crop.field_id) === String(id)
      ));
    });
  }, [id, field?.field_name]);

  if (!field) return <div className="text-center py-10">Loading field...</div>;

  // Only allow delete if not verified
  const handleDelete = async () => {
    if (field.verified) {
      showToast("Cannot delete a verified field.");
      return;
    }
    if (window.confirm("Delete this field?")) {
      await deleteFarmerField(field.id);
      showToast("Field deleted!");
      setTimeout(() => navigate("/my-fields"), 1000);
    }
  };

  // Crop delete handler
  const handleDeleteCrop = async (cropId) => {
    const crop = crops.find(c => c.id === cropId);
    if (!crop) return;
    if (crop.verified) {
      showToast("Cannot delete a verified crop!");
      return;
    }
    if (window.confirm("Delete this crop record?")) {
      await deleteCrop(cropId);
      setCrops(crops.filter(c => c.id !== cropId));
      showToast("Crop deleted!");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
      <div className="max-w-4xl mx-auto relative">
        {toast && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-8 py-3 rounded-xl shadow-2xl z-50 font-bold animate-bounce">
            ✅ {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-teal-700 to-cyan-600 bg-clip-text text-transparent">
                  {field.field_name}
                </h2>
                <p className="text-gray-600 mt-1">Field Details & Crop Records</p>
              </div>
              {field.verified ? (
                <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              ) : (
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Draft
                </span>
              )}
            </div>
          </div>
          <BackButton to="/my-fields" />
        </div>

        {/* Field Details Card */}
        <div className="bg-gradient-to-br from-white to-teal-50/30 rounded-2xl shadow-xl p-8 mb-8 border border-teal-200">
          <h3 className="text-xl font-bold text-teal-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Field Information
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-teal-100">
              <div className="text-sm text-gray-500 mb-1">Area</div>
              <div className="text-2xl font-bold text-teal-700">{field.area} ha</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-teal-100">
              <div className="text-sm text-gray-500 mb-1">Status</div>
              <div className="text-2xl font-bold text-teal-700 capitalize">{field.status}</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Latitude
              </div>
              <div className="text-lg font-bold text-blue-700">{field.latitude}</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-100">
              <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Longitude
              </div>
              <div className="text-lg font-bold text-blue-700">{field.longitude}</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100">
              <div className="text-sm text-gray-500 mb-1">Mandal</div>
              <div className="text-lg font-bold text-green-700">{field.mandal_name || field.mandal_id}</div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-100">
              <div className="text-sm text-gray-500 mb-1">Village</div>
              <div className="text-lg font-bold text-green-700">{field.village_name || field.village_id}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-10">
          {!field.verified && (
            <Link 
              to={`/my-fields/${field.id}/edit`} 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Field
            </Link>
          )}
          <button
            className={`flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 ${field.verified ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
            onClick={handleDelete}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Field
          </button>
          <Link
            to={`/crops/new?field_id=${field.id}`}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Crop
          </Link>
        </div>

        {/* Crop Records Section */}
        <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-xl p-8 border border-green-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Crop Records ({crops.length})
            </h3>
          </div>

          {crops.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-green-50 rounded-xl border-2 border-dashed border-green-200">
              <svg className="w-16 h-16 mx-auto mb-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600 font-medium mb-4">No crops recorded for this field yet</p>
              <Link
                to={`/crops/new?field_id=${field.id}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add First Crop
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white/70 backdrop-blur-sm border-collapse rounded-xl overflow-hidden shadow-md">
                <thead>
                  <tr className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    <th className="px-4 py-3 text-left font-bold">Year</th>
                    <th className="px-4 py-3 text-left font-bold">Season</th>
                    <th className="px-4 py-3 text-left font-bold">Crop</th>
                    <th className="px-4 py-3 text-left font-bold">Area (ha)</th>
                    <th className="px-4 py-3 text-left font-bold">Production</th>
                    <th className="px-4 py-3 text-center font-bold">Status</th>
                    <th className="px-4 py-3 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-100">
                  {crops.map((crop, idx) => (
                    <tr key={crop.id} className={`hover:bg-green-50 transition-colors ${idx % 2 === 0 ? 'bg-white/50' : 'bg-green-50/30'}`}>
                      <td className="px-4 py-3 font-semibold">{crop.crop_year}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          crop.season === 'Kharif' ? 'bg-green-100 text-green-700' :
                          crop.season === 'Rabi' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {crop.season}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-green-700">{crop.crop_name}</td>
                      <td className="px-4 py-3 font-semibold">{crop.area}</td>
                      <td className="px-4 py-3 font-semibold">{crop.production}</td>
                      <td className="px-4 py-3 text-center">
                        {crop.verified ? (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs font-bold shadow-sm">Verified</span>
                        ) : (
                          <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-sm">Draft</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Link 
                            to={`/crops/${crop.id}`} 
                            className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg text-xs font-bold shadow hover:shadow-lg transition-all duration-300 hover:scale-105"
                          >
                            View
                          </Link>
                          {!crop.verified && (
                            <>
                              <Link 
                                to={`/crops/${crop.id}/edit`} 
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-xs font-bold shadow hover:shadow-lg transition-all duration-300 hover:scale-105"
                              >
                                Edit
                              </Link>
                              <button 
                                onClick={() => handleDeleteCrop(crop.id)} 
                                className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg text-xs font-bold shadow hover:shadow-lg transition-all duration-300 hover:scale-105"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldView;
