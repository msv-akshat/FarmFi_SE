import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createFarmerField,
  updateFarmerField,
  fetchFarmerFields,
  endpoints
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
    axios.get(endpoints.mandals).then(res => setMandals(res.data.data));
  }, []);

  // Load field data if editing
  useEffect(() => {
    if (mode === "edit" && id) {
      fetchFarmerFields().then(res => {
        const existing = res.data.data.find(f => String(f.id) === String(id));
        if (existing) setField(existing);
        if (existing?.mandal_id) {
          axios.get(endpoints.villagesByMandal(existing.mandal_id)).then(res => setVillages(res.data.data));
        }
      });
    }
  }, [mode, id]);

  // When mandal changes, fetch villages
  useEffect(() => {
    if (field.mandal_id) {
      axios.get(endpoints.villagesByMandal(field.mandal_id)).then(res => setVillages(res.data.data));
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
    <div className="min-h-screen bg-gray-50 flex justify-center items-center pt-20">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-teal-700">{mode === "edit" ? "Edit Field" : "Add New Field"}</h2>
          <BackButton to={mode === "edit" && id ? `/my-fields/${id}` : "/my-fields"} />
        </div>
        <label>Field Name</label>
        <input type="text" name="field_name" value={field.field_name} onChange={handleChange} required className="border rounded px-2 py-2" />
        <label>Area (ha)</label>
        <input type="number" step="0.01" name="area" value={field.area} onChange={handleChange} required className="border rounded px-2 py-2" />
        <label>Latitude</label>
        <input type="number" name="latitude" value={field.latitude} onChange={handleChange} required className="border rounded px-2 py-2" />
        <label>Longitude</label>
        <input type="number" name="longitude" value={field.longitude} onChange={handleChange} required className="border rounded px-2 py-2" />
        <label>Mandal</label>
        <select name="mandal_id" value={field.mandal_id} onChange={handleChange} required className="border rounded px-2 py-2">
          <option value="">Select Mandal</option>
          {mandals.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <label>Village</label>
        <select name="village_id" value={field.village_id} onChange={handleChange} required className="border rounded px-2 py-2">
          <option value="">Select Village</option>
          {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <button type="submit" className="py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded font-bold" disabled={loading}>
          {loading ? "Saving..." : (mode === "edit" ? "Update Field" : "Add Field")}
        </button>
      </form>
    </div>
  );
};

export default FieldForm;
