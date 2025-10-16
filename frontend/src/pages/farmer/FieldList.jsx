import React, { useEffect, useState } from 'react';
import { fetchFarmerFields, deleteFarmerField } from '../../config/api';
import { TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const FieldList = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFarmerFields().then(res => {
      setFields(res.data.data);
      setLoading(false);
    }).catch(() => {
      setError("Failed to load fields.");
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this field?')) return;
    await deleteFarmerField(id);
    setFields(fields.filter(f => f.id !== id));
  };

  if (loading) return <div className="text-center py-10">Loading fields...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-teal-700">🌿 My Fields</h2>
        <Link to="/my-fields/new" className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded font-bold shadow hover:scale-105 transition">
          + Add Field
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {fields.map(field => (
          <div key={field.id} className="bg-white/80 rounded-xl shadow p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <TrendingUp className="w-6 h-6" /> {field.field_name}
              {field.verified
                ? <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold ml-2">Verified</span>
                : <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold ml-2">Draft</span>}
            </div>
            <div className="text-gray-600">
              Area: {field.area} ha <br />
              Mandal: {field.mandal_name || field.mandal_id} Village: {field.village_name || field.village_id}
            </div>
            <div className="text-gray-500 text-xs">Lat: {field.latitude}, Lng: {field.longitude} | Status: {field.status}</div>
            <div className="flex gap-3 mt-2">
              <Link to={`/my-fields/${field.id}`} className="text-teal-600 font-bold hover:underline">View</Link>
              {!field.verified && (
                <>
                  <Link to={`/my-fields/${field.id}/edit`} className="text-blue-600 font-bold hover:underline">Edit</Link>
                  <button className="text-red-500 font-bold hover:underline" onClick={() => handleDelete(field.id)}>Delete</button>
                </>
              )}
              <Link to={`/crops/new?field_id=${field.id}`} className="text-green-600 font-bold hover:underline">
                +Add Crop
              </Link>
            </div>
          </div>
        ))}
        {fields.length === 0 && <div className="text-gray-500">No fields yet.</div>}
      </div>
    </div>
  );
};

export default FieldList;
