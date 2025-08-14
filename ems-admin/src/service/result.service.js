import axios from 'axios';
import BASE_URL from '../../config';

let refreshTimeout = null;

// Create axios instance
const apiService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to attach access token
apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle 401 errors
apiService.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const newToken = await refreshAccessToken();
        if (!newToken) return Promise.reject(error);

        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios(error.config); // Retry original request
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const REFRESH_INTERVAL = 23 * 60 * 60 * 1000; 

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    logout();
    return null;
  }

  try {
    const { data } = await axios.post(
      `${BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken },
      { withCredentials: true }
    );

    if (data?.accessToken) {
      localStorage.setItem('userToken', data.accessToken);
      scheduleTokenRefresh();
      return data.accessToken;
    }

    logout();
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    logout();
    return null;
  }
}

function scheduleTokenRefresh() {
  if (refreshTimeout) clearTimeout(refreshTimeout);
  refreshTimeout = setTimeout(refreshAccessToken, REFRESH_INTERVAL);
}

function logout() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('refreshToken');
  if (refreshTimeout) clearTimeout(refreshTimeout);
  window.location.href = '/sign-in';
}

if (localStorage.getItem('userToken')) scheduleTokenRefresh();

class ExamReportService {

  async exportExamReports(filters = {}) {
    try {

      const response = await apiService.get('/exams/export', {
        params: {
          status: filters.status || '',
          company: filters.company || '',
          region: filters.region || '',
          gender: filters.gender || '',
          startDate: filters.startDate || '',
          endDate: filters.endDate || '',
        },
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('❌ Error exporting exam reports:', error.response || error.message);
      throw error;
    }
  }

  async getAllExamResults(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.company) params.append("company", filters.company);
      if (filters.region) params.append("region", filters.region);
      if (filters.gender) params.append("gender", filters.gender);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await apiService.get(`/exams/results?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching exam results:", error.response || error.message);
      throw error;
    }
  }
}

export default new ExamReportService();
