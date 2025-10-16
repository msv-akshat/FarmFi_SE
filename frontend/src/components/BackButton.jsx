import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ label = "← Back", className = "" }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={`text-teal-700 px-4 py-1 border border-teal-400 rounded-full font-semibold hover:bg-teal-50 transition ${className}`}
    >
      {label}
    </button>
  );
};

export default BackButton;
