import React, { useState, useEffect } from 'react';
import { getCourses } from '../lib/supabaseService';
import { Search, Filter, BookOpen } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { LoadingSpinner } from '../components/LoadingSpinner'; // Sử dụng component chung để đồng bộ
import ParticleBackground from '../components/ParticleBackground';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  category?: string;
  price?: number;
}

function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'Programming', name: 'Lập trình' },
    { id: 'Design', name: 'Thiết kế' },
    { id: 'Business', name: 'Kinh doanh' },
    { id: 'Marketing', name: 'Marketing' }
  ];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Lỗi tải khóa học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchCategory = selectedCategory === 'all' || (course.category && course.category === selectedCategory);
    const matchSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    // THAY ĐỔI: Sử dụng cấu trúc nền giống trang Home
    <div className="relative w-full min-h-screen bg-transparent text-white overflow-hidden">
      <div className="gradient-bg"></div>
      <ParticleBackground />

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
              Khám phá <span className="text-gradient">Tri thức</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Tìm kiếm khóa học phù hợp để nâng tầm kỹ năng của bạn ngay hôm nay.
            </p>
          </div>

          {/* Search & Filter Section - Glassmorphism style */}
          <div className="mb-12 space-y-6">
            <div className="relative max-w-3xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-blue-500/50 focus:outline-none transition-all backdrop-blur-md text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-8 text-gray-400 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Tìm thấy <span className="text-white font-bold">{filteredCourses.length}</span> khóa học
          </div>

          {/* Courses Grid */}
          {loading ? (
            <LoadingSpinner message="Đang tải danh sách khóa học..." />
          ) : filteredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredCourses.map((course) => (
                // THAY ĐỔI: Sử dụng trực tiếp CourseCard để đồng bộ UI với Home
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-white">Không tìm thấy khóa học nào</h3>
              <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc danh mục</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoursesPage;