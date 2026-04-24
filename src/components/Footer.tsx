import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Facebook, Github, Mail, Phone } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-[#020617]/80 backdrop-blur-md border-t border-white/5 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">LearnHub</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Nền tảng học tập trực tuyến hàng đầu, giúp bạn chinh phục đỉnh cao tri thức trong kỷ nguyên số.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Khám phá</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/courses" className="text-slate-400 hover:text-sky-400 transition">Khóa học</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-sky-400 transition">Lộ trình học</Link></li>
              <li><Link to="/" className="text-slate-400 hover:text-sky-400 transition">Giảng viên</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-6">Hỗ trợ</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 0123 456 789</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@learnhub.vn</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-bold mb-6">Kết nối</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-sky-600 transition text-slate-300 hover:text-white border border-white/10">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-sky-600 transition text-slate-300 hover:text-white border border-white/10">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 text-center text-slate-500 text-xs">
          © 2026 LearnHub. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}

export default Footer;