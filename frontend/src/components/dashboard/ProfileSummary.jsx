import React from 'react';
import { User, MapPin, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileSummary = ({ farmer }) => {
  return (
    <section className="w-full bg-white rounded-lg shadow-lg p-7">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-12">
        <div>
          <div className="flex items-center text-2xl font-bold text-green-700 gap-2">
            <User /> Hi, {farmer.name}
          </div>
          <div className="mt-2 text-gray-600 flex gap-6">
            <span className="flex items-center gap-1">
              <MapPin className="w-5 h-5" />Village: {farmer.village_id}
            </span>
            <span className="flex items-center gap-1">Mandal: {farmer.mandal_id}</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            Your profile <Link to="/profile" className="underline text-teal-700">[edit]</Link>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-50 to-teal-100 rounded-xl flex items-center gap-3 px-4 py-3 border border-green-100">
          <Sun className="w-6 h-6 text-yellow-500" />
          <div>
            <div className="text-gray-600 text-sm">Weather Today</div>
            <div className="text-lg font-bold text-green-700">28°C, Cloudy</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSummary;
