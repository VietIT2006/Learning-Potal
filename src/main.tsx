import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { CssBaseline } from '@mui/material'; // Giúp chuẩn hóa CSS trên các trình duyệt

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Bọc toàn bộ App bằng AuthProvider để mọi component đều có thể
        truy cập thông tin đăng nhập */}
    <AuthProvider>
      <CssBaseline /> {/* Thêm dòng này */}
      <AppRoutes />
    </AuthProvider>
  </React.StrictMode>
);