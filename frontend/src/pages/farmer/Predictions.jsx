import React from 'react';
import BackButton from '../../components/BackButton';

const Predictions = () => {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 to-teal-50 flex justify-center items-start">
      <div className="bg-white rounded-xl shadow p-8 mt-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">Yield Predictions</h1>
          <BackButton />
        </div>
        <div className="text-gray-700 mb-5">
          Get smarter! In the future, you’ll see field-by-field yield forecasts, farming insights and suggestions based on your data.
        </div>
        <div className="bg-blue-50 text-blue-800 text-sm rounded p-4">
          Demo: This page will soon display yield predictions, trends and graphs for your fields. Stay tuned!
        </div>
      </div>
    </div>
  );
};

export default Predictions;
