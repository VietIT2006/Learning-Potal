import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Layouts ---
import MainLayout from '../layouts/MainLayout'; 

// --- Pages (Người dùng) ---
import HomePage from '../pages/Home';
import CoursesPage from '../pages/Courses'; // Import trang mới
import LoginPage from '../pages/Login';
import CourseDetailPage from '../pages/CourseDetail';
import WatchCoursePage from '../pages/WatchCourse';
import QuizPage from '../pages/Quiz';

// --- Pages (Admin) ---
import CourseManagement from '../pages/Admin/CourseManagement';

// --- Logic bảo vệ Route ---
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* === LUỒNG NGƯỜI DÙNG CHÍNH === */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="courses" element={<CoursesPage />} /> {/* Thêm Route này */}
        <Route path="login" element={<LoginPage />} />
        <Route path="course/:id" element={<CourseDetailPage />} />

        {/* === CÁC ROUTE CẦN ĐĂNG NHẬP (USER) === */}
        <Route element={<ProtectedRoute />}>
          <Route 
            path="watch/:courseId/lesson/:lessonId" 
            element={<WatchCoursePage />} 
          />
          <Route 
            path="quiz/:quizId" 
            element={<QuizPage />}
          />
        </Route>
      </Route>

      {/* === LUỒNG ADMIN === */}
      <Route path="/admin" element={<MainLayout />}>
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route index element={<CourseManagement />} />
          <Route path="courses" element={<CourseManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;