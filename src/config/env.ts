const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const STORAGE_BASE_URL = API_URL.replace('/api', '') + '/storage/';
export default API_URL;
