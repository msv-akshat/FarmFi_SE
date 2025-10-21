import React, { useEffect, useState } from 'react';
import { fetchCropData } from '../../config/api';
import { CheckCircle, Clock, AlertCircle, Plus, Edit } from 'lucide-react';

const RecentActivity = ({ fields }) => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCropData()
      .then(res => {
        setCrops(res.data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setCrops([]);
        setLoading(false);
      });
  }, []);

  // Create activity items from both fields and crops
  const createActivityItems = () => {
    const activities = [];

    // Add field activities
    fields.forEach(field => {
      activities.push({
        id: `field-${field.id}`,
        type: 'field',
        action: field.created_at === field.updated_at ? 'created' : 'updated',
        name: field.field_name,
        detail: `${field.area} ha`,
        status: field.verified ? 'verified' : field.status,
        timestamp: new Date(field.updated_at || field.created_at),
      });
    });

    // Add crop activities
    crops.forEach(crop => {
      activities.push({
        id: `crop-${crop.id}`,
        type: 'crop',
        action: 'added',
        name: crop.crop_name,
        detail: `${crop.area} ha in ${crop.field_name}`,
        status: crop.verified ? 'verified' : 'pending',
        timestamp: new Date(crop.created_at || new Date()),
        year: crop.crop_year,
        season: crop.season,
      });
    });

    // Sort by timestamp and take top 5
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
  };

  const getActivityIcon = (activity) => {
    if (activity.status === 'verified') {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (activity.status === 'pending') {
      return <Clock className="w-4 h-4 text-yellow-600" />;
    }
    if (activity.status === 'rejected') {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    if (activity.action === 'created') {
      return <Plus className="w-4 h-4 text-blue-600" />;
    }
    return <Edit className="w-4 h-4 text-gray-600" />;
  };

  const getStatusBadge = (status) => {
    const badges = {
      verified: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg shadow-md">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-teal-700 to-blue-600 bg-clip-text text-transparent">
            Recent Activity
          </h3>
        </div>
        <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-teal-50 rounded-xl">
          <div className="animate-spin w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full mx-auto"></div>
          <p className="text-gray-500 text-sm mt-3 font-medium">Loading activity...</p>
        </div>
      </>
    );
  }

  const activities = createActivityItems();

  if (activities.length === 0) {
    return (
      <>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg shadow-md">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-teal-700 to-blue-600 bg-clip-text text-transparent">
            Recent Activity
          </h3>
        </div>
        <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-teal-50 rounded-xl border-2 border-dashed border-teal-200">
          <Clock className="w-12 h-12 mx-auto mb-3 text-teal-400" />
          <p className="text-gray-500 text-sm font-medium">No recent activity</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg shadow-md">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold bg-gradient-to-r from-teal-700 to-blue-600 bg-clip-text text-transparent">
          Recent Activity
        </h3>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 transition-all duration-300 border border-gray-100 hover:border-teal-200 hover:shadow-md"
          >
            <div className="flex-shrink-0 mt-0.5 p-1.5 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
              {getActivityIcon(activity)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {activity.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <span className="font-medium">{activity.type === 'field' ? 'Field' : 'Crop'}</span>
                    <span className="text-gray-400">•</span>
                    <span>{activity.action}</span>
                    {activity.season && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="font-medium text-teal-600">{activity.season} {activity.year}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 font-medium">
                    {activity.detail}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border shadow-sm ${getStatusBadge(activity.status)}`}>
                    {activity.status}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap font-medium">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RecentActivity;
