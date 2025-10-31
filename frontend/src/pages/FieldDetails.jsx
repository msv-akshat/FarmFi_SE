import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../config/api';
import Navbar from '../components/NavBar';
import { ArrowLeft, MapPin, User, Calendar, CheckCircle, XCircle, Droplet, Mountain } from 'lucide-react';

export default function FieldDetails() {
  const { id } = useParams();
  const [field, setField] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFieldDetails();
  }, [id]);

  const fetchFieldDetails = async () => {
    try {
      const response = await api.get(`/admin/fields/${id}`);
      if (response.data.success) {
        setField(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load field details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await api.patch(`/admin/fields/${id}/approve`);
      toast.success('Field approved successfully');
      fetchFieldDetails();
    } catch (error) {
      toast.error('Failed to approve field');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </>
    );
  }

  if (!field) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Field not found</h2>
            <Link to="/admin/fields" className="text-purple-600 hover:underline mt-4 inline-block">
              Back to Fields
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Link to="/admin/fields" className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Fields Management
          </Link>

          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey No: {field.survey_number}</h1>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    field.status === 'admin_approved' ? 'bg-green-100 text-green-800' :
                    field.status === 'employee_verified' ? 'bg-blue-100 text-blue-800' :
                    field.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {field.status?.replace('_', ' ').toUpperCase()}
                  </span>
                  {field.status !== 'admin_approved' && (
                    <button
                      onClick={handleApprove}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Field
                    </button>
                  )}
                </div>
              </div>
            </div>

            {field.rejection_reason && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-center mb-2">
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="font-semibold text-red-900">Rejection Reason</p>
                </div>
                <p className="text-red-700">{field.rejection_reason}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Farmer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Farmer Name</p>
                      <p className="font-medium text-gray-900">{field.farmer_name || 'N/A'}</p>
                    </div>
                  </div>
                  {field.farmer_id && (
                    <Link
                      to={`/admin/farmers/${field.farmer_id}`}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium inline-block mt-2"
                    >
                      View Farmer Profile →
                    </Link>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Registration</h3>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Created On</p>
                    <p className="font-medium text-gray-900">
                      {new Date(field.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Field Details */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Field Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <p className="font-medium text-gray-900">
                      {field.village}, {field.mandal}, {field.district}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Area</p>
                  <p className="text-2xl font-bold text-gray-900">{field.total_area} <span className="text-lg text-gray-600">acres</span></p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Cultivable Area</p>
                  <p className="text-xl font-semibold text-gray-900">{field.cultivable_area} <span className="text-base text-gray-600">acres</span></p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Non-Cultivable Area</p>
                  <p className="text-xl font-semibold text-gray-900">{field.non_cultivable_area} <span className="text-base text-gray-600">acres</span></p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <Mountain className="w-4 h-4 mr-1" />
                    Soil Type
                  </p>
                  <p className="font-medium text-gray-900">{field.soil_type}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <Droplet className="w-4 h-4 mr-1" />
                    Water Source
                  </p>
                  <p className="font-medium text-gray-900">{field.water_source}</p>
                </div>

                {field.longitude && field.latitude && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Coordinates</p>
                    <p className="font-mono text-sm text-gray-900">
                      {field.latitude}, {field.longitude}
                    </p>
                  </div>
                )}

                {field.verified_by && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Verified By</p>
                    <p className="font-medium text-gray-900">Employee ID: {field.verified_by}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Associated Crops */}
          {field.crops && field.crops.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Associated Crops</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {field.crops.map((crop) => (
                  <div key={crop.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <h3 className="font-semibold text-gray-900 mb-2">{crop.crop_name}</h3>
                    <p className="text-sm text-gray-600 mb-1">Season: {crop.season}</p>
                    <p className="text-sm text-gray-600 mb-3">Area: {crop.area_acres} acres</p>
                    <Link
                      to={`/admin/crops/${crop.id}`}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      View Crop Details →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
