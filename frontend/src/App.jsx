import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';           // use as route switch for farmer/employee/admin
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';

import FarmerDashboard from './pages/FarmerDashboard';
import FieldList from './pages/FieldList';
import FieldForm from './pages/FieldForm';
import FieldView from './pages/FieldView';
// You can add EmployeeDashboard, AdminDashboard, etc. similarly.

function App() {
  return (
    <Router>
      <NavBar />
      <div className="min-h-screen pt-20">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected main switch/dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Farmer nested pages, protected */}
          <Route
            path="/farmer"
            element={
              <ProtectedRoute>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-fields"
            element={
              <ProtectedRoute>
                <FieldList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-fields/new"
            element={
              <ProtectedRoute>
                <FieldForm mode="create" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-fields/:id"
            element={
              <ProtectedRoute>
                <FieldView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-fields/:id/edit"
            element={
              <ProtectedRoute>
                <FieldForm mode="edit" />
              </ProtectedRoute>
            }
          />
          {/* Add similar routes for /predictions, employee/admin pages etc. */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
