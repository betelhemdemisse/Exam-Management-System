import axios from 'axios';
import BASE_URL from '../../config';

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
class ExamService{
    async importExam(file) {
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
}
export default new ExamService();