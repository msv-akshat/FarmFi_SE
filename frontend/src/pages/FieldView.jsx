import React, { useEffect, useState } from 'react';
import { fetchFarmerFields } from '../config/api';
import { useParams, Link } from 'react-router-dom';

const FieldView = () => {
  const { id } = useParams();
  const [field, setField] = useState(null);

  useEffect(() => {
    fetchFarmerFields().then(res => {
      const found = res.data.data.find(f => String(f.id) === String(id));
      if (found) setField(found);
    });
  }, [id]);

  if (!field) return <div className="text-center py-10">Loading field...</div>;

  return (
    <div className="max-w-lg mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold text-teal-700 mb-3">{field.field_name}</h2>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-2 text-lg">
        <div>Crop: <strong>{field.crop_name || '-'}</strong></div>
        <div>Season: {field.season}</div>
        <div>Area: {field.area} ha</div>
        <div>Latitude: {field.latitude}</div>
        <div>Longitude: {field.longitude}</div>
        <div>Soil Type: {field.soil_type || '-'}</div>
        <div>Status: {field.status}</div>
      </div>
      <Link to="/predictions" className="block mt-7 px-10 py-3 bg-gradient-to-r from-teal-500 to-green-500 rounded-xl text-white font-bold shadow hover:scale-105 transition text-center">Show Yield Prediction</Link>
      <div className="mt-5">
        <Link to="/my-fields" className="text-teal-700 font-semibold hover:underline">← Back to Field List</Link>
      </div>
    </div>
  );
};

export default FieldView;
