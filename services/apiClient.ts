import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Create separate clients for different APIs
const backendClient = axios.create({
  baseURL: 'https://oppotunitieshubbackend-s4y2.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

const wordpressClient = axios.create({
  baseURL: 'https://opportunitieshub.ng/wp-json/wp/v2',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Add request interceptor to include auth token
backendClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error adding auth token to request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
backendClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const response = await backendClient.post('/auth/refresh', {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Ensure tokens are strings before storing
          await SecureStore.setItemAsync('accessToken', String(accessToken));
          await SecureStore.setItemAsync('refreshToken', String(newRefreshToken));

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return backendClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('userInfo');
        console.error('Token refresh failed:', refreshError);
        
        // Don't retry the original request to prevent infinite loops
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Export the main client (backend) as default
const apiClient = backendClient;

// Export WordPress client for posts
export { wordpressClient };

export default apiClient; 