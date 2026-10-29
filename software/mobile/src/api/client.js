import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default host: 10.0.2.2 for Android Studio Emulator, localhost for iOS / Web
export const DEFAULT_API_HOST = 'http://10.0.2.2:5000';

const api = axios.create({
  baseURL: `${DEFAULT_API_HOST}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const updateApiBaseUrl = (newHost) => {
  const host = newHost.trim().replace(/\/$/, '');
  api.defaults.baseURL = `${host}/api`;
};

// Initialize stored host if customized
AsyncStorage.getItem('mobile_api_host').then((stored) => {
  if (stored) {
    updateApiBaseUrl(stored);
  }
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('mobile_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
