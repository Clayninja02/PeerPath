const BASE_URL = 'http://localhost:8080/api';

export const api = {
    // Helper for POST requests (Login, Register, etc.)
    post: async (endpoint, data) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // If we have a JWT token stored, automatically attach it as a Bearer token!
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
        });

        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.message || 'Something went wrong');
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

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to fetch data');
        }

        return responseData;
    }
};