import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BookOpen, Users, BarChart3, Settings, 
  LogOut, Menu, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { path: '/admin', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { path: '/admin/courses', label: 'Quản lý khóa học', icon: BookOpen },
    { path: '/admin/students', label: 'Quản lý học viên', icon: Users },
    { path: '/admin/analytics', label: 'Thống kê', icon: BarChart3 },
    { path: '/admin/settings', label: 'Cài đặt', icon: Settings },
  ];

  const activeTitle = menuItems.find(item => item.path === location.pathname)?.label || 'Admin';

  return (
    // THAY ĐỔI: Sử dụng nền tối #0a0a0a và màu chữ trắng đồng bộ với App.css
    <div className="min-h-screen bg-[#0a0a0a] flex font-sans text-white">
      {/* --- Sidebar --- */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900/50 backdrop-blur-xl text-white transition-all duration-300 fixed h-screen overflow-y-auto border-r border-white/5 z-50`}>
        <div className="p-6 border-b border-white/10 flex items-center justify-between h-20">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
              <BookOpen className="w-6 h-6" />
            </div>
            {sidebarOpen && <span className="text-xl font-bold tracking-tight">Admin</span>}
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                {sidebarOpen && <span className="text-sm font-medium truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 absolute bottom-0 w-full bg-gray-900/50">
          <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition group">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium group-hover:text-red-300">Đăng xuất</span>}
          </button>
        </div>
      </div>

      {/* --- Main Wrapper --- */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300 flex flex-col min-h-screen`}>
        {/* Top Bar */}
        {/* THAY ĐỔI: Nền tối trong suốt (glassmorphism) để hiện hiệu ứng gradient từ App.css bên dưới */}
        <div className="bg-gray-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 h-20">
          <div className="px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400">
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <h1 className="text-2xl font-bold text-white hidden sm:block tracking-tight">{activeTitle}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white">{user?.fullname || user?.username}</p>
                  <p className="text-xs text-gray-400">Quản trị viên</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        {/* Thêm lớp animate-fade-in từ App.css của bạn */}
        <div className="p-6 lg:p-8 animate-fade-in flex-grow">
          <Outlet />
        </div>
      </div>
    </div>
  );
}