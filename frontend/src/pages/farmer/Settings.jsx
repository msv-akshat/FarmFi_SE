import React from 'react';

const Settings = () => {
  return (
    <div className="min-h-screen pt-20 bg-gray-50 flex justify-center items-start">
      <div className="bg-white rounded-xl shadow p-8 mt-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-teal-700 mb-6">Settings</h1>
        <div className="space-y-4 text-gray-700">
          <div>🔒 <strong>Change Password</strong> [feature coming soon]</div>
          <div>🔔 <strong>Notification Preferences</strong> [feature coming soon]</div>
          <div>🌐 <strong>Language</strong> [feature coming soon]</div>
          <div>ℹ️ <strong>About FarmFi</strong> <div className="text-xs mt-1">FarmFi connects farmers with field management, predictions and more. Version 1.0.0</div></div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
