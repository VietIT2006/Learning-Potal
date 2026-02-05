import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, BookOpen } from 'lucide-react';

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

const formatCurrency = (amount: number) => {
    if (amount === 0 || !amount) return 'Miễn phí'; // Đổi Free thành Miễn phí
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
};

function CourseCard({ course }: CourseCardProps) {
  const actualPrice = Number(course.price) || 0; 
  const hasThumbnail = course.thumbnail && course.thumbnail.length > 5;
  
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState('');

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15; 
    const rotateY = (centerX - x) / 15;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col h-full rounded-2xl transition-all duration-200 ease-out"
      style={{
        transform: transformStyle,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Header Image */}
      <div 
        className={`h-48 relative rounded-t-2xl overflow-hidden ${hasThumbnail ? 'bg-cover bg-center' : 'bg-gray-800 flex items-center justify-center'}`} 
        style={hasThumbnail ? { backgroundImage: `url(${course.thumbnail})` } : {}}
      >
        {!hasThumbnail && (
            <div className="text-center text-gray-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <span className="text-xs font-semibold uppercase tracking-wider">Đang cập nhật ảnh</span>
            </div>
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow text-white">
        <h3 className="text-xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 group-hover:from-blue-300 group-hover:to-purple-400 transition cursor-pointer">
          <Link to={`/course/${course.id}`}>{course.title}</Link>
        </h3>
        <p className="text-gray-400 text-sm mb-4 flex-grow line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Users className="w-4 h-4" />
          <span>1,234 học viên</span> {/* Bạn có thể thay số này bằng data thật nếu có */}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-700 mt-auto">
          <div className="text-xl font-bold text-white">
            {formatCurrency(actualPrice)}
          </div>
          <Link 
            to={`/course/${course.id}`}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:shadow-[0_0_15px_rgba(102,126,234,0.5)] transition"
            title="Xem chi tiết"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;