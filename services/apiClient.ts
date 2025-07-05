import axios from 'axios';

// Create separate clients for different APIs
const backendClient = axios.create({
  baseURL: 'https://oppotunitieshubbackend.onrender.com/api',
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

// Export the main client (backend) as default
const apiClient = backendClient;

// Export WordPress client for posts
export { wordpressClient };

export default apiClient; 