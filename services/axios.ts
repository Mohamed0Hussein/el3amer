import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

/**
 * Axios Configuration for React Native
 * 
 * IMPORTANT: In React Native, 'localhost' won't work!
 * You need to use your machine's actual IP address.
 * 
 * To find your IP:
 * - Windows: Open CMD and run `ipconfig` (look for IPv4 Address)
 * - Mac/Linux: Open Terminal and run `ifconfig` or `ip addr`
 * 
 * Configuration options:
 * 1. Set environment variable: EXPO_PUBLIC_API_URL=http://192.168.1.xxx:3000
 *    (Replace xxx with your actual IP)
 * 2. Or update the default value below with your IP
 * 
 * Example: 'http://192.168.1.100:3000'
 */
const API_BASE_URL =  'https://primacy-backend.vercel.app';

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token if available
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const rawUser = await AsyncStorage.getItem('@auth:user');
      if (rawUser) {
        const user = JSON.parse(rawUser);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (e) {
      console.error('Error reading auth token from storage', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    } else {
      // Handle HTTP errors
      const status = error.response.status;
      switch (status) {
        case 401:
          error.message = 'Unauthorized. Please login again.';
          break;
        case 403:
          error.message = 'Forbidden. You do not have access.';
          break;
        case 404:
          error.message = 'Resource not found.';
          break;
        case 500:
          error.message = 'Server error. Please try again later.';
          break;
        default:
          error.message = error.response.data?.message || error.message || 'An error occurred';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

