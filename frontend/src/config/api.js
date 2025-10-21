import axios from "axios";

const API_URL = 'http://localhost:5000';

// Helper: Generates auth header if token present
export const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// API endpoints object (all routes grouped)
export const endpoints = {
  // Authentication
  register: `${API_URL}/api/auth/register`,
  login: `${API_URL}/api/auth/login`,

  // Location
  mandals: `${API_URL}/api/mandals`,
  villagesByMandal: (mandalId) => `${API_URL}/api/mandals/${mandalId}/villages`,

  // Farmer Profile & Fields
  farmerProfile: `${API_URL}/api/farmer/me`,
  farmerFields: `${API_URL}/api/fields`,
  farmerField: (id) => `${API_URL}/api/fields/${id}`,

  // Crops
  crops: `${API_URL}/api/crops`,
  crop: (id) => `${API_URL}/api/crops/${id}`,
  cropsCatalog: `${API_URL}/api/crop-types`,

  // Fields - extra
  verifiedFields: `${API_URL}/api/fields/verified`,

  // Disease detection/images
  uploadImageAndPredict: `${API_URL}/api/images/upload-and-predict`,
  predictionHistory: `${API_URL}/api/images/history`,

  // Analytics endpoints (dashboard charts)
  cropDistribution: `${API_URL}/api/analytics/crop-distribution`,
  fieldSizeByCrop: `${API_URL}/api/analytics/field-size-by-crop`,
  fieldStatusBreakdown: `${API_URL}/api/analytics/status-breakdown`,
  areaDistribution: `${API_URL}/api/analytics/area-distribution`,
  
  // Detailed analytics endpoints
  detailedCropAnalytics: `${API_URL}/api/analytics/detailed-crop-analytics`,
  detailedFieldAreaAnalytics: `${API_URL}/api/analytics/detailed-field-area-analytics`,
  detailedFieldStatusAnalytics: `${API_URL}/api/analytics/detailed-field-status-analytics`
};

// Auth
export const fetchFarmerProfile = async () =>
  axios.get(endpoints.farmerProfile, { headers: authHeader() });

// Fields
export const fetchFarmerFields = async () =>
  axios.get(endpoints.farmerFields, { headers: authHeader() });
export const createFarmerField = async (data) =>
  axios.post(endpoints.farmerFields, data, { headers: authHeader() });
export const updateFarmerField = async (id, data) =>
  axios.put(endpoints.farmerField(id), data, { headers: authHeader() });
export const deleteFarmerField = async (id) =>
  axios.delete(endpoints.farmerField(id), { headers: authHeader() });
export const fetchVerifiedFields = async () =>
   axios.get(endpoints.verifiedFields, { headers: authHeader() });

// Crop CRUD
export const fetchCropData = async () =>
  axios.get(endpoints.crops, { headers: authHeader() });
export const createCropData = async (data) =>
  axios.post(endpoints.crops, data, { headers: authHeader() });
export const fetchSingleCrop = (id) =>
  axios.get(`${endpoints.crops}/${id}`, { headers: authHeader() });
export const updateCropData = (id, data) =>
  axios.put(`${endpoints.crops}/${id}`, data, { headers: authHeader() });
export const deleteCrop = (id) =>
  axios.delete(`${endpoints.crops}/${id}`, { headers: authHeader() });

// Location
export const fetchMandals = async () =>
  axios.get(endpoints.mandals, { headers: authHeader() });
export const fetchVillagesByMandal = async (mandalId) =>
  axios.get(endpoints.villagesByMandal(mandalId), { headers: authHeader() });

// Crop catalog/types
export const fetchCropCatalog = async () =>
  axios.get(endpoints.cropsCatalog, { headers: authHeader() });

// Images/disease detection
export const uploadImageAndPredict = async (fieldId, imageFile, cropId = null) => {
  const formData = new FormData();
  formData.append('field_id', fieldId);
  formData.append('image', imageFile);
  if (cropId) {
    formData.append('crop_id', cropId);
  }
  return axios.post(endpoints.uploadImageAndPredict, formData, {
    headers: {
      ...authHeader(),
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const fetchPredictionHistory = async () =>
  axios.get(endpoints.predictionHistory, { headers: authHeader() });

// === Dashboard Analytics API ===
export const fetchCropDistribution = async () =>
  axios.get(endpoints.cropDistribution, { headers: authHeader() });

export const fetchFieldSizeByCrop = async () =>
  axios.get(endpoints.fieldSizeByCrop, { headers: authHeader() });

export const fetchFieldStatusBreakdown = async () =>
  axios.get(endpoints.fieldStatusBreakdown, { headers: authHeader() });

export const fetchAreaDistribution = async () =>
  axios.get(endpoints.areaDistribution, { headers: authHeader() });

// === Detailed Analytics API ===
export const fetchDetailedCropAnalytics = async () =>
  axios.get(endpoints.detailedCropAnalytics, { headers: authHeader() });

export const fetchDetailedFieldAreaAnalytics = async () =>
  axios.get(endpoints.detailedFieldAreaAnalytics, { headers: authHeader() });

export const fetchDetailedFieldStatusAnalytics = async () =>
  axios.get(endpoints.detailedFieldStatusAnalytics, { headers: authHeader() });
