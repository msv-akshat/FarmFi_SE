import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import FieldsList from './pages/FieldsList'
import AddField from './pages/AddField'
import CropsList from './pages/CropsList'
import AddCrop from './pages/AddCrop'
import FieldView from './pages/FieldView'
import CropView from './pages/CropView'
import DiseaseDetection from './pages/DiseaseDetection'
import PredictionsList from './pages/PredictionsList'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PendingFields from './pages/PendingFields'
import ExcelUpload from './pages/ExcelUpload'
import UploadedCrops from './pages/UploadedCrops'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeManagement from './pages/EmployeeManagement'
import EmployeeDetails from './pages/EmployeeDetails'
import FarmerManagement from './pages/FarmerManagement'
import FarmerDetails from './pages/FarmerDetails'
import FieldsCropsManagement from './pages/FieldsCropsManagement'
import FieldDetails from './pages/FieldDetails'
import CropDetails from './pages/CropDetails'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminSettings from './pages/AdminSettings'
import ProtectedRoute from './components/ProtectedRoute'
import Toast from './components/Toast'
import { setToastCallback } from './utils/toast'

function App() {
  const [toast, setToast] = useState(null);

  // Set up global toast callback
  useEffect(() => {
    setToastCallback((message, type, duration) => {
      setToast({ message, type, duration });
    });
  }, []);

  return (
    <>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <Toaster position="top-right" />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/fields" 
        element={
          <ProtectedRoute>
            <FieldsList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/fields/new" 
        element={
          <ProtectedRoute>
            <AddField />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/fields/:id" 
        element={
          <ProtectedRoute>
            <FieldView />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/crops" 
        element={
          <ProtectedRoute>
            <CropsList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/crops/new" 
        element={
          <ProtectedRoute>
            <AddCrop />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/crops/:id" 
        element={
          <ProtectedRoute>
            <CropView />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/detection" 
        element={
          <ProtectedRoute>
            <DiseaseDetection />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/predictions" 
        element={
          <ProtectedRoute>
            <PredictionsList />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />

      {/* Employee Routes */}
      <Route 
        path="/employee/dashboard" 
        element={
          <ProtectedRoute>
            <EmployeeDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employee/fields/pending" 
        element={
          <ProtectedRoute>
            <PendingFields />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employee/crops/upload" 
        element={
          <ProtectedRoute>
            <ExcelUpload />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/employee/crops/uploaded" 
        element={
          <ProtectedRoute>
            <UploadedCrops />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/employees" 
        element={
          <ProtectedRoute>
            <EmployeeManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/farmers" 
        element={
          <ProtectedRoute>
            <FarmerManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/farmers/:id" 
        element={
          <ProtectedRoute>
            <FarmerDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/employees/:id" 
        element={
          <ProtectedRoute>
            <EmployeeDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/fields" 
        element={
          <ProtectedRoute>
            <FieldsCropsManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/fields/:id" 
        element={
          <ProtectedRoute>
            <FieldDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/crops/:id" 
        element={
          <ProtectedRoute>
            <CropDetails />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/analytics/:type" 
        element={
          <ProtectedRoute>
            <AdminAnalytics />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute>
            <AdminSettings />
          </ProtectedRoute>
        } 
      />
    </Routes>
    </>
  )
}

export default App
