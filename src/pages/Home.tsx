import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Star, Trophy, Target } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import ParticleBackground from '../components/ParticleBackground';
import Testimonials from '../components/Testimonials'; // <--- 1. NHỚ IMPORT

// ... (Giữ nguyên các interface và hàm fetchCourses, stats ...)
interface Course {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    price?: number; 
}

function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
        try {
          const response = await axios.get('/api/courses');
          setCourses(response.data);
        } catch (error) {
          console.error("Lỗi:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCourses();
  }, []);

  const stats = [
    { label: 'Khóa học Online', value: '50+', icon: BookOpen },
    { label: 'Học viên tích cực', value: '10K+', icon: Users },
    { label: 'Giảng viên uy tín', value: '100+', icon: Star }
  ];

  return (
    <div className="relative w-full min-h-screen">
      <div className="gradient-bg"></div>
      <ParticleBackground />

      <div className="relative z-10">
        
        {/* ... (Giữ nguyên Hero Section) ... */}
        <section className="relative pt-32 pb-20 px-4">
            <div className="cube-container">
                <div className="cube" style={{ top: '20%', left: '10%', animationDelay: '0s' }}>
                    <div className="front"></div><div className="back"></div><div className="right"></div><div className="left"></div><div className="top"></div><div className="bottom"></div>
                </div>
                <div className="cube" style={{ top: '60%', right: '15%', animationDelay: '2s' }}>
                    <div className="front"></div><div className="back"></div><div className="right"></div><div className="left"></div><div className="top"></div><div className="bottom"></div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto text-center relative z-20">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white">
                    Học tập <span className="text-gradient">Không Giới Hạn</span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Tiếp cận tri thức từ các chuyên gia hàng đầu. 
                    Nâng cao kỹ năng, phát triển sự nghiệp với lộ trình học tập được cá nhân hóa dành riêng cho bạn.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link to="/courses" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-[0_0_30px_rgba(102,126,234,0.6)] transition transform hover:-translate-y-1 flex items-center justify-center gap-2">
                        Khám phá khóa học <ArrowRight className="w-5 h-5" />
                    </Link>
                    <button className="px-8 py-4 rounded-full font-bold text-white border border-white/20 hover:bg-white/10 transition backdrop-blur-sm">
                        Lộ trình học tập
                    </button>
                </div>
            </div>
        </section>

        {/* ... (Giữ nguyên Stats Section) ... */}
        <section className="py-10 px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl text-center hover:bg-white/10 transition duration-300 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400 group-hover:text-blue-300 transition">
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                        <div className="text-gray-400 font-medium">{stat.label}</div>
                    </div>
                ))}
            </div>
        </section>

        {/* ... (Giữ nguyên Features Section) ... */}
        <section className="py-20 px-4">
             <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-white mb-12">Tại sao chọn chúng tôi?</h2>
                <div className="grid md:grid-cols-3 gap-8 text-left">
                    <div className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
                        <Trophy className="w-10 h-10 text-yellow-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Chứng chỉ uy tín</h3>
                        <p className="text-gray-400">Hoàn thành khóa học và nhận chứng nhận được công nhận bởi các doanh nghiệp lớn.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
                        <Target className="w-10 h-10 text-red-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Học thực chiến</h3>
                        <p className="text-gray-400">Nội dung bài học tập trung vào thực hành, dự án thực tế giúp bạn làm được việc ngay.</p>
                    </div>
                     <div className="p-6 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/10">
                        <Star className="w-10 h-10 text-purple-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Hỗ trợ 24/7</h3>
                        <p className="text-gray-400">Đội ngũ mentor và cộng đồng luôn sẵn sàng giải đáp mọi thắc mắc của bạn.</p>
                    </div>
                </div>
             </div>
        </section>

        {/* ... (Giữ nguyên Courses Section) ... */}
        <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                     <div>
                        <h2 className="text-4xl font-bold text-white mb-2">Khóa học nổi bật</h2>
                        <p className="text-gray-400">Những khóa học được yêu thích nhất tháng này</p>
                     </div>
                     <Link to="/courses" className="text-blue-400 hover:text-blue-300 hidden md:flex items-center gap-1">
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                     </Link>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading ? (
                         <div className="col-span-4 text-center text-gray-500 py-10">Đang tải dữ liệu...</div>
                    ) : (
                        courses.slice(0, 4).map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))
                    )}
                </div>
            </div>
        </section>

        {/* 2. THÊM PHẦN TESTIMONIALS VÀO ĐÂY */}
        <Testimonials />

      </div>
    </div>
  );
}

export default HomePage;