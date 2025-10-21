import React from 'react';
import { User, MapPin, Sun, Edit3, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfileSummary = ({ farmer }) => {
  return (
    <section className="w-full bg-gradient-to-br from-white via-green-50/30 to-teal-50/50 rounded-xl shadow-xl p-7 border border-green-200">
      <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">Welcome back,</div>
              <div className="text-2xl font-bold bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent">
                {farmer.name}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-green-200 shadow-sm">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-sm">
                <span className="text-gray-500">Village:</span>{' '}
                <span className="font-semibold text-gray-700">{farmer.village_id}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-green-200 shadow-sm">
              <span className="text-sm">
                <span className="text-gray-500">Mandal:</span>{' '}
                <span className="font-semibold text-gray-700">{farmer.mandal_id}</span>
              </span>
            </div>
          </div>
          
          <Link 
            to="/profile" 
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm font-semibold"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>

        {/* Weather Widget */}
        <div className="relative overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-2xl p-5 shadow-xl min-w-[200px] group hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <Sun className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <div className="text-white/90 text-sm font-medium">Today's Weather</div>
                <div className="text-3xl font-bold text-white">28°C</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-white/90">
              <Cloud className="w-5 h-5" />
              <span className="text-sm font-semibold">Partly Cloudy</span>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSummary;
