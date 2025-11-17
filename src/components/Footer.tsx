import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg"></div>
            <span className="font-bold text-white">LearnHub</span>
          </div>
          <p className="text-sm">Nền tảng học tập trực tuyến hàng đầu</p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Khóa học</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="#" className="hover:text-white transition">Web Development</Link></li>
            <li><Link to="#" className="hover:text-white transition">Mobile App</Link></li>
            <li><Link to="#" className="hover:text-white transition">UI/UX Design</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Công ty</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="#" className="hover:text-white transition">Về chúng tôi</Link></li>
            <li><Link to="#" className="hover:text-white transition">Blog</Link></li>
            <li><Link to="#" className="hover:text-white transition">Liên hệ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4">Pháp lý</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="#" className="hover:text-white transition">Điều khoản</Link></li>
            <li><Link to="#" className="hover:text-white transition">Riêng tư</Link></li>
            <li><Link to="#" className="hover:text-white transition">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 pt-8 text-center text-sm">
        <p>&copy; 2024 LearnHub. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
}