import axios from "axios";

const API_URL = 'http://localhost:5000';

export const endpoints = {
  register: `${API_URL}/api/auth/register`,
  login: `${API_URL}/api/auth/login`,
  mandals: `${API_URL}/api/mandals`,
  villagesByMandal: (mandalId) => `${API_URL}/api/mandals/${mandalId}/villages`,
  farmerProfile: `${API_URL}/api/farmer/me`,
  farmerFields: `${API_URL}/api/fields`,
  farmerField: (id) => `${API_URL}/api/fields/${id}`,
  crops: `${API_URL}/api/crops`,
  crop: (id) => `${API_URL}/api/crops/${id}`,
  cropsCatalog: `${API_URL}/api/crop-types`,
    // Disease detection endpoints
  verifiedFields: `${API_URL}/api/fields/verified`,
  uploadImageAndPredict: `${API_URL}/api/images/upload-and-predict`,
  predictionHistory: `${API_URL}/api/images/history`,
};

export const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const fetchFarmerProfile = async () =>
  axios.get(endpoints.farmerProfile, { headers: authHeader() });

export const fetchFarmerFields = async () =>
  axios.get(endpoints.farmerFields, { headers: authHeader() });

export const createFarmerField = async (data) =>
  axios.post(endpoints.farmerFields, data, { headers: authHeader() });

export const updateFarmerField = async (id, data) =>
  axios.put(endpoints.farmerField(id), data, { headers: authHeader() });

export const deleteFarmerField = async (id) =>
  axios.delete(endpoints.farmerField(id), { headers: authHeader() });

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

// Get verified fields (for dropdown)
export const fetchVerifiedFields = async () =>
  axios.get(endpoints.verifiedFields, { headers: authHeader() });

// Upload image and get prediction
export const uploadImageAndPredict = async (fieldId, imageFile) => {
  const formData = new FormData();
  formData.append('field_id', fieldId);
  formData.append('image', imageFile);
  return axios.post(endpoints.uploadImageAndPredict, formData, {
    headers: {
      ...authHeader(),
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Get prediction history
export const fetchPredictionHistory = async () =>
  axios.get(endpoints.predictionHistory, { headers: authHeader() });