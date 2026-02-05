import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    // THAY ĐỔI: Nền trắng mờ (bg-white/90), chữ đen (text-gray-900), viền xám (border-gray-200)
    <footer className="bg-white/90 backdrop-blur-md text-gray-900 py-12 px-4 sm:px-6 lg:px-8 mt-auto border-t border-gray-200 relative z-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            {/* Logo */}
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white text-xs">LH</span>
            </div>
            <span className="font-bold text-xl text-gray-900">LearnHub</span>
          </div>
          <p className="text-sm text-gray-600">
            Nền tảng học tập trực tuyến hàng đầu với công nghệ thực tế ảo và lộ trình cá nhân hóa.
          </p>
        </div>
        
        {/* Các cột liên kết */}
        <div>
          <h4 className="font-bold text-gray-900 mb-4 text-lg">Khóa học</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="#" className="hover:text-purple-600 transition">Web Development</Link></li>
            <li><Link to="#" className="hover:text-purple-600 transition">Mobile App</Link></li>
            <li><Link to="#" className="hover:text-purple-600 transition">UI/UX Design</Link></li>
            <li><Link to="#" className="hover:text-purple-600 transition">Cloud Computing</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-gray-900 mb-4 text-lg">Công ty</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="#" className="hover:text-purple-600 transition">Về chúng tôi</Link></li>
            <li><Link to="#" className="hover:text-purple-600 transition">Blog công nghệ</Link></li>
            <li><Link to="#" className="hover:text-purple-600 transition">Liên hệ</Link></li>
            <li><Link to="#" className="hover:text-purple-600 transition">Tuyển dụng</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-bold text-gray-900 mb-4 text-lg">Pháp lý</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link to="#" className="hover:text-purple-600 transition">Điều khoản sử dụng</Link></li>
            <li><Link to="#" className="hover:text-purple-600 transition">Chính sách riêng tư</Link></li>
            <li><Link to="#" className="hover:text-purple-600 transition">Cookies</Link></li>
          </ul>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
        <p>&copy; 2024 LearnHub. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
}