import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    // 백엔드 ApiResponse 래핑 해제: { success, data } → data
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('tableInfo');
      window.location.href = '/setup';
    }
    // 백엔드 에러 메시지 추출
    const message = error.response?.data?.message || error.message;
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
