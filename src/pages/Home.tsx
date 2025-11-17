import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight, BookOpen, Users, Star } from 'lucide-react';
import CourseCard from '../components/CourseCard';

// Định nghĩa kiểu
interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
}

function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:3001/courses');
        setCourses(response.data);
      } catch (error) {
        console.error("Lỗi khi tải khóa học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const stats = [
    { label: 'Khóa học', value: '50+', icon: BookOpen },
    { label: 'Học viên', value: '10K+', icon: Users },
    { label: 'Giáo viên', value: '100+', icon: Star },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 via-white to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Học tập <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">không giới hạn</span>
              </h1>
              <p className="text-xl text-gray-600">
                Khám phá hàng ngàn khóa học từ những chuyên gia hàng đầu. Nâng cao kỹ năng của bạn ngay hôm nay.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#courses" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer">
                  Khám phá ngay <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-9xl">🎓</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center p-6 hover:bg-gray-50 rounded-xl transition cursor-default">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Khóa học nổi bật
            </h2>
            <p className="text-xl text-gray-600">
              Chọn từ những khóa học được đánh giá cao nhất
            </p>
          </div>

          {/* Course Grid - Thay thế Grid MUI */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;