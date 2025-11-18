import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Giữ lại logic Auth cũ

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth(); // Lấy user từ context cũ

  return (
    <nav className="fixed top-0 w-full bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              LearnHub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition">Trang chủ</Link>
            {/* Cập nhật link trỏ tới trang danh sách khóa học */}
            <Link to="/courses" className="text-gray-700 hover:text-purple-600 transition">Khóa học</Link>
            
            {/* Link admin chỉ hiện khi user có role admin */}
            {user && user.role === 'admin' && (
               <Link to="/admin" className="text-gray-700 hover:text-purple-600 transition">Quản trị</Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Chào, {user.fullname}</span>
                <button 
                  onClick={logout}
                  className="border border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link to="/login">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition">
                  Đăng nhập
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 hover:text-purple-600 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-4 border-t border-gray-100 pt-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-purple-600 px-2 py-1 rounded-md hover:bg-purple-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link 
              to="/courses" 
              className="text-gray-700 hover:text-purple-600 px-2 py-1 rounded-md hover:bg-purple-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Khóa học
            </Link>
            
            {user && user.role === 'admin' && (
               <Link 
                to="/admin" 
                className="text-gray-700 hover:text-purple-600 px-2 py-1 rounded-md hover:bg-purple-50"
                onClick={() => setMobileMenuOpen(false)}
               >
                 Quản trị
               </Link>
            )}

            {user ? (
               <div className="flex flex-col gap-3 pt-2 border-t border-gray-100">
                 <span className="text-gray-600 px-2">Đang đăng nhập: <strong>{user.username}</strong></span>
                 <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }} 
                  className="text-left text-red-600 hover:text-red-700 px-2 font-medium"
                 >
                   Đăng xuất
                 </button>
               </div>
            ) : (
               <Link 
                to="/login" 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg text-center font-semibold shadow-md active:scale-95 transition"
                onClick={() => setMobileMenuOpen(false)}
               >
                Đăng nhập
               </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;