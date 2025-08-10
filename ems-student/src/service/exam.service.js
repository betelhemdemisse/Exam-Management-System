import axios from 'axios';
import BASE_URL from '../../config';

// Create an axios instance
const apiService = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Add token interceptor
apiService.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class ExamService {
  // Create an exam
  async createExam(data) {
    try {
      console.log("Sending createExam payload:", data); // Log the request payload

      const response = await apiService.post('/exams', data, {
        headers: {
          'Content-Type': 'application/json', // Ensure proper content type
        },
      });

      console.log("Exam created successfully:", response.data); // Log the success response
      return response.data;
    } catch (error) {
      if (error.response) {
        // Backend responded with a status code outside 2xx
        console.error("Backend error response status:", error.response.status);
        console.error("Backend error response data:", error.response.data);
      } else if (error.request) {
        // Request made but no response received
        console.error("No response received:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error creating exam:", error.message);
      }
      throw error;
    }
  }

  // List my exams
  async getMyExams() {
    try {
      const response = await apiService.get('/exams');
      return response.data;
    } catch (error) {
      console.error("Error fetching exams:", error);
      throw error;
    }
  }

  async getExamById(examID) {
    try {
      const response = await apiService.get(`/exams/${examID}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching exam ${examID}:`, error);
      throw error;
    }
  }

  // Save/update an answer (draft)
  async saveAnswer(examID, answerData) {
    try {
      const response = await apiService.post(
        `/api/exams/${examID}/answer`,
        answerData
      );
      return response.data;
    } catch (error) {
      console.error(`Error saving answer for exam ${examID}:`, error);
      throw error;
    }
  }

  // Get exam progress and time left
  async getExamProgress(examID) {
    try {
      const response = await apiService.get(`/api/exams/${examID}/progress`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching progress for exam ${examID}:`, error);
      throw error;
    }
  }

  // Submit the exam
  async submitExam(examID) {
    try {
      const response = await apiService.post(`/api/exams/${examID}/submit`);
      return response.data;
    } catch (error) {
      console.error(`Error submitting exam ${examID}:`, error);
      throw error;
    }
  }

  // Get result for a submitted exam
  async getExamResult(examID) {
    try {
      const response = await apiService.get(`/api/exams/${examID}/result`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching result for exam ${examID}:`, error);
      throw error;
    }
  }
}

export default new ExamService();

