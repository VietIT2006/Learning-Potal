import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMaintenanceStatus } from '../lib/supabaseService';

// --- Layouts ---
import MainLayout from '../layouts/MainLayout'; 
import AdminLayout from '../layouts/AdminLayout';

// --- Pages (Người dùng) ---
import HomePage from '../pages/Home';
import CoursesPage from '../pages/Courses';
import AdminChatDashboard from '../pages/Admin/AdminChatDashboard';
import LoginPage from '../pages/Login';
import RegisterPage from '../pages/Register'; 
import ForgotPasswordPage from '../pages/ForgotPassword';
import ProfilePage from '../pages/Profile';
import Wallet from '../pages/Wallet';
import CourseDetailPage from '../pages/CourseDetail';
import WatchCoursePage from '../pages/WatchCourse';
import QuizPage from '../pages/Quiz';
import PaymentResult from '../pages/PaymentResult'; 
import ForumPage from '../pages/Forum';
import ForumPostPage from '../pages/ForumPost';
import MaintenancePage from '../pages/Maintenance';

// --- Pages (Admin) ---
import Dashboard from '../pages/Admin/Dashboard';
import CourseManagement from '../pages/Admin/CourseManagement';
import CourseContent from '../pages/Admin/CourseContent';
import StudentManagement from '../pages/Admin/StudentManagement';
import SettingsPage from '../pages/Admin/Settings'; 
import Analytics from '../pages/Admin/Analytics'; 

// --- Pages (Support) ---
import SupportLayout from '../layouts/SupportLayout';
import SupportDashboard from '../pages/Support/SupportDashboard';

// --- Logic bảo vệ Route ---
import ProtectedRoute from './ProtectedRoute';

// --- VIP Components ---
import CursorTrail from '../components/CursorTrail';

function AppRoutes() {
  const { user } = useAuth();
  const [customTheme, setCustomTheme] = useState<string | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    const applyTheme = () => {
      if (user?.isTop1) {
        document.body.classList.add('top1-theme');
        const savedTheme = localStorage.getItem(`top1_theme_${user.id}`);
        setCustomTheme(savedTheme || null);
      } else {
        document.body.classList.remove('top1-theme');
        setCustomTheme(null);
      }
    };

    applyTheme();

    const checkMaintenance = async () => {
      try {
        const status = await getMaintenanceStatus();
        setIsMaintenanceMode(status);
      } catch (err) {
        console.error(err);
      }
    };
    checkMaintenance();
    const interval = setInterval(checkMaintenance, 30000); // Check every 30s

    window.addEventListener('themeUpdated', applyTheme);
    return () => {
      window.removeEventListener('themeUpdated', applyTheme);
      clearInterval(interval);
    };
  }, [user]);

  return (
    <>
      {customTheme && (
        <style>
          {`
            body.top1-theme::before {
              content: "";
              position: fixed;
              inset: 0;
              background-image: url('${customTheme}');
              background-size: cover;
              background-position: center;
              background-attachment: fixed;
              z-index: -10;
              opacity: 0.85;
            }
            /* Hide the default gradient to show the custom image clearly */
            .gradient-bg { display: none !important; }
            /* Reduce particle opacity so they don't clutter the image */
            #tsparticles { opacity: 0.3 !important; }
          `}
        </style>
      )}
      {user?.isTop1 && <CursorTrail />}
      
      {isMaintenanceMode && user?.role !== 'admin' ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<MaintenancePage />} />
        </Routes>
      ) : (
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
        <Route path="forum" element={<ForumPage />} />
        <Route path="forum/:id" element={<ForumPostPage />} />

        {/* Các trang cần đăng nhập (User) */}
        <Route element={<ProtectedRoute />}>
          <Route path="watch/:courseId/lesson/:lessonId" element={<WatchCoursePage />} />
          <Route path="quiz/:quizId" element={<QuizPage />} />
          <Route path="profile" element={<ProfilePage />} />
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
          <Route path="chat" element={<AdminChatDashboard />} />
        </Route>
      </Route>

      {/* =========================================
          LUỒNG 3: NHÂN VIÊN HỖ TRỢ (Support)
      ========================================= */}
      <Route path="/support" element={<ProtectedRoute supportOnly={true} />}>
        <Route element={<SupportLayout />}>
          <Route index element={<SupportDashboard />} />
        </Route>
      </Route>

      </Routes>
      )}
    </>
  );
}

export default AppRoutes;