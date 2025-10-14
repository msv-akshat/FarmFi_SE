import React from 'react';
import FarmerDashboard from './FarmerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const userType = localStorage.getItem('userType');

  if (userType === 'employee') return <EmployeeDashboard />;
  if (userType === 'admin') return <AdminDashboard />;
  // default is farmer
  return <FarmerDashboard />;
};

export default Dashboard;
