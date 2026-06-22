import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, KeyRound, ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import logoLearn from '../assets/logo/logoLearn.png';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const { sendOtpToEmail, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) {
      toast.error('Vui lòng nhập Email của bạn trước khi gửi mã!');
      return;
    }
    
    setIsSending(true);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const success = await sendOtpToEmail(email);
    
    if (success) {
      setGeneratedOtp(otp);
      setOtpSent(true);
      toast.success(`Mã OTP đã được gửi đến email ${email}. Vui lòng kiểm tra hộp thư!`);
    }
    setIsSending(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpSent) {
      toast.error('Vui lòng bấm "Gửi mã" và kiểm tra email trước khi đổi mật khẩu.');
      return;
    }

    if (inputOtp !== generatedOtp) {
      toast.error('Mã OTP không chính xác!');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    const success = await resetPassword(newPassword);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-[#020617]">
      <div className="gradient-bg"></div>
      
      <Link to="/login" className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition group z-20 text-sm font-medium">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Quay lại đăng nhập</span>
      </Link>

      <div className="w-full max-w-md relative z-10 animate-scale-up">
        <div className="bg-[#0f172a]/50 backdrop-blur-2xl border border-white/5 p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-black/80">
          <div className="text-center mb-10">
            <img 
              src={logoLearn} 
              alt="Logo LearnHub" 
              className="h-24 w-auto mx-auto mb-6 filter drop-shadow-[0_0_15px_rgba(56,189,248,0.4)] animate-bounce-small" 
            />
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              Khôi phục mật khẩu
            </h2>
            <p className="text-slate-400 text-sm">
              Nhập email để nhận mã OTP và đặt lại mật khẩu mới
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Trường Email + Nút gửi mã */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Email của bạn</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
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
                <button 
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSending}
                  className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-400 text-white px-4 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-sky-900/30 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99] whitespace-nowrap"
                >
                  {isSending ? 'Đang gửi...' : <><Send className="w-4 h-4" /> Gửi mã</>}
                </button>
              </div>
            </div>

            {/* Trường Mã OTP */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Mã OTP (6 chữ số từ email)</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  maxLength={6}
                  className="w-full bg-white/5 border border-white/5 text-white pl-12 pr-4 py-3.5 rounded-xl focus:border-sky-500 focus:bg-white/[0.07] transition outline-none text-sm tracking-widest font-bold"
                  placeholder="Nhập mã 6 số"
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            {/* Trường Mật khẩu mới */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 ml-1 uppercase tracking-wider">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                <input 
                  type="password"
                  className="w-full bg-white/5 border border-white/5 text-white pl-12 pr-4 py-3.5 rounded-xl focus:border-sky-500 focus:bg-white/[0.07] transition outline-none text-sm"
                  placeholder="Nhập mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-emerald-900/30 transition-all mt-6"
            >
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
