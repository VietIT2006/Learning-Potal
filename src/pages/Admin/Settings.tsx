import React, { useState, useEffect } from 'react';
import { Moon, Sun, Bell, User, Save } from 'lucide-react';

export default function SettingsPage() {
  // 1. Logic Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // State giả lập cho thông báo
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt hệ thống</h2>
      
      {/* --- Section 1: Giao diện (Dark Mode) --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                {darkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Giao diện</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tùy chỉnh giao diện sáng/tối cho trải nghiệm tốt hơn</p>
            </div>
        </div>

        <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Chế độ tối (Dark Mode)</span>
            
            {/* Toggle Switch */}
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${darkMode ? 'bg-purple-600' : 'bg-gray-200'}`}
            >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </div>

      {/* --- Section 2: Thông báo --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Bell className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thông báo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Quản lý cách bạn nhận thông báo từ hệ thống</p>
            </div>
        </div>

        <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Nhận thông báo qua Email</span>
            <button 
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${notifications ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </div>

      {/* --- Section 3: Thông tin chung (Đã bỏ phần ngôn ngữ) --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
        <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <User className="w-6 h-6" />
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thông tin chung</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Lưu các thiết lập của bạn</p>
            </div>
        </div>

        {/* Chỉ còn nút Lưu */}
        <div className="flex justify-end">
            <button className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition shadow-md">
                <Save className="w-4 h-4" /> Lưu thay đổi
            </button>
        </div>
      </div>

    </div>
  );
}