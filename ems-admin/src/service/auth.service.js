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
  // Login method
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

  async logout(setToken) {
    const token = localStorage.getItem("userToken");
    console.log(token);
    if (token) {
      try {
        await apiService.post(
          `/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        localStorage.removeItem("userToken");
        localStorage.removeItem("permissions");
        setToken(null);
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  }
  async changePassword(oldPassword, newPassword, token) {
    try {
      const response = await apiService.post(
        '/auth/change-password',
        {
          oldPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response;
    } catch (error) {
      console.error('Change password failed:', error);
      throw error;
    }
  }
}
export default new AuthService();
