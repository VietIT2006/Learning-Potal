import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Users, Clock, ArrowRight, BookOpen, ImageOff } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  category?: string;
  rating?: number;
  reviews?: number;
  price?: number;
  level?: string;
  duration?: string;
  instructor?: string;
  students?: number;
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
        // Gọi API lấy dữ liệu thật
        const response = await axios.get('/api/courses');
        
        // --- QUAN TRỌNG: Dùng dữ liệu gốc từ DB, không chỉnh sửa/ghi đè ---
        setCourses(response.data); 
        
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

  const formatPrice = (price?: number) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải khóa học...</div>;
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-600 to-purple-500 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Khám phá khóa học</h1>
          <p className="text-xl opacity-90">Tìm khóa học phù hợp với bạn từ thư viện chất lượng cao</p>
        </div>
      </section>

      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-white shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none transition"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 mr-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-900 hidden sm:inline">Danh mục:</span>
            </div>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 text-gray-600">
            Tìm thấy <span className="font-bold text-gray-900">{filteredCourses.length}</span> khóa học
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group flex flex-col h-full"
                >
                  <div className="h-48 relative bg-gray-200 overflow-hidden">
                    {course.thumbnail ? (
                        <img 
                            src={course.thumbnail} 
                            alt={course.title}
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                            onError={(e) => {
                                // Xử lý khi ảnh lỗi -> đổi thành ảnh mặc định
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
                            }}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <ImageOff className="w-10 h-10" />
                        </div>
                    )}
                     <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-purple-700 shadow-sm z-10">
                      {course.level || 'Cơ bản'}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                      {course.description}
                    </p>

                    <div className="text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                      Giáo viên: <span className="font-semibold text-gray-900">{course.instructor || 'Đang cập nhật'}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-500 mb-6">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-bold text-gray-900">{course.rating || 0}</span>
                        <span>({course.reviews || 0})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Học phí</div>
                        <div className="text-xl font-bold text-purple-600">
                          {formatPrice(course.price)}
                        </div>
                      </div>
                      <Link 
                        to={`/course/${course.id}`}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition font-semibold flex items-center gap-2 text-sm"
                      >
                        Chi tiết <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy khóa học nào</h3>
              <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc danh mục</p>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedCategory('all');}}
                className="mt-6 text-purple-600 font-semibold hover:underline"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default CoursesPage;