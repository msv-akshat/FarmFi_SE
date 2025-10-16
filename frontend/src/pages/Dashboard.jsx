import React from 'react';
import FarmerDashboard from './farmer/FarmerDashboard';
import EmployeeDashboard from './employee//EmployeeDashboard';
import AdminDashboard from './admin/AdminDashboard';

const Dashboard = () => {
  const userType = localStorage.getItem('userType');

  if (userType === 'employee') return <EmployeeDashboard />;
  if (userType === 'admin') return <AdminDashboard />;
  // default is farmer
  return <FarmerDashboard />;
};

export default Dashboard;
