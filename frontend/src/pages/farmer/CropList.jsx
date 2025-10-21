import React, { useEffect, useState } from "react";
import { fetchCropData, deleteCrop } from "../../config/api";
import { Link } from "react-router-dom";
import BackButton from "../../components/BackButton";

const CropList = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCropData().then(res => {
            setCrops(res.data.data);
            setLoading(false);
        });
    }, []);

    const handleDeleteCrop = async (cropId) => {
        const crop = crops.find(c => c.id === cropId);
        if (!crop) return;
        if (crop.verified) {
            alert("Cannot delete a verified crop!");
            return;
        }
        if (window.confirm("Delete this crop record?")) {
            await deleteCrop(cropId);
            setCrops(crops.filter(c => c.id !== cropId));
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-10 px-4 bg-gradient-to-br from-yellow-50 via-green-50 to-teal-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <BackButton to="/dashboard" />
                        <div>
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
                                🌾 All Crop Records
                            </h2>
                            <p className="text-gray-600 mt-1">View and manage all your crop data</p>
                        </div>
                    </div>
                    <Link
                        to="/crops/new"
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Crop
                    </Link>
                </div>

                {loading ? (
                    <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-12 text-center border border-green-200">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 font-semibold">Loading crop records...</p>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-white to-green-50/30 rounded-2xl shadow-xl overflow-hidden border border-green-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-green-200">
                                <thead className="bg-gradient-to-r from-green-600 to-teal-600">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Field</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Year</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Season</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Crop</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Area (ha)</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">Production</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white/70 backdrop-blur-sm divide-y divide-green-100">
                                    {crops.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-16 text-center">
                                                <svg className="w-16 h-16 mx-auto mb-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <p className="text-gray-600 font-medium mb-4">No crop records yet.</p>
                                                <Link 
                                                    to="/crops/new"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    Add First Crop
                                                </Link>
                                            </td>
                                        </tr>
                                    ) : (
                                        crops.map((crop, idx) => (
                                            <tr key={crop.id} className={`hover:bg-green-50 transition-colors ${idx % 2 === 0 ? 'bg-white/50' : 'bg-green-50/30'}`}>
                                                <td className="px-6 py-4 font-semibold text-gray-800">{crop.field_name}</td>
                                                <td className="px-6 py-4 font-semibold">{crop.crop_year}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                        crop.season === 'Kharif' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        crop.season === 'Rabi' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                        'bg-blue-100 text-blue-700 border-blue-200'
                                                    }`}>
                                                        {crop.season}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-green-700">{crop.crop_name}</td>
                                                <td className="px-6 py-4 font-semibold">{crop.area}</td>
                                                <td className="px-6 py-4 font-semibold">{crop.production}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {crop.verified ? (
                                                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs font-bold shadow-sm">Verified</span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-sm">Draft</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default CropList;
