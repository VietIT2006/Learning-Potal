import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';

// Định nghĩa kiểu props khớp với dữ liệu từ API của bạn
interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
}

interface CourseCardProps {
  course: Course;
}

function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full flex flex-col">
      {/* Course Header - Dùng ảnh thumbnail thật thay vì gradient nếu có */}
      <div 
        className="h-48 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${course.thumbnail})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition"></div>
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
          <div className="text-2xl font-bold text-purple-600">
            Free
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