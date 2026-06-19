import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> 
      <AuthProvider>
        <CssBaseline /> 
        <Toaster position="top-right" reverseOrder={false} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);