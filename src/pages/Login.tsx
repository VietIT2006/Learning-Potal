import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, BookOpen, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
  // Lấy hàm login và register từ AuthContext
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State quản lý form
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // --- XỬ LÝ ĐĂNG NHẬP ---
      const success = await login(formData.username, formData.password);
      if (success) {
        navigate('/'); // Đăng nhập thành công thì về trang chủ
      } else {
        alert('Sai tên đăng nhập hoặc mật khẩu!');
      }
    } else {
      // --- XỬ LÝ ĐĂNG KÝ ---
      // 1. Kiểm tra mật khẩu xác nhận
      if (formData.password !== formData.confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
      }

      // 2. Gọi hàm đăng ký
      const result = await register({
        fullname: formData.fullname,
        email: formData.email,
        username: formData.username,
        password: formData.password
      });

      // 3. Xử lý kết quả
      if (result === true) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLogin(true); // Chuyển về tab đăng nhập
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Xóa mật khẩu
      } else {
        // Nếu thất bại (VD: trùng username), hiển thị lỗi từ server gửi về
        alert(result); 
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Nút quay lại trang chủ */}
      <Link to="/" className="absolute top-6 left-6 text-white/80 hover:text-white flex items-center gap-2 z-20 font-medium transition">
        <ArrowRight className="w-5 h-5 rotate-180" /> Trang chủ
      </Link>

      {/* Background Animation */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-0 relative z-10">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center items-center bg-white/10 backdrop-blur-xl rounded-l-3xl p-12 text-white">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-8 hover:bg-white/30 transition">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-bold mb-4 text-center">LearnHub</h2>
          <p className="text-lg text-white/80 text-center mb-8">
            Nền tảng học tập trực tuyến tuyệt vời
          </p>
          {/* Features List */}
          <div className="space-y-4 w-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">✨</div>
              <div>
                <h3 className="font-semibold">Hàng ngàn khóa học</h3>
                <p className="text-white/70 text-sm">Từ các chuyên gia hàng đầu</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">🎯</div>
              <div>
                <h3 className="font-semibold">Học theo tốc độ của bạn</h3>
                <p className="text-white/70 text-sm">Linh hoạt và tiện lợi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="bg-white backdrop-blur-xl rounded-3xl md:rounded-l-none md:rounded-r-3xl p-8 md:p-12 shadow-2xl">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
            </h1>
            <p className="text-gray-600">
              {isLogin ? 'Chào mừng bạn quay lại!' : 'Bắt đầu hành trình học tập của bạn'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Email - Chỉ hiện khi Đăng ký */}
            {!isLogin && (
              <>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullname"
                      required
                      value={formData.fullname}
                      onChange={handleChange}
                      placeholder="Nhập họ tên của bạn"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Username */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password - Chỉ hiện khi Đăng ký */}
            {!isLogin && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition duration-300 flex items-center justify-center gap-2 mt-6"
            >
              {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="text-center text-sm text-gray-600 mt-6">
            {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 hover:text-purple-700 font-semibold transition"
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}