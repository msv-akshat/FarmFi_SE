import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import S3Image from '../components/S3Image';
import { getAuthHeader } from '../utils/auth';
import { MapPin, Wheat, Activity } from 'lucide-react';

export default function FieldView(){
  const { id } = useParams();
  const [field, setField] = useState(null);
  const [crops, setCrops] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetchField();
  }, [id]);

  const fetchField = async ()=>{
    try{
      const headers = getAuthHeader();
      const res = await axios.get(`/api/farmer/fields/${id}`, { headers });
      const fieldData = res.data?.data;
      
      if (fieldData) {
        setField(fieldData);
        setCrops(fieldData.all_crops || []);
        setPredictions(fieldData.recent_predictions || []);
      }
    }catch(err){
      console.error('Failed to load field:', err);
    }finally{
      setLoading(false);
    }
  };

  if(loading){
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading field...</div>
      </div>
    );
  }

  if(!field){
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">Field not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{field.field_name}</h1>
            <p className="text-sm text-gray-600">{field.mandal_name}, {field.village_name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Area</p>
            <p className="text-xl font-semibold">{field.area} acres</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <p className="text-sm text-gray-500">Status</p>
            <p className="mt-1 font-medium">{field.status}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Survey Number</p>
            <p className="mt-1 font-medium">{field.survey_number || '-'}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Soil Type</p>
            <p className="mt-1 font-medium">{field.soil_type || '-'}</p>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Crops on this field ({crops.length})</h2>
          {crops.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-600 mb-4">No crops found for this field.</p>
              <Link to="/crops/add" className="btn-primary inline-block">
                Add Crop
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {crops.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <Link to={`/crops/${c.id}`} className="font-medium text-primary-600 hover:text-primary-700">
                      {c.crop_name}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1">
                      {c.season} {c.crop_year} • {c.area} acres
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {c.prediction_count > 0 && (
                      <span className="text-sm text-gray-600">
                        {c.prediction_count} prediction{c.prediction_count !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      c.status === 'admin_approved' ? 'bg-green-100 text-green-800' :
                      c.status === 'employee_verified' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {c.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {predictions.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Recent Disease Predictions</h2>
            <div className="space-y-3">
              {predictions.map(p => (
                <div key={p.id} className="flex items-start space-x-4 p-3 border border-gray-200 rounded-lg">
                  {p.image_url && (
                    <S3Image 
                      s3Key={p.image_url} 
                      alt="Disease detection" 
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow flex-shrink-0"
                      onClick={() => window.open(p.image_url, '_blank')}
                      title="Click to view full size"
                      useProxy={true}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{p.predicted_disease}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        p.severity === 'high' ? 'bg-red-100 text-red-800' :
                        p.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {p.severity?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Crop: {p.crop_name} ({p.season} {p.crop_year}) • Confidence: {(p.confidence * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(p.created_at).toLocaleDateString()} at {new Date(p.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
