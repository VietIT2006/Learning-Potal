import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Layouts ---
import MainLayout from '../layouts/MainLayout'; 
import AdminLayout from '../layouts/AdminLayout';

// --- Pages (Người dùng) ---
import HomePage from '../pages/Home';
import CoursesPage from '../pages/Courses';
import LoginPage from '../pages/Login';
import CourseDetailPage from '../pages/CourseDetail';
import WatchCoursePage from '../pages/WatchCourse';
import QuizPage from '../pages/Quiz';

// --- Pages (Admin) ---
import Dashboard from '../pages/Admin/Dashboard';
import CourseManagement from '../pages/Admin/CourseManagement';
import CourseContent from '../pages/Admin/CourseContent'; // IMPORT TRANG MỚI
import StudentManagement from '../pages/Admin/StudentManagement';
import SettingsPage from '../pages/Admin/Settings'; 

// --- Logic bảo vệ Route ---
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      
      {/* =========================================
          LUỒNG 1: NGƯỜI DÙNG (User / Guest)
          Sử dụng MainLayout (Navbar ngang, Footer)
      ========================================= */}
      <Route path="/" element={<MainLayout />}>
        {/* Các trang công khai */}
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="course/:id" element={<CourseDetailPage />} />

        {/* Các trang cần đăng nhập (User) */}
        <Route element={<ProtectedRoute />}>
          <Route path="watch/:courseId/lesson/:lessonId" element={<WatchCoursePage />} />
          <Route path="quiz/:quizId" element={<QuizPage />} />
        </Route>
      </Route>


      {/* =========================================
          LUỒNG 2: QUẢN TRỊ VIÊN (Admin)
          Sử dụng AdminLayout (Sidebar dọc, Header riêng)
      ========================================= */}
      <Route path="/admin" element={<ProtectedRoute adminOnly={true} />}>
        <Route element={<AdminLayout />}>
          
          {/* Dashboard Thống kê */}
          <Route index element={<Dashboard />} />
          
          {/* Quản lý Khóa học */}
          <Route path="courses" element={<CourseManagement />} />
          
          {/* ROUTE MỚI: Quản lý Nội dung chi tiết (Lessons & Quiz) */}
          <Route path="courses/:id/content" element={<CourseContent />} />
          
          {/* Quản lý Học viên */}
          <Route path="students" element={<StudentManagement />} />
          
          {/* Cài đặt (Dark Mode) */}
          <Route path="settings" element={<SettingsPage />} />
          
          {/* Các route khác chưa phát triển */}
          <Route path="analytics" element={<div className="p-8 text-gray-500">Tính năng Thống kê đang phát triển</div>} />

        </Route>
      </Route>

    </Routes>
  );
}

export default AppRoutes;