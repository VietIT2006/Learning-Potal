import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, 
  MessageCircle, 
  Settings,
  Bell
} from 'lucide-react';

function SupportLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/support', label: 'Tin nhắn chờ', icon: MessageCircle },
    { path: '/support/settings', label: 'Cài đặt', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] border-r border-slate-700/50 flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-700/50">
          <MessageCircle className="w-6 h-6 text-emerald-400 mr-2" />
          <span className="text-xl font-bold text-white tracking-wide">SupportHub</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/30">
              {user?.fullname?.charAt(0) || user?.username?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullname}</p>
              <p className="text-xs text-slate-500 truncate">Support Agent</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
         <Outlet />
      </main>
    </div>
  );
}

export default SupportLayout;
