const BASE_URL = 'http://localhost:8080/api';

const request = async (endpoint, method, data = null) => {
    const token = localStorage.getItem('token');
    const headers = {};

    if (data) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
    };

    if (data) {
        config.body = JSON.stringify(data);
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