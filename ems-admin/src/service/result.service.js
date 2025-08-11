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

class ExamReportService {

    async exportExamReports(filters = {}) {
        try {
            console.log("📤 Export Exam Reports - Filters Sent:", filters);

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

            console.log("✅ Export request completed, received blob of size:", response.data.size || "unknown");
            return response.data;
        } catch (error) {
            console.error('❌ Error exporting exam reports:', error);
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
            console.error("Error fetching exam results:", error);
            throw error;
        }
    }

}

export default new ExamReportService();
