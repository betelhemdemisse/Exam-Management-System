import axios from 'axios';
import BASE_URL from '../../config';

// Create an axios instance
const apiService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});

apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class QuestionService {
  async importQuestions(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiService.post('/questions/import', formData, {
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
  async getQuestions(){
    try {
      const response = await apiService.get('/questions');
      return response.data;
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  }
}

export default new QuestionService();
