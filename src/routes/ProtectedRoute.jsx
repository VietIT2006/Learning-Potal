import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

// Component này dùng để bọc các route cần bảo vệ
function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, đá về trang login
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    // Nếu yêu cầu admin mà user không phải admin, đá về trang chủ
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Nếu mọi thứ OK, cho phép render component con
}

export default ProtectedRoute;