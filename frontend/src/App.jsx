import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';           // use as route switch for farmer/employee/admin
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';

import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FieldList from './pages/farmer/FieldList';
import FieldForm from './pages/farmer/FieldForm';
import FieldView from './pages/farmer/FieldView';
import CropForm from './pages/farmer/CropForm';
import CropList from './pages/farmer/CropList';
import CropView from './pages/farmer/CropView';
import CropEditForm from './pages/farmer/CropEditForm';
import Predictions from './pages/farmer/Predictions';
import DiseaseDetection from './pages/farmer/DiseaseDetection';
import Settings from './pages/farmer/Settings';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <NavBar />
      <div className="min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main dashboard switch */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Farmer pages */}
          <Route path="/farmer" element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>} />
          <Route path="/my-fields" element={<ProtectedRoute><FieldList /></ProtectedRoute>} />
          <Route path="/my-fields/new" element={<ProtectedRoute><FieldForm mode="create" /></ProtectedRoute>} />
          <Route path="/my-fields/:id" element={<ProtectedRoute><FieldView /></ProtectedRoute>} />
          <Route path="/my-fields/:id/edit" element={<ProtectedRoute><FieldForm mode="edit" /></ProtectedRoute>} />

          {/* Crop data */}
          <Route path="/crops" element={<ProtectedRoute><CropList /></ProtectedRoute>} />
          <Route path="/crops/new" element={<ProtectedRoute><CropForm /></ProtectedRoute>} />
          <Route path="/crops/:id" element={<ProtectedRoute><CropView /></ProtectedRoute>} />
          <Route path="/crops/:id/edit" element={<ProtectedRoute><CropEditForm /></ProtectedRoute>} />

          {/* Predictions, detection, settings */}
          <Route path="/predictions" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
          <Route path="/disease-detection" element={<ProtectedRoute><DiseaseDetection /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Employee/Admin dashboards */}
          <Route path="/employee/dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
