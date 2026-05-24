const BASE_URL = 'http://localhost:8080/api';

export const api = {
    // Helper for POST requests (Login, Register, etc.)
    post: async (endpoint, data) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        // Safely parse JSON — server might return empty body or HTML on errors
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
    },

    // Helper for GET requests (Fetching posts, profiles, etc.)
    get: async (endpoint) => {
        const token = localStorage.getItem('token');
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: headers,
        });

        // Safely parse JSON
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
    }
};