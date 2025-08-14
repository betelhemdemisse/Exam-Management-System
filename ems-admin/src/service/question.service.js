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
      return response.data;
    } catch (error) {
      throw error;
    }
  }

    // Create a new question with choices and correct answers
  async createQuestion(questionData) {
    try {
      const response = await apiService.post('/questions', questionData);
      return response.data;
    } catch (error) {
      console.error('Error creating question:', error);
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

    // Get a specific question by ID
  async getQuestionById(id) {
    try {
      const response = await apiService.get(`/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching question with ID ${id}:`, error);
      throw error;
    }
  }

  // Update a question and its choices/correct answers
  async updateQuestion(id, updatedData) {
    try {
      const response = await apiService.patch(`/questions/${id}`, updatedData);
      return response.data;
    } catch (error) {
      console.error(`Error updating question with ID ${id}:`, error);
      throw error;
    }
  }

   // Delete a question and all related data
  async deleteQuestion(id) {
    try {
      const response = await apiService.delete(`/questions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting question with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new QuestionService();
