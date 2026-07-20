import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Crown, MessageCircle, Globe, Gem } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoLearn from '../assets/logo/logoLearn.png';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLang);
  };

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
            <Link to="/" className="text-slate-300 hover:text-sky-400 transition-colors font-medium text-sm tracking-wide">{t('navbar.home')}</Link>
            <Link to="/courses" className="text-slate-300 hover:text-sky-400 transition-colors font-medium text-sm tracking-wide">{t('navbar.courses')}</Link>
            <Link to="/forum" className="text-slate-300 hover:text-sky-400 transition-colors font-medium text-sm tracking-wide">{t('navbar.forum')}</Link>
            
            {user && user.role === 'admin' && (
               <Link to="/admin" className="text-slate-300 hover:text-sky-400 transition-colors font-medium text-sm tracking-wide">{t('navbar.admin_panel')}</Link>
            )}
            {user && user.role === 'support' && (
               <Link to="/support" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium text-sm tracking-wide flex items-center gap-1">
                 <MessageCircle className="w-4 h-4" /> Support
               </Link>
            )}

            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage} 
              className="text-slate-300 hover:text-sky-400 flex items-center gap-1 transition-colors"
              title="Change Language"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{i18n.language}</span>
            </button>

            <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

            {user ? (
              <div className="flex items-center gap-5">
                <Link to="/wallet" className="flex flex-col items-end group cursor-pointer mr-2">
                  <span className="text-purple-400 text-sm font-bold leading-none group-hover:text-purple-300 transition-colors">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.balance || 0)}
                  </span>
                  <span className="text-[10px] text-purple-300 uppercase tracking-tighter mt-1">{t('navbar.wallet')}</span>
                </Link>
                <Link to="/profile" className="flex items-center gap-3 group cursor-pointer">
                  <div className="flex flex-col items-end mr-2">
                    <span className="text-white text-sm font-semibold leading-none group-hover:text-sky-400 transition-colors">{user.fullname}</span>
                    <span className="text-[10px] text-sky-400 uppercase tracking-tighter mt-1 font-bold">{t('navbar.profile')}</span>
                  </div>
                  <div className="relative">
                    {user.isTop1 && (
                      <>
                        <div className="absolute -top-2 -right-2 z-10 w-5 h-5 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-lg">
                          <Crown className="w-3 h-3 text-[#0f172a]" />
                        </div>
                        <div className="absolute -bottom-2 -left-2 z-10 w-5 h-5 bg-gradient-to-br from-cyan-300 to-blue-500 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse">
                          <Gem className="w-3 h-3 text-white" />
                        </div>
                        <div className="avatar-top1-frame"></div>
                      </>
                    )}
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className={`w-10 h-10 rounded-full object-cover border-2 transition-colors ${user.isTop1 ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'border-white/10 group-hover:border-sky-400/50'}`} />
                    ) : (
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold border-2 transition-colors ${user.isTop1 ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'border-white/10 group-hover:border-sky-400/50'}`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </Link>
                <button 
                  onClick={logout}
                  className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all text-sm font-medium"
                >
                  {t('navbar.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <button className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-sky-900/40 transition-all transform active:scale-95">
                    {t('navbar.login')}
                  </button>
                </Link>
              </div>
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
            <Link 
              to="/forum" 
              className="text-slate-300 hover:text-sky-400 hover:bg-sky-500/5 px-4 py-3 rounded-xl transition-all font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Diễn đàn
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
                 <Link to="/wallet" onClick={() => setMobileMenuOpen(false)} className="flex justify-between items-center bg-purple-500/10 p-3 rounded-xl hover:bg-purple-500/20 transition-colors">
                   <span className="text-purple-300 font-bold">Ví của tôi</span>
                   <span className="text-purple-400 font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.balance || 0)}</span>
                 </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition-colors cursor-pointer">
                    <div className="relative">
                      {user.isTop1 && (
                        <div className="absolute -top-1 -right-1 z-10 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center border border-[#0f172a] shadow-lg">
                          <Crown className="w-2.5 h-2.5 text-[#0f172a]" />
                        </div>
                      )}
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Avatar" className={`w-10 h-10 rounded-full object-cover shadow-lg ${user.isTop1 ? 'border border-yellow-400 shadow-yellow-400/20' : 'shadow-sky-500/20'}`} />
                      ) : (
                        <div className={`w-10 h-10 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${user.isTop1 ? 'border border-yellow-400 shadow-yellow-400/20' : 'shadow-sky-500/20'}`}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                   <div className="flex flex-col">
                     <span className="text-white font-bold">{user.fullname}</span>
                     <span className="text-xs text-slate-400">{user.username}</span>
                   </div>
                 </Link>
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