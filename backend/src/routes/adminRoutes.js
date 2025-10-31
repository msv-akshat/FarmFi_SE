import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import {
  // Auth
  login,
  
  // Dashboard
  getDashboardStats,
  
  // Employee Management
  getEmployees,
  getEmployeeDetails,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  
  // Farmer Management
  getFarmers,
  getFarmerDetails,
  
  // Fields Management
  getFields,
  getFieldDetails,
  approveField,
  rejectField,
  
  // Crops Management
  getCrops,
  getCropById,
  approveCrop,
  rejectCrop,
  
  // Analytics
  getFieldsAnalytics,
  getCropsAnalytics,
  getDiseaseAnalytics,
  
  // Profile & Settings
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/adminController.js';

const router = express.Router();

// ==================== AUTH ====================
router.post('/login', login);

// ==================== PROTECTED ROUTES ====================
// All routes below require admin authentication

// Dashboard
router.get('/dashboard/stats', adminAuth, getDashboardStats);

// Employee Management
router.get('/employees', adminAuth, getEmployees);
router.get('/employees/:id', adminAuth, getEmployeeDetails);
router.post('/employees', adminAuth, createEmployee);
router.patch('/employees/:id', adminAuth, updateEmployee);
router.delete('/employees/:id', adminAuth, deleteEmployee);

// Farmer Management
router.get('/farmers', adminAuth, getFarmers);
router.get('/farmers/:id', adminAuth, getFarmerDetails);

// Fields Management
router.get('/fields', adminAuth, getFields);
router.get('/fields/:id', adminAuth, getFieldDetails);
router.patch('/fields/:id/approve', adminAuth, approveField);
router.patch('/fields/:id/reject', adminAuth, rejectField);

// Crops Management
router.get('/crops', adminAuth, getCrops);
router.get('/crops/:id', adminAuth, getCropById);
router.patch('/crops/:id/approve', adminAuth, approveCrop);
router.patch('/crops/:id/reject', adminAuth, rejectCrop);

// Analytics
router.get('/analytics/fields', adminAuth, getFieldsAnalytics);
router.get('/analytics/crops', adminAuth, getCropsAnalytics);
router.get('/analytics/diseases', adminAuth, getDiseaseAnalytics);

// Profile & Settings
router.get('/profile', adminAuth, getProfile);
router.patch('/profile', adminAuth, updateProfile);
router.post('/profile/change-password', adminAuth, changePassword);

export default router;
