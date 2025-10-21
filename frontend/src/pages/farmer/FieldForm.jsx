import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createFarmerField,
  updateFarmerField,
  fetchFarmerFields,
  endpoints,
  authHeader
} from "../../config/api";
import axios from "axios";
import BackButton from "../../components/BackButton";

const FieldForm = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [field, setField] = useState({
    field_name: '',
    area: '',
    latitude: '',
    longitude: '',
    mandal_id: '',
    village_id: ''
  });
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load mandals on mount
  useEffect(() => {
    axios.get(endpoints.mandals, { headers: authHeader() }).then(res => setMandals(res.data.data));
  }, []);

  // Load field data if editing
  useEffect(() => {
    if (mode === "edit" && id) {
      fetchFarmerFields().then(res => {
        const existing = res.data.data.find(f => String(f.id) === String(id));
        if (existing) setField(existing);
        if (existing?.mandal_id) {
          axios.get(endpoints.villagesByMandal(existing.mandal_id), { headers: authHeader() }).then(res => setVillages(res.data.data));
        }
      });
    }
  }, [mode, id]);

  // When mandal changes, fetch villages
  useEffect(() => {
    if (field.mandal_id) {
      axios.get(endpoints.villagesByMandal(field.mandal_id), { headers: authHeader() }).then(res => setVillages(res.data.data));
    } else {
      setVillages([]);
      setField(f => ({ ...f, village_id: "" }));
    }
  }, [field.mandal_id]);

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
        await createFarmerField(field);
      }
      navigate("/my-fields");
    } catch {
      alert("Failed to save field");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 flex justify-center items-center pt-24 pb-10 px-4">
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-green-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
              {mode === "edit" ? "✏️ Edit Field" : "➕ Add New Field"}
            </h2>
            <p className="text-gray-600 mt-1">
              {mode === "edit" ? "Update your field information" : "Register a new agricultural field"}
            </p>
          </div>
          <BackButton to={mode === "edit" && id ? `/my-fields/${id}` : "/my-fields"} />
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Field Name *</label>
            <input 
              type="text" 
              name="field_name" 
              value={field.field_name} 
              onChange={handleChange} 
              required 
              className="w-full border-2 border-green-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
              placeholder="Enter field name"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Area (hectares) *</label>
            <input 
              type="number" 
              step="0.01" 
              name="area" 
              value={field.area} 
              onChange={handleChange} 
              required 
              className="w-full border-2 border-green-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Latitude *</label>
              <input 
                type="number" 
                step="any"
                name="latitude" 
                value={field.latitude} 
                onChange={handleChange} 
                required 
                className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                placeholder="0.000000"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Longitude *</label>
              <input 
                type="number" 
                step="any"
                name="longitude" 
                value={field.longitude} 
                onChange={handleChange} 
                required 
                className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                placeholder="0.000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Mandal *</label>
            <select 
              name="mandal_id" 
              value={field.mandal_id} 
              onChange={handleChange} 
              required 
              className="w-full border-2 border-teal-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition shadow-sm font-medium"
            >
              <option value="">Select Mandal</option>
              {mandals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Village *</label>
            <select 
              name="village_id" 
              value={field.village_id} 
              onChange={handleChange} 
              required 
              className="w-full border-2 border-teal-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition shadow-sm font-medium"
              disabled={!field.mandal_id}
            >
              <option value="">Select Village</option>
              {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
            {!field.mandal_id && (
              <p className="text-xs text-gray-500 mt-1">Please select a mandal first</p>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-gradient-to-r from-green-500 via-teal-600 to-cyan-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                {mode === "edit" ? "💾 Update Field" : "✅ Add Field"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FieldForm;
