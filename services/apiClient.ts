import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://oppotunitieshubbackend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased timeout for potentially slow network
});

export default apiClient; 