import axios from 'axios';
import BASE_URL from '../../config';

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
    async loginWithCode(login_code, setToken) {
    try {
      const response = await apiService.post('/auth/login-code', {
        login_code,
      });
      console.log("respons login code", response);
      
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

}
export default new AuthService();
