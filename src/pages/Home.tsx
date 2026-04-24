import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Star, Trophy, Target } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import ParticleBackground from '../components/ParticleBackground';
import Testimonials from '../components/Testimonials';

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
    { label: 'Khóa học Online', value: '50+', icon: BookOpen, color: 'text-blue-400' },
    { label: 'Học viên tích cực', value: '10K+', icon: Users, color: 'text-purple-400' },
    { label: 'Giảng viên uy tín', value: '100+', icon: Star, color: 'text-yellow-400' }
  ];

  return (
    // THAY ĐỔI: bg-transparent để hiện nền của body (#0a0a0a) và gradient-bg
    <div className="relative w-full min-h-screen bg-transparent text-white overflow-hidden">
      {/* Nền gradient động từ App.css */}
      <div className="gradient-bg"></div>
      <ParticleBackground />

      <div className="relative z-10">
        
        {/* Hero Section */}
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
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in-up">
                    Học tập <span className="text-gradient">Không Giới Hạn</span>
                </h1>
                {/* THAY ĐỔI: text-gray-400 giúp chữ thanh thoát hơn trên nền tối */}
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    Tiếp cận tri thức từ các chuyên gia hàng đầu. 
                    Nâng cao kỹ năng, phát triển sự nghiệp với lộ trình cá nhân hóa.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <Link to="/courses" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-[0_0_30px_rgba(102,126,234,0.6)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                        Khám phá khóa học <ArrowRight className="w-5 h-5" />
                    </Link>
                    <button className="px-8 py-4 rounded-full font-bold text-white border border-white/10 hover:bg-white/5 transition-all backdrop-blur-sm">
                        Lộ trình học tập
                    </button>
                </div>
            </div>
        </section>

        {/* Stats Section */}
        <section className="py-10 px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                {stats.map((stat, idx) => (
                    // THAY ĐỔI: Viền border-white/5 và hover sáng hơn
                    <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl text-center hover:border-blue-500/30 transition-all duration-300 group">
                        <div className={`w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                        <div className="text-gray-500 font-medium group-hover:text-gray-300 transition-colors">{stat.label}</div>
                    </div>
                ))}
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
             <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-white mb-12">Tại sao chọn chúng tôi?</h2>
                <div className="grid md:grid-cols-3 gap-8 text-left">
                    {/* Thẻ Feature với hiệu ứng Gradient mờ */}
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
                        <Trophy className="w-12 h-12 text-yellow-500 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-3">Chứng chỉ uy tín</h3>
                        <p className="text-gray-400 leading-relaxed">Hoàn thành khóa học và nhận chứng nhận được công nhận bởi các doanh nghiệp lớn.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
                        <Target className="w-12 h-12 text-red-500 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-3">Học thực chiến</h3>
                        <p className="text-gray-400 leading-relaxed">Nội dung bài học tập trung vào thực hành, dự án thực tế giúp bạn làm được việc ngay.</p>
                    </div>
                     <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
                        <Star className="w-12 h-12 text-purple-500 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-3">Hỗ trợ 24/7</h3>
                        <p className="text-gray-400 leading-relaxed">Đội ngũ mentor và cộng đồng luôn sẵn sàng giải đáp mọi thắc mắc của bạn.</p>
                    </div>
                </div>
             </div>
        </section>

        {/* Courses Section */}
        <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                     <div>
                        <h2 className="text-4xl font-bold text-white mb-2">Khóa học nổi bật</h2>
                        <p className="text-gray-500">Những khóa học được yêu thích nhất tháng này</p>
                     </div>
                     <Link to="/courses" className="text-blue-400 hover:text-blue-300 hidden md:flex items-center gap-1 transition-colors">
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                     </Link>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading ? (
                         // THAY ĐỔI: Màu chữ loading sáng hơn để dễ nhìn
                         <div className="col-span-4 text-center text-blue-400/60 py-20 animate-pulse">Đang tải dữ liệu...</div>
                    ) : (
                        courses.slice(0, 4).map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))
                    )}
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <div className="pb-20">
          <Testimonials />
        </div>

      </div>
    </div>
  );
}

export default HomePage;