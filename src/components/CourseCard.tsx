import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Clock } from 'lucide-react';

interface CourseProps {
  course: {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    price?: number;
  };
}

const CourseCard: React.FC<CourseProps> = ({ course }) => {
  return (
    <Link to={`/courses/${course.id}`} className="group block">
      <div className="bg-[#0f172a]/60 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden transition-all duration-300 hover:border-sky-500/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(2,6,23,0.8)]">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60"></div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-sky-500/10 text-sky-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              Bán chạy
            </span>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs font-bold">4.8</span>
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-sky-400 transition-colors">
            {course.title}
          </h3>
          <p className="text-slate-400 text-sm line-clamp-2 mb-4">
            {course.description}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <BookOpen className="w-4 h-4 text-sky-500" />
              <span>12 bài học</span>
            </div>
            <div className="text-white font-bold text-lg">
              {course.price ? `${course.price.toLocaleString()}đ` : 'Miễn phí'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;