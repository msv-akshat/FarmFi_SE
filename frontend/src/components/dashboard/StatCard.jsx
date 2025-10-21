import React from 'react';

const StatCard = ({ title, stat, icon, bgColor = "bg-white", gradient = "" }) => {
  return (
    <div className={`
      ${gradient || bgColor} 
      rounded-xl shadow-lg hover:shadow-xl 
      transition-all duration-300 hover:scale-105 
      p-6 flex items-center gap-4 
      border border-gray-100 
      relative overflow-hidden
      group
    `}>
      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon container with gradient background */}
      <div className="relative flex-shrink-0 p-3 rounded-xl bg-white/80 shadow-md backdrop-blur-sm">
        <div className="transform transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>
      
      {/* Stats content */}
      <div className="relative">
        <div className="text-3xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {stat}
        </div>
        <div className="text-sm font-semibold text-gray-600 mt-1 uppercase tracking-wide">
          {title}
        </div>
      </div>
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full opacity-50" />
    </div>
  );
};

export default StatCard;
