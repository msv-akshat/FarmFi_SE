import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ label = "← Back", className = "", to = null }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (to) {
      // Explicit destination provided
      navigate(to);
    } else {
      // Browser-like back navigation - goes to previous page in history
      navigate(-1);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className={`text-teal-700 px-4 py-1 border border-teal-400 rounded-full font-semibold hover:bg-teal-50 transition ${className}`}
    >
      {label}
    </button>
  );
};

export default BackButton;
