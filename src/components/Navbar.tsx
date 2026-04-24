import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Đã bỏ BookOpen vì dùng logo ảnh
import { useAuth } from '../context/AuthContext';
import logoLearn from '../assets/logo/logoLearn.png';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 w-full bg-[#020617]/60 backdrop-blur-xl border-b border-white/5 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20"> {/* Tăng chiều cao Navbar lên h-20 */}
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-4 group" onClick={() => setMobileMenuOpen(false)}>
            <img 
              src={logoLearn} 
              alt="LearnHub Logo" 
              className="h-16 w-auto object-contain transition-all duration-300
                         filter drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]
                         group-hover:drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]
                         group-hover:scale-105" 
            />
            <span className="text-2xl font-bold text-white tracking-tight">
              Learn<span className="text-sky-400">Hub</span>
            </span>
          </Link>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-300 hover:text-sky-400 transition-colors font-medium text-sm tracking-wide">Trang chủ</Link>
            <Link to="/courses" className="text-slate-300 hover:text-sky-400 transition-colors font-medium text-sm tracking-wide">Khóa học</Link>
            
            {user && user.role === 'admin' && (
               <Link to="/admin" className="text-slate-300 hover:text-sky-400 transition-colors font-medium text-sm tracking-wide">Quản trị</Link>
            )}

            <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

            {user ? (
              <div className="flex items-center gap-5">
                <div className="flex flex-col items-end">
                  <span className="text-white text-sm font-semibold leading-none">{user.fullname}</span>
                  <span className="text-[10px] text-sky-400 uppercase tracking-tighter mt-1 font-bold">Học viên</span>
                </div>
                <button 
                  onClick={logout}
                  className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all text-sm font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link to="/login">
                <button className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-sky-900/40 transition-all transform active:scale-95">
                  Đăng nhập
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-slate-300 hover:text-sky-400 transition-colors p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </div>

        {/* Mobile Menu - Sky Night Style */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 flex flex-col gap-2 bg-[#020617]/95 backdrop-blur-2xl border-t border-white/5 pt-4 px-4 absolute left-0 w-full shadow-2xl animate-fade-in">
            <Link 
              to="/" 
              className="text-slate-300 hover:text-sky-400 hover:bg-sky-500/5 px-4 py-3 rounded-xl transition-all font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link 
              to="/courses" 
              className="text-slate-300 hover:text-sky-400 hover:bg-sky-500/5 px-4 py-3 rounded-xl transition-all font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Khóa học
            </Link>
            
            {user && user.role === 'admin' && (
               <Link 
                to="/admin" 
                className="text-slate-300 hover:text-sky-400 hover:bg-sky-500/5 px-4 py-3 rounded-xl transition-all font-medium"
                onClick={() => setMobileMenuOpen(false)}
               >
                 Quản trị
               </Link>
            )}

            <div className="my-2 border-t border-white/5"></div>

            {user ? (
               <div className="flex flex-col gap-4 p-4 bg-white/5 rounded-2xl">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20">
                     {user.username.charAt(0).toUpperCase()}
                   </div>
                   <div className="flex flex-col">
                     <span className="text-white font-bold">{user.fullname}</span>
                     <span className="text-xs text-slate-400">{user.username}</span>
                   </div>
                 </div>
                 <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }} 
                  className="w-full bg-red-500/10 text-red-400 py-3 rounded-xl font-bold hover:bg-red-500/20 transition-all"
                 >
                   Đăng xuất
                 </button>
               </div>
            ) : (
               <Link 
                to="/login" 
                className="w-full bg-sky-600 text-white py-4 rounded-2xl text-center font-bold shadow-lg shadow-sky-900/40 active:scale-[0.98] transition-all"
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