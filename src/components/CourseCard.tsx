import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, BookOpen } from 'lucide-react'; // ĐÃ THÊM: Import BookOpen

// Định nghĩa kiểu props khớp với dữ liệu từ API của bạn
interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  price?: number; 
}

interface CourseCardProps {
  course: Course;
}

// Hàm Định dạng tiền tệ
const formatCurrency = (amount: number) => {
    if (amount === 0 || !amount) return 'Free';
    
    // Định dạng VNĐ, làm tròn không lấy số thập phân
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND', 
        minimumFractionDigits: 0
    }).format(amount);
};

function CourseCard({ course }: CourseCardProps) {
  const actualPrice = Number(course.price) || 0; 
  // Kiểm tra xem URL thumbnail có tồn tại và dài hơn một chút không
  const hasThumbnail = course.thumbnail && course.thumbnail.length > 5; 

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col">
      {/* Course Header - HIỂN THỊ THUMBNAIL HOẶC FALLBACK */}
      <div 
        // Nếu có ảnh, dùng bg-cover. Nếu không, dùng bg-purple-50 và căn giữa
        className={`h-48 relative ${hasThumbnail ? 'bg-cover bg-center' : 'bg-purple-50 flex items-center justify-center'}`} 
        // Chỉ áp dụng style backgroundImage nếu có URL
        style={hasThumbnail ? { backgroundImage: `url(${course.thumbnail})` } : {}}
      >
        
        {/* PHẦN FALLBACK (HIỂN THỊ KHI ẢNH BỊ LỖI HOẶC KHÔNG CÓ) */}
        {!hasThumbnail && (
            <div className="text-center text-purple-600">
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <span className="text-sm font-semibold">Không có ảnh bìa</span>
            </div>
        )}

        {/* DURATION/RATING BADGE (Giữ nguyên) */}
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold shadow">
          4.8 ⭐
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">
          {course.description}
        </p>

        {/* Stats giả lập (vì db.json chưa có) */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Users className="w-4 h-4" />
          <span>1,234 học viên</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
          {/* PHẦN HIỂN THỊ GIÁ THỰC TẾ (520.000 ₫) */}
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(actualPrice)}
          </div>
          <Link 
            to={`/course/${course.id}`}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-lg hover:shadow-lg transition"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;