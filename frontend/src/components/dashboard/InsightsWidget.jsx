import React from 'react';
import { TrendingUp } from 'lucide-react';

const InsightsWidget = ({ fields }) => {
  const totalArea = fields.reduce((sum, field) => sum + (field.area || 0), 0);
  const avgArea = fields.length ? (totalArea / fields.length).toFixed(1) : 0;
  const mostCommonCrop = fields.length ? 
    fields.reduce((acc, field) => {
      acc[field.crop_name] = (acc[field.crop_name] || 0) + 1;
      return acc;
    }, {}) : {};
  
  const topCrop = Object.keys(mostCommonCrop).length ? 
    Object.keys(mostCommonCrop).reduce((a, b) => mostCommonCrop[a] > mostCommonCrop[b] ? a : b) : "None";

  return (
    <section className="w-full bg-white rounded-lg shadow p-7">
      <div className="text-xl font-bold text-teal-700 mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6" />
        Farm Insights
      </div>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Area:</span>
          <span className="font-semibold">{totalArea} ha</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Average Field Size:</span>
          <span className="font-semibold">{avgArea} ha</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Most Common Crop:</span>
          <span className="font-semibold">{topCrop}</span>
        </div>
        <div className="bg-gradient-to-r from-teal-50 to-green-50 p-3 rounded-lg border border-teal-100">
          <div className="text-sm text-teal-700 font-semibold">💡 Tip</div>
          <div className="text-sm text-gray-600 mt-1">
            Consider crop rotation to improve soil health and increase yields.
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsightsWidget;
