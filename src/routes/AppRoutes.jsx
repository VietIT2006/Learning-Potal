import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext'; // Đã chuyển ra main.jsx

// --- Layouts ---
// Layout giúp các trang có chung 1 bố cục (ví dụ: luôn có Navbar)
import MainLayout from '../layouts/MainLayout'; 
// Bạn có thể tạo AdminLayout tương tự MainLayout nhưng có Sidebar
// import AdminLayout from '../layouts/AdminLayout'; 

// --- Pages (Người dùng) ---
import HomePage from '../pages/Home';
import LoginPage from '../pages/Login';
import CourseDetailPage from '../pages/CourseDetail';
import WatchCoursePage from '../pages/WatchCourse';
import QuizPage from '../pages/Quiz'; // Trang bạn vừa yêu cầu

// --- Pages (Admin) ---
import CourseManagement from '../pages/Admin/CourseManagement';
// import UserManagement from '../pages/Admin/UserManagement'; // (Nếu có)

// --- Logic bảo vệ Route ---
import ProtectedRoute from './ProtectedRoute'; // File này đã có ở trên

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* === LUỒNG NGƯỜI DÙNG CHÍNH === */}
        {/* Tất cả các route bên trong đều dùng chung <MainLayout /> (có Navbar) */}
        <Route path="/" element={<MainLayout />}>
          
          {/* Trang chủ, không cần đăng nhập */}
          <Route index element={<HomePage />} />
          
          {/* Trang đăng nhập */}
          <Route path="login" element={<LoginPage />} />
          
          {/* Trang chi tiết khóa học, không cần đăng nhập */}
          <Route path="course/:id" element={<CourseDetailPage />} />

          {/* === CÁC ROUTE CẦN ĐĂNG NHẬP (USER) === */}
          {/* Bọc các trang cần đăng nhập bằng <ProtectedRoute /> */}
          <Route element={<ProtectedRoute />}>
            <Route 
              path="watch/:courseId/lesson/:lessonId" 
              element={<WatchCoursePage />} 
            />
            <Route 
              path="quiz/:quizId" 
              element={<QuizPage />} // Đây là trang Quiz
            />
            {/* Thêm các trang khác cần đăng nhập ở đây, ví dụ: trang profile */}
            {/* <Route path="profile" element={<ProfilePage />} /> */}
          </Route>
        </Route>

        {/* === LUỒNG ADMIN === */}
        {/* Dùng chung MainLayout hoặc 1 AdminLayout riêng có sidebar */}
        <Route path="/admin" element={<MainLayout />}>
          {/* Yêu cầu đăng nhập VÀ phải là admin (adminOnly={true}) */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route index element={<CourseManagement />} />
            <Route path="courses" element={<CourseManagement />} />
            {/* <Route path="users" element={<UserManagement />} /> */}
            {/* <Route path="reports" element={<ReportPage />} /> */}
          </Route>
        </Route>

        {/* Route cho trang 404 (Không tìm thấy) */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;