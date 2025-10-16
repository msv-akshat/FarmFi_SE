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
        <div className="max-w-5xl mx-auto pt-24 px-4">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <BackButton to="/dashboard" />
                    <h2 className="text-3xl font-bold text-teal-800">🌱 All Crop Records</h2>
                </div>
                <Link
                    to="/crops/new"
                    className="px-5 py-2 bg-gradient-to-r from-green-500 to-teal-700 text-white rounded-full font-bold shadow hover:scale-105 transition"
                >
                    + Add Crop
                </Link>
            </div>
            {loading ? (
                <div className="text-center py-10">Loading crop records...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-lg rounded-lg divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-4">Field</th>
                                <th className="px-4 py-4">Year</th>
                                <th className="px-4 py-4">Season</th>
                                <th className="px-4 py-4">Crop</th>
                                <th className="px-4 py-4">Area</th>
                                <th className="px-4 py-4">Production</th>
                                <th className="px-4 py-4">Status</th>
                                <th className="px-4 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {crops.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-400">No crop records yet.</td>
                                </tr>
                            ) : (
                                crops.map(crop => (
                                    <tr key={crop.id} className="hover:bg-green-50 transition">
                                        <td className="px-4 py-4">{crop.field_name}</td>
                                        <td className="px-4 py-4">{crop.crop_year}</td>
                                        <td className="px-4 py-4">{crop.season}</td>
                                        <td className="px-4 py-4">{crop.crop_name}</td>
                                        <td className="px-4 py-4">{crop.area}</td>
                                        <td className="px-4 py-4">{crop.production}</td>
                                        <td className="px-4 py-4">
                                            {crop.verified
                                                ? <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">Verified</span>
                                                : <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">Draft</span>}
                                        </td>
                                        <td className="px-4 py-4 flex gap-2">
                                            <Link to={`/crops/${crop.id}`} className="px-3 py-1 bg-teal-600 text-white rounded text-xs font-semibold shadow hover:bg-teal-700">View</Link>
                                            {!crop.verified && (
                                                <>
                                                    <Link to={`/crops/${crop.id}/edit`} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700">Edit</Link>
                                                    <button onClick={() => handleDeleteCrop(crop.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700">Delete</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
export default CropList;
