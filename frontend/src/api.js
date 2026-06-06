// Vite exposes environment variables through import.meta.env
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const request = async (endpoint, method, data = null) => {
    const token = localStorage.getItem('token');
    const headers = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (data) {
        // NEW LOGIC: Check if the data contains files (FormData)
        if (data instanceof FormData) {
            // DO NOT set Content-Type! 
            // The browser will automatically set it to 'multipart/form-data' 
            // and attach the required security boundaries.
            config.body = data;
        } else {
            // Standard text/JSON request
            headers['Content-Type'] = 'application/json';
            config.body = JSON.stringify(data);
        }
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    let responseData = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
    }

    if (!response.ok) {
        throw new Error(
            (responseData && responseData.message)
                ? responseData.message
                : `Server error: ${response.status}`
        );
    }

    return responseData;
};

export const api = {
    get: (endpoint) => request(endpoint, 'GET'),
    post: (endpoint, data) => request(endpoint, 'POST', data),
    put: (endpoint, data) => request(endpoint, 'PUT', data),
    delete: (endpoint) => request(endpoint, 'DELETE')
};