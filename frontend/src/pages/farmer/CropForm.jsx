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
        <div className="min-h-screen pt-20 pb-10 px-4 bg-gradient-to-br from-yellow-50 via-green-50 to-teal-50">
            <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-2xl p-8 border border-green-200">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
                                🌾 Log New Crop
                            </h2>
                        </div>
                        <BackButton to="/crops" />
                    </div>
                    
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Select Field *</label>
                            <select 
                                name="field_id" 
                                value={form.field_id} 
                                onChange={handleChange} 
                                required
                                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white shadow-sm"
                            >
                                <option value="">Choose a field...</option>
                                {fields.map(f => (
                                    <option key={f.id} value={f.id}>{f.field_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Crop Year *</label>
                                <select 
                                    name="crop_year" 
                                    value={form.crop_year} 
                                    onChange={handleChange} 
                                    required
                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white shadow-sm"
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
                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white shadow-sm"
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
                                className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white shadow-sm"
                            >
                                <option value="">Select crop...</option>
                                {(crops || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white shadow-sm"
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
                                    className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white shadow-sm"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Log Crop Record
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CropForm;
