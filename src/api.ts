import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const res = await axios.post('http://localhost:3001/api/auth/refresh', { refreshToken });
          
          if (res.data.success) {
            // Cập nhật token mới
            localStorage.setItem('adminToken', res.data.token);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            if (res.data.user) {
                localStorage.setItem('currentUser', JSON.stringify(res.data.user));
            }
            
            // Retry lại request ban đầu với token mới
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh token cũng hết hạn hoặc không hợp lệ -> Logout
          localStorage.removeItem('adminToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('currentUser');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
