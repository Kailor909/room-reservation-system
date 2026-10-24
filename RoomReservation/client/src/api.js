import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7237/api',
});

export default api;