import React, { useEffect, useState } from "react";
import { fetchSingleCrop, updateCropData, endpoints, authHeader } from "../../config/api";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";

const seasonOptions = ["Rabi", "Kharif", "Whole Year"];
const yearOptions = [2024, 2025, 2026];

const CropEditForm = () => {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [fields, setFields] = useState([]);
  const [cropsCatalog, setCropsCatalog] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSingleCrop(id).then(res => {
      setCrop(res.data.data);
      setForm({
        field_id: res.data.data.field_id,
        crop_id: res.data.data.crop_id,
        crop_year: res.data.data.crop_year,
        season: res.data.data.season,
        area: res.data.data.area,
        production: res.data.data.production
      });
    });
    axios.get(endpoints.cropsCatalog, { headers: authHeader() }).then(res => setCropsCatalog(res.data.data || []));
    // Also, load available fields if you allow moving crop to another field
    // fetchFarmerFields().then(res => setFields(res.data.data || []));
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  if (!crop || !form) return (
    <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-br from-yellow-50 via-green-50 to-teal-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-xl p-12 text-center border border-green-200">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-semibold">Loading crop record...</p>
      </div>
    </div>
  );
  
  if (crop.verified) return (
    <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-br from-yellow-50 via-green-50 to-teal-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto bg-gradient-to-br from-white to-yellow-50/30 rounded-2xl shadow-xl p-12 text-center border border-yellow-200">
        <div className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Record is Verified</h2>
        <p className="text-gray-600 mb-6">This crop record has been verified and cannot be edited anymore.</p>
        <BackButton to={`/crops/${id}`} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 bg-gradient-to-br from-yellow-50 via-green-50 to-teal-50">
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-3 rounded-xl shadow-2xl z-50 animate-bounce font-bold">
          {toast}
        </div>
      )}
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-2xl p-8 border border-green-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                ✏️ Edit Crop Record
              </h2>
            </div>
            <BackButton to={`/crops/${id}`} />
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Crop Year *</label>
                <select 
                  name="crop_year" 
                  value={form.crop_year} 
                  onChange={handleChange} 
                  required
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white shadow-sm"
                >
                  <option value="">Select year...</option>
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Season *</label>
                <select 
                  name="season" 
                  value={form.season} 
                  onChange={handleChange} 
                  required
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white shadow-sm"
                >
                  <option value="">Select season...</option>
                  {seasonOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Crop Type *</label>
              <select 
                name="crop_id" 
                value={form.crop_id} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white shadow-sm"
              >
                <option value="">Select crop...</option>
                {(cropsCatalog || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Area (hectares) *</label>
                <input 
                  name="area" 
                  type="number" 
                  step="0.01"
                  value={form.area} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g., 10.5"
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Production (tons) *</label>
                <input 
                  name="production" 
                  type="number" 
                  step="0.01"
                  value={form.production} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g., 25.75"
                  className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white shadow-sm"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CropEditForm;
