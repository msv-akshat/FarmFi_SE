import React, { useEffect, useState } from 'react';
import { fetchFarmerFields, deleteFarmerField } from '../../config/api';
import { TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BackButton from '../../components/BackButton';

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
    <div className="min-h-screen pt-24 px-4 pb-10 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <BackButton to="/dashboard" />
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
                🌿 My Fields
              </h2>
              <p className="text-gray-600 mt-1">Manage all your agricultural fields</p>
            </div>
          </div>
          <Link 
            to="/my-fields/new" 
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Field
          </Link>
        </div>

        {fields.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-xl p-12 text-center border border-green-200">
            <svg className="w-20 h-20 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Fields Yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first agricultural field</p>
            <Link 
              to="/my-fields/new" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Your First Field
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {fields.map(field => (
              <div 
                key={field.id} 
                className="group bg-gradient-to-br from-white to-green-50/50 rounded-2xl shadow-lg hover:shadow-2xl p-6 border border-green-100 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Header with Field Name and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-md">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                        {field.field_name}
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {field.mandal_name || field.mandal_id}, {field.village_name || field.village_id}
                      </p>
                    </div>
                  </div>
                  {field.verified ? (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      Draft
                    </span>
                  )}
                </div>

                {/* Field Details */}
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 mb-4 border border-green-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Area</p>
                      <p className="text-lg font-bold text-green-700">{field.area} ha</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p className="text-lg font-bold text-gray-700 capitalize">{field.status}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-green-100">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Coordinates: {field.latitude}, {field.longitude}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link 
                    to={`/my-fields/${field.id}`} 
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </Link>
                  
                  {!field.verified && (
                    <>
                      <Link 
                        to={`/my-fields/${field.id}/edit`} 
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <button 
                        className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold text-sm"
                        onClick={() => handleDelete(field.id)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  <Link 
                    to={`/crops/new?field_id=${field.id}`} 
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Crop
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldList;
