import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import logoLearn from '../assets/logo/logoLearn.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-[#020617]">
      <div className="gradient-bg"></div>
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition group z-20 text-sm font-medium">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Về trang chủ</span>
      </Link>

      <div className="w-full max-w-md relative z-10 animate-scale-up">
        <div className="bg-[#0f172a]/50 backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-black/80">
          <div className="text-center mb-10">
            <img 
              src={logoLearn} 
              alt="Logo LearnHub" 
              className="h-24 w-auto mx-auto mb-6 filter drop-shadow-[0_0_15px_rgba(56,189,248,0.4)] animate-bounce-small" 
            />
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Chào mừng bạn!</h2>
            <p className="text-slate-400 text-sm">Đăng nhập tài khoản để vào không gian học tập</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="email"
                  className="w-full bg-white/5 border border-white/5 text-white pl-12 pr-4 py-3.5 rounded-xl focus:border-sky-500 focus:bg-white/[0.07] transition outline-none text-sm"
                  placeholder="hello@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  className="w-full bg-white/5 border border-white/5 text-white pl-12 pr-4 py-3.5 rounded-xl focus:border-sky-500 focus:bg-white/[0.07] transition outline-none text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-sky-400 hover:text-sky-300 font-medium transition"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <button 
              type="submit" 
              className="w-full bg-sky-600 hover:bg-sky-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-sky-900/30 transition-all flex items-center justify-center gap-2 mt-4 transform active:scale-[0.99]"
            >
              <LogIn className="w-4 h-4" /> Đăng nhập hệ thống
            </button>
          </form>

          <p className="text-center text-slate-400 mt-8 text-sm">
            Chưa gia nhập LearnHub? <Link to="/register" className="text-sky-400 font-bold hover:underline">Đăng ký thành viên</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;