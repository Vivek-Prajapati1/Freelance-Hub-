import axios from 'axios';

// Add a request interceptor
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // If unauthorized, clear token and redirect to login
            localStorage.removeItem('adminToken');
            window.location.href = '/admin';
        }
        return Promise.reject(error);
    }
); 