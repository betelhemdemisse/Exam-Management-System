import axios from 'axios';
import BASE_URL from '../../config';

// Create an axios instance
const apiService = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
class AuthService {
    async login(email, password, setToken) {
    try {
      const response = await apiService.post('/auth/login', {
        email,
        password,
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

}
export default new AuthService();
