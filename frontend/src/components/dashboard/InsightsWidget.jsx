import React from 'react';
import { TrendingUp, Sparkles, BarChart3, Target } from 'lucide-react';

const InsightsWidget = ({ fields }) => {
  const totalArea = fields.reduce((sum, field) => sum + (parseFloat(field.area) || 0), 0);
  const avgArea = fields.length > 0 ? (totalArea / fields.length).toFixed(2) : '0.00';
  
  // Count crops from fields (filter out undefined/null crop names)
  const cropCount = fields.reduce((acc, field) => {
    if (field.crop_name) {
      acc[field.crop_name] = (acc[field.crop_name] || 0) + 1;
    }
    return acc;
  }, {});
  
  const topCrop = Object.keys(cropCount).length > 0
    ? Object.keys(cropCount).reduce((a, b) => cropCount[a] > cropCount[b] ? a : b)
    : "No crops yet";

  return (
    <section className="w-full bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl shadow-lg p-7 border border-purple-200">
      <div className="text-xl font-bold mb-5 flex items-center gap-2">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <h3 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Farm Insights
        </h3>
      </div>
      
      <div className="space-y-3">
        <div className="group flex justify-between items-center p-3 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-300 hover:shadow-md border border-purple-100">
          <span className="flex items-center gap-2 text-gray-700 font-medium">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            Total Area
          </span>
          <span className="font-bold text-purple-700 text-lg">{totalArea.toFixed(2)} ha</span>
        </div>
        
        <div className="group flex justify-between items-center p-3 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-300 hover:shadow-md border border-pink-100">
          <span className="flex items-center gap-2 text-gray-700 font-medium">
            <Target className="w-4 h-4 text-pink-600" />
            Average Field Size
          </span>
          <span className="font-bold text-pink-700 text-lg">{avgArea} ha</span>
        </div>
        
        <div className="group flex justify-between items-center p-3 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white transition-all duration-300 hover:shadow-md border border-orange-100">
          <span className="flex items-center gap-2 text-gray-700 font-medium">
            <Sparkles className="w-4 h-4 text-orange-600" />
            Most Common Crop
          </span>
          <span className="font-bold text-orange-700 text-lg">{topCrop}</span>
        </div>
        
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-4 rounded-xl shadow-lg mt-4">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <div className="text-sm text-white font-bold flex items-center gap-2 mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              💡 Pro Tip
            </div>
            <div className="text-sm text-white/90 leading-relaxed">
              Consider crop rotation to improve soil health and increase yields by up to 20%!
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsightsWidget;
