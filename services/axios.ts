import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

/**
 * Base URL from `EXPO_PUBLIC_API_URL` or `expo.extra.apiUrl` (see `config/env.ts`).
 * On device, use your LAN IP instead of localhost.
 */
const axiosInstance = axios.create({
  baseURL: `${env.apiOrigin}/api/v1`,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token if available
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const rawUser = await AsyncStorage.getItem(STORAGE_KEYS.authUser);
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

