import React, { useEffect, useState } from 'react';
import { fetchFarmerFields, deleteFarmerField, fetchCropData, deleteCrop } from '../../config/api';
import { useParams, Link, useNavigate } from 'react-router-dom';

const FieldView = () => {
  const { id } = useParams();
  const [field, setField] = useState(null);
  const [crops, setCrops] = useState([]);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    fetchFarmerFields().then(res => {
      const found = res.data.data.find(f => String(f.id) === String(id));
      if (found) setField(found);
    });
    // Get all crops, filter here for this field
    fetchCropData().then(res => {
      setCrops(res.data.data.filter(
        crop => String(crop.field_name) === String(field?.field_name) || String(crop.field_id) === String(id)
      ));
    });
  }, [id, field?.field_name]);

  if (!field) return <div className="text-center py-10">Loading field...</div>;

  // Only allow delete if not verified
  const handleDelete = async () => {
    if (field.verified) {
      showToast("Cannot delete a verified field.");
      return;
    }
    if (window.confirm("Delete this field?")) {
      await deleteFarmerField(field.id);
      showToast("Field deleted!");
      setTimeout(() => navigate("/my-fields"), 1000);
    }
  };

  // Crop delete handler
  const handleDeleteCrop = async (cropId) => {
    const crop = crops.find(c => c.id === cropId);
    if (!crop) return;
    if (crop.verified) {
      showToast("Cannot delete a verified crop!");
      return;
    }
    if (window.confirm("Delete this crop record?")) {
      await deleteCrop(cropId);
      setCrops(crops.filter(c => c.id !== cropId));
      showToast("Crop deleted!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 relative">
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-700 text-white px-6 py-2 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-teal-700 flex items-center gap-2">
          {field.field_name}
          {field.verified ? (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold ml-2">Verified</span>
          ) : (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold ml-2">Draft</span>
          )}
        </h2>
        <Link to="/my-fields" className="text-teal-700 px-4 py-1 border border-teal-400 rounded-full font-semibold hover:bg-teal-50 transition">← Back</Link>
      </div>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 text-lg mb-8">
        <div>Area: {field.area} ha</div>
        <div>Latitude: {field.latitude}</div>
        <div>Longitude: {field.longitude}</div>
        <div>Mandal: {field.mandal_name || field.mandal_id}</div>
        <div>Village: {field.village_name || field.village_id}</div>
        <div>Status: {field.status}</div>
      </div>
      <div className="flex gap-4 mb-8">
        {!field.verified && (
          <Link to={`/my-fields/${field.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-blue-700">Edit</Link>
        )}
        <button
          className={`bg-red-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-red-700 ${field.verified ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={handleDelete}
        >
          Delete
        </button>
        <Link
          to={`/crops/new?field_id=${field.id}`}
          className="bg-green-600 text-white px-4 py-2 rounded font-bold shadow hover:bg-green-700"
        >
          + Add Crop
        </Link>
      </div>
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-3 text-teal-800">Crop Records for this Field</h3>
        {crops.length === 0 ? (
          <div className="text-gray-500 py-4">No crops for this field.</div>
        ) : (
          <table className="w-full bg-white border-gray-200 shadow rounded">
            <thead>
              <tr>
                <th className="px-3 py-2">Year</th>
                <th className="px-3 py-2">Season</th>
                <th className="px-3 py-2">Crop</th>
                <th className="px-3 py-2">Area</th>
                <th className="px-3 py-2">Production</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {crops.map(crop => (
                <tr key={crop.id}>
                  <td className="px-3 py-2">{crop.crop_year}</td>
                  <td className="px-3 py-2">{crop.season}</td>
                  <td className="px-3 py-2">{crop.crop_name}</td>
                  <td className="px-3 py-2">{crop.area}</td>
                  <td className="px-3 py-2">{crop.production}</td>
                  <td className="px-3 py-2">
                    {crop.verified
                      ? <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs font-bold">Verified</span>
                      : <span className="bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded text-xs font-bold">Draft</span>}
                  </td>
                  <td className="px-3 py-2 flex gap-2">
                    <Link to={`/crops/${crop.id}`} className="px-3 py-1 bg-teal-600 text-white rounded text-xs font-semibold shadow hover:bg-teal-700">View</Link>
                    {!crop.verified && (
                      <>
                        <Link to={`/crops/${crop.id}/edit`} className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700">Edit</Link>
                        <button onClick={() => handleDeleteCrop(crop.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FieldView;
