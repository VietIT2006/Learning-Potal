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
          <Link to="/" className="flex items-center gap-2">
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
            <a href="#courses" className="text-gray-700 hover:text-purple-600 transition">Khóa học</a>
            
            {user && user.role === 'admin' && (
               <Link to="/admin" className="text-gray-700 hover:text-purple-600 transition">Quản trị</Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700">Chào, {user.username}</span>
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
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-4 border-t pt-4">
            <Link to="/" className="text-gray-700 hover:text-purple-600">Trang chủ</Link>
            <a href="#courses" className="text-gray-700 hover:text-purple-600">Khóa học</a>
            {user ? (
               <button onClick={logout} className="text-left text-gray-700 hover:text-purple-600">Đăng xuất</button>
            ) : (
               <Link to="/login" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg text-center">
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