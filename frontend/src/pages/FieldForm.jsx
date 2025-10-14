import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createFarmerField, updateFarmerField, fetchFarmerFields } from '../config/api';

const cropOptions = [ "Cotton", "Maize", "Paddy", "Wheat" ];
const seasonOptions = [ "Rabi", "Kharif", "Whole Year" ];

const FieldForm = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState({
    field_name: '',
    crop_name: '',
    area: '',
    latitude: '',
    longitude: '',
    season: '',
    soil_type: ''
  });
  const [loading, setLoading] = useState(false);

  // If editing, fetch existing field
  useEffect(() => {
    if (mode === "edit" && id) {
      setLoading(true);
      fetchFarmerFields().then(res => {
        const existing = res.data.data.find(f => String(f.id) === String(id));
        if (existing) setField(existing);
        setLoading(false);
      });
    }
  }, [mode, id]);

  const handleChange = (e) => {
    setField(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "edit") {
        await updateFarmerField(id, field);
      } else {
        await createFarmerField({ ...field, area: Number(field.area), latitude: Number(field.latitude), longitude: Number(field.longitude) });
      }
      navigate("/my-fields");
    } catch {
      alert("Failed to submit.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl flex flex-col gap-4">
        <h2 className="text-xl font-bold text-teal-700 mb-1">{mode === "edit" ? "Edit Field" : "Add New Field"}</h2>
        <label>Field Name</label>
        <input type="text" name="field_name" value={field.field_name} onChange={handleChange} required className="border rounded px-2 py-2" />
        <label>Crop</label>
        <select name="crop_name" value={field.crop_name} onChange={handleChange} required className="border rounded px-2 py-2">
          <option value="">Select Crop</option>
          {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label>Area (hectares)</label>
        <input type="number" step="0.01" name="area" value={field.area} onChange={handleChange} required className="border rounded px-2 py-2" />
        <label>Latitude</label>
        <input type="number" name="latitude" value={field.latitude} onChange={handleChange} required className="border rounded px-2 py-2" />
        <label>Longitude</label>
        <input type="number" name="longitude" value={field.longitude} onChange={handleChange} required className="border rounded px-2 py-2" />
        <label>Season</label>
        <select name="season" value={field.season} onChange={handleChange} required className="border rounded px-2 py-2">
          <option value="">Select Season</option>
          {seasonOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label>Soil Type</label>
        <input type="text" name="soil_type" value={field.soil_type} onChange={handleChange} className="border rounded px-2 py-2" />
        <button type="submit" className="py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded font-bold" disabled={loading}>
          {loading ? "Saving..." : (mode === "edit" ? "Update Field" : "Add Field")}
        </button>
      </form>
    </div>
  );
};

export default FieldForm;
