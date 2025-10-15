import React from 'react';

const StatCard = ({ title, stat, icon, bgColor = "bg-white" }) => {
  return (
    <div className={`${bgColor} rounded-lg shadow p-4 flex items-center gap-3`}>
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{stat}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  );
};

export default StatCard;
