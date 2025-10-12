const API_URL = 'http://localhost:5000';

export const endpoints = {
    register: `${API_URL}/api/auth/register`,
    login: `${API_URL}/api/auth/login`,
    mandals: `${API_URL}/api/mandals`,
    villagesByMandal: (mandalId) => `${API_URL}/api/mandals/${mandalId}/villages`,
};

export const authHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};