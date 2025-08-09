import axios from 'axios';
import BASE_URL from '../../config';

// Create an axios instance
const apiService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ✅ Corrected spelling
});

// Optional: attach token if you use Bearer tokens (e.g., with Sanctum)
apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class UserService {
  async importUsers(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiService.post('/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log("response",response)
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  async getUsers(){
    try {
      const response = await apiService.get('/users');
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }
}

export default new UserService();
