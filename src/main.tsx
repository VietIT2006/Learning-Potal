import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import './App.css'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> 
      <AuthProvider>
        {/* CssBaseline của MUI có thể reset style, nếu thấy xung đột bạn có thể thử bỏ dòng này */}
        <CssBaseline /> 
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);