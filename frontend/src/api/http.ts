import axios from 'axios';

const defaultApiUrl = import.meta.env.MODE === 'tauri' ? 'http://localhost:8080' : '';
const apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;

if (apiUrl) {
  axios.defaults.baseURL = apiUrl;
}

export default axios;
