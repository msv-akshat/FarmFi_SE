import axios from "axios";

const API_URL = 'http://localhost:5000';

export const endpoints = {
    register: `${API_URL}/api/auth/register`,
    login: `${API_URL}/api/auth/login`,
    mandals: `${API_URL}/api/mandals`,
    villagesByMandal: (mandalId) => `${API_URL}/api/mandals/${mandalId}/villages`,
    // --- Farmer endpoints ---
    farmerProfile: `${API_URL}/api/farmer/me`,
    farmerFields: `${API_URL}/api/farmer/fields`,
    farmerField: (id) => `${API_URL}/api/farmer/fields/${id}`
};

export const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// ---- Actual API functions ----
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
