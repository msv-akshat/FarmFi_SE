// components/dashboard/DashboardCard.jsx
import React from "react";

/**
 * Props:
 * - children: React content to render inside the card
 * - className: optional extra Tailwind/CSS classes
 */
const DashboardCard = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl shadow p-5 flex flex-col justify-between h-full min-h-[330px] ${className}`}
    style={{ minWidth: 0 }}
  >
    {children}
  </div>
);

export default DashboardCard;
