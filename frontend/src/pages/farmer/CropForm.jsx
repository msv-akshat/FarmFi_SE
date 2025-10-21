import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchFarmerFields, createCropData, endpoints, authHeader } from "../../config/api";
import axios from "axios";
import BackButton from "../../components/BackButton";
const seasonOptions = ["Rabi", "Kharif", "Whole Year"];
const yearOptions = [2024, 2025, 2026];

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const CropForm = () => {
    const query = useQuery();
    const [fields, setFields] = useState([]);
    const [crops, setCrops] = useState([]);
    const [form, setForm] = useState({
        field_id: "",
        crop_id: "",
        crop_year: "",
        season: "",
        area: "",
        production: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFarmerFields().then(res => setFields(res.data.data));
        axios.get(endpoints.cropsCatalog, { headers: authHeader() }).then(res => setCrops(res.data.data || []));
    }, []);

    // If preselected field_id exists in query params, use it!
    useEffect(() => {
        const preselect = query.get("field_id");
        if (preselect) setForm(f => ({ ...f, field_id: preselect }));
    }, [fields.length]);

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
            await createCropData(form);
            window.location = "/crops";
        } catch {
            alert("Failed to save crop!");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center pt-20">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-8 w-full max-w-xl flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-green-700">Log Crop For Field</h2>
                    <BackButton to="/crops" />
                </div>
                <label>Field</label>
                <select name="field_id" value={form.field_id} onChange={handleChange} required>
                    <option value="">Pick Field</option>
                    {fields.map(f => (
                        <option key={f.id} value={f.id}>{f.field_name}</option>
                    ))}
                </select>
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
                    {(crops || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <label>Area (ha)</label>
                <input name="area" value={form.area} onChange={handleChange} required className="border rounded px-2 py-2" />
                <label>Production (tons)</label>
                <input name="production" value={form.production} onChange={handleChange} required className="border rounded px-2 py-2" />
                <button type="submit" className="py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded font-bold" disabled={loading}>
                    {loading ? "Saving..." : "Log Crop"}
                </button>
            </form>
        </div>
    );
};

export default CropForm;
