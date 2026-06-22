import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

// Định nghĩa kiểu cho props
interface ProtectedRouteProps {
  adminOnly?: boolean; 
  supportOnly?: boolean;
}

function ProtectedRoute({ adminOnly = false, supportOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isSupport } = useAuth();

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, đá về trang login
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    // Nếu yêu cầu admin mà user không phải admin, đá về trang chủ
    return <Navigate to="/" replace />;
  }

  if (supportOnly && !isSupport && !isAdmin) {
    // Nếu yêu cầu support mà không phải support (cho phép admin truy cập)
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Nếu mọi thứ OK, cho phép render component con
}

export default ProtectedRoute;