// components/dashboard/DashboardCard.jsx
import React from "react";

/**
 * Props:
 * - children: React content to render inside the card
 * - className: optional extra Tailwind/CSS classes
 */
const DashboardCard = ({ children, className = "" }) => (
  <div
    className={`
      bg-gradient-to-br from-white to-gray-50/50 
      rounded-2xl shadow-lg hover:shadow-xl 
      p-6 flex flex-col justify-between h-full min-h-[330px] 
      border border-gray-100
      transition-all duration-300 hover:scale-[1.02]
      ${className}
    `}
    style={{ minWidth: 0 }}
  >
    {children}
  </div>
);

export default DashboardCard;
