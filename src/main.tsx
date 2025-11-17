import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom'; // 1. Import BrowserRouter

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Bọc toàn bộ ứng dụng bằng BrowserRouter */}
    <BrowserRouter> 
      <AuthProvider>
        <CssBaseline />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);