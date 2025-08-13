import axios from 'axios';
import BASE_URL from '../../config';

const apiService = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

class AuthService {
  async login(email, password, setToken) {
    try {
      const response = await apiService.post('/auth/login', { email, password });

      const accessToken = response?.data?.accessToken;
      const refreshToken = response?.data?.refreshToken;

      if (accessToken && refreshToken) {
        localStorage.setItem('userToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setToken(accessToken);
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(setToken) {
    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        await apiService.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
    localStorage.removeItem("userToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("permissions");
    setToken(null);
  }

  async changePassword(oldPassword, newPassword, token) {
    try {
      return await apiService.post(
        '/auth/change-password',
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Change password failed:', error);
      throw error;
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    try {
      const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const newAccessToken = response?.data?.accessToken;

      if (newAccessToken) {
        localStorage.setItem('userToken', newAccessToken);
        return newAccessToken;
      }
      throw new Error('Failed to refresh token');
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

}

const authService = new AuthService();

// Attach request interceptor to always send the access token
apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Attach response interceptor to auto-refresh on 401
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshToken();
        apiService.defaults.headers['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return apiService(originalRequest);
      } catch (refreshError) {
        console.error('Redirecting to login due to refresh failure');
        authService.logout(() => { });
      }
    }

    return Promise.reject(error);
  }
);

export default authService;
export { apiService };
