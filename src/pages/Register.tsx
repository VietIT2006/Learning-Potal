import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, UserPlus, ArrowLeft, User, UserCircle } from 'lucide-react';
import logoLearn from '../assets/logo/logoLearn.png';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(email, password, username, fullname);
    if (success) {
      // Supabase gửi email xác nhận hoặc tự động login tùy cấu hình, ta đưa user về login
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-[#020617] py-12">
      <div className="gradient-bg"></div>
      
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition group z-20 text-sm font-medium">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Về trang chủ</span>
      </Link>

      <div className="w-full max-w-md relative z-10 animate-scale-up">
        <div className="bg-[#0f172a]/50 backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-black/80">
          <div className="text-center mb-8">
            <img 
              src={logoLearn} 
              alt="Logo LearnHub" 
              className="h-16 w-auto mx-auto mb-4 filter drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" 
            />
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Tạo tài khoản</h2>
            <p className="text-slate-400 text-sm">Bắt đầu hành trình chinh phục kiến thức mới</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Họ và tên */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Họ và tên</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/5 text-white pl-12 pr-4 py-3.5 rounded-xl focus:border-sky-500 focus:bg-white/[0.07] transition outline-none text-sm"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/5 text-white pl-12 pr-4 py-3.5 rounded-xl focus:border-sky-500 focus:bg-white/[0.07] transition outline-none text-sm"
                  placeholder="nguyenvana123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="password" 
                  className="w-full bg-white/5 border border-white/5 text-white pl-12 pr-4 py-3.5 rounded-xl focus:border-sky-500 focus:bg-white/[0.07] transition outline-none text-sm"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-sky-600 hover:bg-sky-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-sky-900/30 transition-all flex items-center justify-center gap-2 mt-6 transform active:scale-[0.99]"
            >
              <UserPlus className="w-4 h-4" /> Đăng ký ngay
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            Đã có tài khoản? <Link to="/login" className="text-sky-400 font-bold hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;