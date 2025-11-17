import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

// Định nghĩa kiểu cho props
interface ProtectedRouteProps {
  adminOnly?: boolean; // Dấu ? nghĩa là optional (không bắt buộc)
}

function ProtectedRoute({ adminOnly = false }: ProtectedRouteProps) {
// ... (phần còn lại giữ nguyên)