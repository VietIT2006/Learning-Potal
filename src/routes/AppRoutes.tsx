import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Layouts ---
import MainLayout from '../layouts/MainLayout'; 
import AdminLayout from '../layouts/AdminLayout';

// --- Pages (Người dùng) ---
import HomePage from '../pages/Home';
import CoursesPage from '../pages/Courses';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register'; 
import ForgotPasswordPage from '../pages/ForgotPassword';
import Profile from '../pages/Profile';
import Wallet from '../pages/Wallet';
import CourseDetailPage from '../pages/CourseDetail';
import WatchCoursePage from '../pages/WatchCourse';
import QuizPage from '../pages/Quiz';
import PaymentResult from '../pages/PaymentResult'; 

// --- Pages (Admin) ---
import Dashboard from '../pages/Admin/Dashboard';
import CourseManagement from '../pages/Admin/CourseManagement';
import CourseContent from '../pages/Admin/CourseContent';
import StudentManagement from '../pages/Admin/StudentManagement';
import SettingsPage from '../pages/Admin/Settings'; 
import Analytics from '../pages/Admin/Analytics'; 

// --- Logic bảo vệ Route ---
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      
      {/* =========================================
          TRANG TOÀN MÀN HÌNH (Không có Navbar/Footer)
      ========================================= */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* =========================================
          LUỒNG 1: NGƯỜI DÙNG (Có Navbar & Footer)
      ========================================= */}
      <Route path="/" element={<MainLayout />}>
        {/* Các trang công khai */}
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="course/:id" element={<CourseDetailPage />} />
        <Route path="payment-result" element={<PaymentResult />} />

        {/* Các trang cần đăng nhập (User) */}
        <Route element={<ProtectedRoute />}>
          <Route path="watch/:courseId/lesson/:lessonId" element={<WatchCoursePage />} />
          <Route path="quiz/:quizId" element={<QuizPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="wallet" element={<Wallet />} />
        </Route>
      </Route>

      {/* =========================================
          LUỒNG 2: QUẢN TRỊ VIÊN (Admin)
      ========================================= */}
      <Route path="/admin" element={<ProtectedRoute adminOnly={true} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="courses/:id/content" element={<CourseContent />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default AppRoutes;