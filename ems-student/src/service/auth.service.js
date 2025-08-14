import axios from 'axios';
import BASE_URL from '../../config';

const apiService = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class AuthService {

    async login(email, login_code, setToken) {

    try {
      const response = await apiService.post('/auth/login-code', {
        email,
        login_code,
      });
      const token = response?.data?.accessToken;
      if (token) {
        localStorage.setItem('userToken', token);
        setToken(token);
      }
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }
  async loginWithCode(login_code, email, setToken) {
    try {
      const response = await apiService.post('/auth/login-code', {
        login_code,
        email,
      });

      const token = response?.data?.accessToken;
      if (token) {
        localStorage.setItem('userToken', token);
        setToken(token);
      }
      return response;
    } catch (error) {
      console.error('Login with code failed:', error);
      throw error;
    }
  }
  async getCurrentUser() {
    try {
      const response = await apiService.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
}
export default new AuthService();
