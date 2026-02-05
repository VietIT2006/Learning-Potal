import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    // THAY ĐỔI: Nền trong suốt, mờ (backdrop-blur), viền dưới nhẹ
    <nav className="fixed top-0 w-full bg-black/20 backdrop-blur-md border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            {/* Chữ Logo giữ hiệu ứng Gradient cho nổi bật trên nền tối */}
            <span className="text-2xl font-bold text-white">
              LearnHub
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {/* THAY ĐỔI: Chữ màu trắng xám (gray-200), hover sáng rực (white) */}
            <Link to="/" className="text-gray-200 hover:text-black transition font-medium">Trang chủ</Link>
            <Link to="/courses" className="text-gray-200 hover:text-black transition font-medium">Khóa học</Link>
            
            {user && user.role === 'admin' && (
               <Link to="/admin" className="text-gray-200 hover:text-black transition font-medium">Quản trị</Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">Chào, {user.fullname}</span>
                <button 
                  onClick={logout}
                  className="border border-white/20 text-black px-4 py-2 rounded-lg hover:bg-white/10 transition backdrop-blur-sm"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link to="/login">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(102,126,234,0.5)] transition font-medium">
                  Đăng nhập
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button - THAY ĐỔI: Icon màu trắng */}
          <button
            className="md:hidden text-white hover:text-blue-400 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu - THAY ĐỔI: Nền tối cho menu sổ xuống */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-4 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/10 pt-4 px-4 absolute left-0 w-full shadow-2xl">
            <Link 
              to="/" 
              className="text-gray-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link 
              to="/courses" 
              className="text-gray-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Khóa học
            </Link>
            
            {user && user.role === 'admin' && (
               <Link 
                to="/admin" 
                className="text-gray-200 hover:text-white hover:bg-white/10 px-3 py-2 rounded-md transition"
                onClick={() => setMobileMenuOpen(false)}
               >
                 Quản trị
               </Link>
            )}

            {user ? (
               <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
                 <span className="text-gray-400 px-2">Đang đăng nhập: <strong className="text-white">{user.username}</strong></span>
                 <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }} 
                  className="text-left text-red-400 hover:text-red-300 px-2 font-medium"
                 >
                   Đăng xuất
                 </button>
               </div>
            ) : (
               <Link 
                to="/login" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg text-center font-semibold shadow-lg active:scale-95 transition"
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