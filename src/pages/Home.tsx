import React, { useState, useEffect } from 'react';
import { getCourses, getTopDepositors } from '../lib/supabaseService';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Star, Trophy, Target, Crown } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import ParticleBackground from '../components/ParticleBackground';
import Testimonials from '../components/Testimonials';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { useTranslation } from 'react-i18next';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  price?: number; 
}

function HomePage() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [topDepositors, setTopDepositors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
        try {
          const [data, topDeps] = await Promise.all([
            getCourses(),
            getTopDepositors(3)
          ]);
          setCourses(data);
          setTopDepositors(topDeps);
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

      <div className="relative z-10 pt-16">
        
        <AnnouncementBanner />

        {/* Hero Section */}
        <section className="relative pt-16 pb-20 px-4">
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
                    {t('home.hero_title')}
                </h1>
                {/* THAY ĐỔI: text-gray-400 giúp chữ thanh thoát hơn trên nền tối */}
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    {t('home.hero_subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <Link to="/courses" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold hover:shadow-[0_0_30px_rgba(102,126,234,0.6)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                        {t('home.explore_courses')} <ArrowRight className="w-5 h-5" />
                    </Link>
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
                <h2 className="text-3xl font-bold text-white mb-12">{t('home.features_title')}</h2>
                <div className="grid md:grid-cols-3 gap-8 text-left">
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
                        <Trophy className="w-12 h-12 text-yellow-500 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-3">{t('home.feature_3_title')}</h3>
                        <p className="text-gray-400 leading-relaxed">{t('home.feature_3_desc')}</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
                        <Target className="w-12 h-12 text-red-500 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-3">{t('home.feature_1_title')}</h3>
                        <p className="text-gray-400 leading-relaxed">{t('home.feature_1_desc')}</p>
                    </div>
                     <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors">
                        <Star className="w-12 h-12 text-purple-500 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-3">{t('home.feature_4_title')}</h3>
                        <p className="text-gray-400 leading-relaxed">{t('home.feature_4_desc')}</p>
                    </div>
                </div>
             </div>
        </section>

        {/* Top Depositors Section */}
        {topDepositors.length > 0 && (
          <section className="py-20 px-4 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="max-w-5xl mx-auto text-center relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Bảng Vàng <span className="text-yellow-400">Đại Gia</span></h2>
              <p className="text-gray-400 mb-16">Vinh danh những học viên nạp tiền và đóng góp tích cực nhất trong hệ thống.</p>
              
              <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-8">
                {/* Top 2 */}
                {topDepositors[1] && (
                  <div className="w-full md:w-1/3 bg-white/5 backdrop-blur-md border border-slate-300/30 p-6 rounded-3xl text-center transform hover:-translate-y-2 transition-all relative mt-8 md:mt-0 order-2 md:order-1">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center border-4 border-[#0f172a] shadow-[0_0_20px_rgba(203,213,225,0.4)]">
                      <span className="font-bold text-[#0f172a]">2</span>
                    </div>
                    {topDepositors[1].avatarUrl ? (
                      <img src={topDepositors[1].avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full mx-auto mt-6 mb-4 object-cover border-2 border-slate-400/50" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-800 mx-auto mt-6 mb-4 flex items-center justify-center text-2xl font-bold text-slate-300 border-2 border-slate-400/50">
                        {topDepositors[1].fullname.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-2 truncate">{topDepositors[1].fullname}</h3>
                    <p className="text-yellow-400 font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(topDepositors[1].totalDeposit)}</p>
                  </div>
                )}

                {/* Top 1 */}
                {topDepositors[0] && (
                  <div className="w-full md:w-1/3 bg-gradient-to-b from-yellow-900/40 to-black/60 backdrop-blur-md border-2 border-yellow-400 p-8 rounded-3xl text-center transform hover:-translate-y-4 transition-all relative shadow-[0_0_50px_rgba(250,204,21,0.4)] z-20 order-1 md:order-2">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center border-4 border-[#0f172a] shadow-[0_0_30px_rgba(250,204,21,0.8)] animate-pulse">
                      <Crown className="w-8 h-8 text-[#0f172a]" />
                    </div>
                    {topDepositors[0].avatarUrl ? (
                      <img src={topDepositors[0].avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full mx-auto mt-6 mb-4 object-cover border-4 border-yellow-400/50 shadow-inner" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto mt-6 mb-4 flex items-center justify-center text-4xl font-bold text-yellow-400 border-4 border-yellow-400/50 shadow-inner">
                        {topDepositors[0].fullname.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-600 mb-2 truncate uppercase tracking-wider">{topDepositors[0].fullname}</h3>
                    <p className="text-yellow-400 font-bold text-xl mb-4">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(topDepositors[0].totalDeposit)}</p>
                    <div className="bg-yellow-500/20 py-2 px-4 rounded-full inline-block border border-yellow-500/50">
                      <span className="text-yellow-300 text-sm font-bold tracking-widest uppercase">👑 Vị Vua Hệ Thống 👑</span>
                    </div>
                  </div>
                )}

                {/* Top 3 */}
                {topDepositors[2] && (
                  <div className="w-full md:w-1/3 bg-white/5 backdrop-blur-md border border-orange-400/30 p-6 rounded-3xl text-center transform hover:-translate-y-2 transition-all relative mt-8 md:mt-0 order-3 md:order-3">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center border-4 border-[#0f172a] shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                      <span className="font-bold text-[#0f172a]">3</span>
                    </div>
                    {topDepositors[2].avatarUrl ? (
                      <img src={topDepositors[2].avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full mx-auto mt-6 mb-4 object-cover border-2 border-orange-400/50" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-slate-800 mx-auto mt-6 mb-4 flex items-center justify-center text-2xl font-bold text-orange-300 border-2 border-orange-400/50">
                        {topDepositors[2].fullname.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-2 truncate">{topDepositors[2].fullname}</h3>
                    <p className="text-yellow-400 font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(topDepositors[2].totalDeposit)}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

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
                         <div className="col-span-1 md:col-span-2 lg:col-span-4"><LoadingSpinner message="Đang tải các khóa học..." /></div>
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