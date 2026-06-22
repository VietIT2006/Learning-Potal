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
    <div className="min-h-screen bg-[#050508] flex font-sans text-slate-200 relative selection:bg-purple-500/30">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none"></div>

      {/* --- Sidebar --- */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0a0a0f]/80 backdrop-blur-2xl transition-all duration-300 fixed h-screen overflow-y-auto border-r border-white/5 z-50 flex flex-col`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between h-20 shrink-0">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25 border border-white/10">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">EduAdmin</span>}
          </div>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent border-l-2 border-purple-500"></div>
                )}
                <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 transition-colors ${isActive ? 'text-purple-400' : 'group-hover:text-slate-200'}`} />
                {sidebarOpen && <span className="text-sm font-medium truncate relative z-10">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 shrink-0 bg-black/20">
          <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group">
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="text-sm font-medium">Đăng xuất</span>}
          </button>
        </div>
      </div>

      {/* --- Main Wrapper --- */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} flex-1 transition-all duration-300 flex flex-col min-h-screen relative z-10`}>
        {/* Top Bar */}
        <div className="bg-[#050508]/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40 h-20 transition-all">
          <div className="px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white">
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="text-xl font-semibold text-slate-100 hidden sm:block tracking-tight">{activeTitle}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pl-5 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-200">{user?.fullname || user?.username}</p>
                  <p className="text-[11px] text-purple-400 uppercase tracking-wider font-medium mt-0.5">Quản trị viên</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 p-[2px] shadow-lg">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold border-2 border-[#050508]">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6 lg:p-8 animate-fade-in flex-grow">
          <Outlet />
        </div>
      </div>
    </div>
  );
}