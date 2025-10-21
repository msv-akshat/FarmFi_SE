import React, { useEffect, useState } from "react";
import { fetchSingleCrop, deleteCrop } from "../../config/api";
import { useParams, Link, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";

const CropView = () => {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  useEffect(() => {
    fetchSingleCrop(id).then(res => setCrop(res.data.data));
  }, [id]);

  if (!crop) return <div className="text-center py-12">Loading crop...</div>;

  const handleDelete = async () => {
    if (crop.verified) {
      showToast("Cannot delete a verified crop!");
      return;
    }
    if (window.confirm("Delete this crop record?")) {
      await deleteCrop(crop.id);
      showToast("Crop deleted!");
      setTimeout(() => navigate("/crops"), 1100);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-br from-yellow-50 via-green-50 to-teal-50">
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-3 rounded-xl shadow-2xl z-50 animate-bounce font-bold">
          {toast}
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <BackButton to="/crops" />
          <div className="flex-1 flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
                🌾 {crop.crop_name}
              </h2>
              <p className="text-gray-600 mt-1">Crop Record Details</p>
            </div>
            {crop.verified ? (
              <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow-lg">
                ✓ Verified
              </span>
            ) : (
              <span className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold shadow-lg">
                ⚠ Draft
              </span>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-xl p-8 border border-green-200 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Crop Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all">
              <div className="text-sm text-gray-500 font-semibold mb-1">Field Name</div>
              <div className="text-xl font-bold text-gray-800">{crop.field_name}</div>
            </div>
            <div className="p-5 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all">
              <div className="text-sm text-gray-500 font-semibold mb-1">Crop Year</div>
              <div className="text-xl font-bold text-gray-800">{crop.crop_year}</div>
            </div>
            <div className="p-5 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all">
              <div className="text-sm text-gray-500 font-semibold mb-1">Season</div>
              <div className="text-xl font-bold">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${
                  crop.season === 'Kharif' ? 'bg-green-100 text-green-700 border-green-200' :
                  crop.season === 'Rabi' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                  'bg-blue-100 text-blue-700 border-blue-200'
                }`}>
                  {crop.season}
                </span>
              </div>
            </div>
            <div className="p-5 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all">
              <div className="text-sm text-gray-500 font-semibold mb-1">Crop Type</div>
              <div className="text-xl font-bold text-green-700">{crop.crop_name}</div>
            </div>
            <div className="p-5 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all">
              <div className="text-sm text-gray-500 font-semibold mb-1">Area</div>
              <div className="text-xl font-bold text-gray-800">{crop.area} <span className="text-sm text-gray-500">hectares</span></div>
            </div>
            <div className="p-5 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-green-100 hover:shadow-md transition-all">
              <div className="text-sm text-gray-500 font-semibold mb-1">Production</div>
              <div className="text-xl font-bold text-gray-800">{crop.production} <span className="text-sm text-gray-500">tons</span></div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {!crop.verified && (
            <Link 
              to={`/crops/${crop.id}/edit`} 
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Record
            </Link>
          )}
          <button
            className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${crop.verified ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleDelete}
            disabled={crop.verified}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropView;
