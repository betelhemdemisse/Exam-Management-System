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

class UserService {
  // Import users from a parsed JSON array
  async importUsers(usersArray) {
    try {
      const response = await apiService.post('/users/import', usersArray, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get all users
  async getUsers() {
    try {
      const response = await apiService.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
  async exportUsers(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.examStatus) {
        params.append("examStatus", filters.examStatus); // match backend param name
      }

      const response = await apiService.get(`/users/export?${params.toString()}`, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  }





  // Create a new user
  async createUser(userData) {
    try {
      const response = await apiService.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get a user by ID
  async getUserById(id) {
    try {
      const response = await apiService.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  }

  // Update a user by ID
  async updateUser(id, userData) {
    try {
      const response = await apiService.patch(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  }

  // Delete a user by ID
  async deleteUser(id) {
    try {
      const response = await apiService.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }

  async allowRetake(userId, allowRetake) {
    try {
      const payload = { userId, allowRetake };
      const response = await apiService.post('/users/allow-retake', payload);
      return response.data;
    } catch (error) {
      console.error('Error allowing retake:', error);
      throw error;
    }
  }



}

export default new UserService();