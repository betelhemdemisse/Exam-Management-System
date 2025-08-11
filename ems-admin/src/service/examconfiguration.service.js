import axios from 'axios';
import BASE_URL from '../../config';

// Create an axios instance
const apiService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach Bearer token from localStorage if available
apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class ExamConfigurationService {
  async createExamConfiguration(examConfigData) {
    try {
      const response = await apiService.post('/exam-configurations', examConfigData);
      return response.data;
    } catch (error) {
      console.error('Error creating exam configuration:', error);
      throw error;
    }
  }

  async getAllExamConfigurations() {
    try {
      const response = await apiService.get('/exams/configs');
      return response.data;
    } catch (error) {
      console.error('Error fetching exam configurations:', error);
      throw error;
    }
  }

  async getExamConfigurationById(id) {
    try {
      const response = await apiService.get(`/exam-configurations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching exam configuration with ID ${id}:`, error);
      throw error;
    }
  }

  async updateExamConfiguration(id, examConfigData) {
    try {
      const response = await apiService.put(`/exam-configurations/${id}`, examConfigData);
      return response.data;
    } catch (error) {
      console.error(`Error updating exam configuration with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteExamConfiguration(id) {
    try {
      const response = await apiService.delete(`/exam-configurations/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting exam configuration with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new ExamConfigurationService();
