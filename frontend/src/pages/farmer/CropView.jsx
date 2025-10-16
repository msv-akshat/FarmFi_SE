import React, { useEffect, useState } from "react";
import { fetchSingleCrop, deleteCrop } from "../../config/api";
import { useParams, Link, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";

const CropView = () => {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1600);
  };

  useEffect(() => {
    fetchSingleCrop(id).then(res => setCrop(res.data.data));
  }, [id]);

  if (!crop) return <div className="text-center py-12">Loading crop...</div>;

  const handleDelete = async () => {
    if (crop.verified) {
      showToast("Cannot delete a verified crop!");
      return;
    }
    if (window.confirm("Delete this crop record?")) {
      await deleteCrop(crop.id);
      showToast("Crop deleted!");
      setTimeout(() => navigate("/crops"), 1100);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-12 px-4 relative">
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-700 text-white px-6 py-2 rounded-xl shadow-lg z-50">
          {toast}
        </div>
      )}
      <div className="flex gap-3 items-center mb-6">
        <h2 className="text-2xl font-bold text-teal-800 mb-3">
          Crop: {crop.crop_name}
        </h2>
        {crop.verified
          ? <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold ml-2">Verified</span>
          : <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold ml-2">Draft</span>
        }
      </div>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 text-lg">
        <div>Field: {crop.field_name} </div>
        <div>Year: {crop.crop_year}</div>
        <div>Season: {crop.season}</div>
        <div>Area: {crop.area}</div>
        <div>Production: {crop.production}</div>
        {/* Add more fields if needed */}
      </div>

      <div className="flex gap-3 mt-8">
        {!crop.verified && (
          <Link to={`/crops/${crop.id}/edit`} className="bg-blue-600 text-white px-5 py-2 rounded font-bold shadow hover:bg-blue-700">Edit</Link>
        )}
        <button
          className={`bg-red-600 text-white px-5 py-2 rounded font-bold shadow hover:bg-red-700 ${crop.verified ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={handleDelete}
        >
          Delete
        </button>
        <BackButton to="/crops" />
      </div>
    </div>
  );
};

export default CropView;
