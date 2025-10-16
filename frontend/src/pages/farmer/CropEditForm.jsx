import React, { useEffect, useState } from "react";
import { fetchSingleCrop, updateCropData, endpoints } from "../../config/api";
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
    axios.get(endpoints.cropsCatalog).then(res => setCropsCatalog(res.data.data || []));
    // Also, load available fields if you allow moving crop to another field
    // fetchFarmerFields().then(res => setFields(res.data.data || []));
  }, [id]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  if (!crop || !form) return <div className="text-center py-10">Loading crop...</div>;
  if (crop.verified) return (
    <div className="max-w-lg mx-auto py-16 text-center">
      <div className="text-xl font-bold mb-4 text-green-700">This crop record is verified and cannot be edited.</div>
      <BackButton to={`/crops/${id}`} />
    </div>
  );

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCropData(id, form);
      showToast("Crop updated!");
      setTimeout(() => navigate(`/crops/${id}`), 1000);
    } catch {
      showToast("Failed to update crop!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center pt-20">
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-700 text-white px-6 py-2 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-green-700">Edit Crop Record</h2>
          <BackButton to={`/crops/${id}`} />
        </div>
        {/* <label>Field</label>
        <select name="field_id" value={form.field_id} onChange={handleChange} required>
          <option value="">Pick Field</option>
          {fields.map(f => (
            <option key={f.id} value={f.id}>{f.field_name}</option>
          ))}
        </select> */}
        <label>Year</label>
        <select name="crop_year" value={form.crop_year} onChange={handleChange} required>
          <option value="">Select Year</option>
          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <label>Season</label>
        <select name="season" value={form.season} onChange={handleChange} required>
          <option value="">Select Season</option>
          {seasonOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label>Crop</label>
        <select name="crop_id" value={form.crop_id} onChange={handleChange} required>
          <option value="">Select Crop</option>
          {(cropsCatalog || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label>Area (ha)</label>
        <input name="area" type="number" value={form.area} onChange={handleChange} required className="border rounded px-2 py-2" />
        <label>Production (tons)</label>
        <input name="production" type="number" value={form.production} onChange={handleChange} required className="border rounded px-2 py-2" />
        <button type="submit" className="py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded font-bold" disabled={loading}>
          {loading ? "Updating..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default CropEditForm;
