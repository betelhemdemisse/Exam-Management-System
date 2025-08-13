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

class StatisticsService {

    // Get all statistics
    async getstatistics() {
        try {
            const response = await apiService.get('/exams/statistics');
            return response.data;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }
    }



}

export default new StatisticsService();
