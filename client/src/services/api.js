import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const message = error.response.data.error || error.response.data.message || 'Something went wrong';

      // Handle unauthorized (401) - redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // Only redirect if not already on login/signup page
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          window.location.href = '/login';
        }
      }

      // Create a proper error object that preserves response data
      const customError = new Error(message);
      customError.response = error.response;
      return Promise.reject(customError);
    } else if (error.request) {
      // Request made but no response
      const customError = new Error('서버로부터 응답이 없습니다. 네트워크 연결을 확인해주세요.');
      return Promise.reject(customError);
    } else {
      // Error in request setup
      return Promise.reject(error);
    }
  }
);

export default api;
