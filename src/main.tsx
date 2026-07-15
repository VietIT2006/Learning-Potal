import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './App.css'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> 
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <AppRoutes />
        <SpeedInsights />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);