import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import S3Image from '../components/S3Image';
import { getAuthHeader } from '../utils/auth';

export default function CropView(){
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetchCrop();
  }, [id]);

  const fetchCrop = async ()=>{
    try{
      const headers = getAuthHeader();
      const res = await axios.get(`/api/farmer/crops/${id}`, { headers });
      const cropData = res.data?.data;
      
      if (cropData) {
        setCrop(cropData);
        setPredictions(cropData.predictions || []);
      }
    }catch(err){
      console.error('Failed to load crop:', err);
    }finally{
      setLoading(false);
    }
  };

  if(loading){
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading crop...</div>
      </div>
    );
  }

  if(!crop){
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">Crop not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{crop.crop_name}</h1>
            <p className="text-sm text-gray-600">{crop.season} {crop.crop_year} • Field: <Link to={`/fields/${crop.field_id}`}>{crop.field_name || 'View Field'}</Link></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Area</p>
            <p className="text-xl font-semibold">{crop.area} acres</p>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4">Disease Prediction History ({predictions.length})</h2>
          {predictions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600 mb-4">No disease predictions for this crop yet.</p>
              <Link to="/detection" className="btn-primary inline-block">
                Detect Disease
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map(p => (
                <div key={p.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{p.predicted_disease}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          p.severity === 'high' ? 'bg-red-100 text-red-800' :
                          p.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {p.severity?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Confidence</span>
                          <span className="font-medium">{(p.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{ width: `${p.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-2">
                        Detected on {new Date(p.created_at).toLocaleDateString()} at {new Date(p.created_at).toLocaleTimeString()}
                      </p>
                      
                      {p.recommendations && (
                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-gray-700 whitespace-pre-line">{p.recommendations}</p>
                        </div>
                      )}
                    </div>
                    
                    {p.image_url && (
                      <div className="ml-4 flex-shrink-0">
                        <S3Image 
                          s3Key={p.image_url} 
                          alt="Crop disease" 
                          className="w-32 h-32 rounded-lg object-cover border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => window.open(p.image_url, '_blank')}
                          title="Click to view full size"
                          useProxy={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {predictions.length > 0 && predictions[0]?.recommendations && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Latest Recommendations</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-line">{predictions[0].recommendations}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
