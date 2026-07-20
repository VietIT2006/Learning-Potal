import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCourseById, getLessons, enrollUser, purchaseCourseWithBalance, giftCourseWithBalance } from '../lib/supabaseService';
import { FullScreenLoader } from '../components/LoadingSpinner';
import { ChevronRight, Clock, Users, DollarSign, CheckCircle, Star, BookOpen, Gift, X } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext'; 
import ParticleBackground from '../components/ParticleBackground';
import toast from 'react-hot-toast';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  level: string;
  duration: string;
  instructor: string;
  students: number;
  category: string;
  rating: number;
  reviews: number;
}

interface Lesson {
    id: number;
    title: string;
}

const formatCurrency = (amount: number) => {
    if (amount === 0 || !amount) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
};

function CourseDetailPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth(); 

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Gift states
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [receiverEmail, setReceiverEmail] = useState('');
  const [isGifting, setIsGifting] = useState(false);

  const isEnrolled = user?.coursesEnrolled?.includes(courseId) || false;

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseData = await getCourseById(courseId);
        setCourse(courseData as Course);

        const lessonsData = await getLessons(courseId);
        setLessons(lessonsData as Lesson[]);
      } catch (err) {
        console.error("Lỗi tải dữ liệu khóa học:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);
  
  const originalPrice = course?.price || 0;
  const isTop1 = user?.isTop1;
  const effectivePrice = isTop1 ? originalPrice * 0.5 : originalPrice;

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để ghi danh khóa học!");
      navigate('/login');
      return;
    }

    if (course && originalPrice > 0) {
      if ((user?.balance || 0) < effectivePrice) {
        toast.error('Số dư không đủ. Vui lòng nạp tiền vào ví!');
        navigate('/wallet');
        return;
      }
      if (window.confirm(`Xác nhận mua khóa học này với giá ${formatCurrency(effectivePrice)}? Số dư của bạn sẽ bị trừ đi.`)) {
        purchaseCourse();
      }
    } else {
      enrollDirectly();
    }
  };

  const purchaseCourse = async () => {
    try {
      await purchaseCourseWithBalance(user!.id, courseId, effectivePrice);
      toast.success("Mua khóa học thành công! Bạn có thể vào học ngay.");
      refreshUser(); 
    } catch (err: any) {
      toast.error(`Lỗi: ${err.message || 'Không thể thanh toán'}`);
    }
  };

  const enrollDirectly = async () => {
      try {
          await enrollUser(user!.id, courseId);
          toast.success("Ghi danh thành công! Bạn có thể vào học ngay.");
          refreshUser(); 
      } catch (err: any) {
          toast.error(`Lỗi: ${err.message || 'Không thể ghi danh'}`);
      }
  };

  const handleGiftCourse = async () => {
    if (!receiverEmail.trim()) {
      toast.error('Vui lòng nhập email người nhận!');
      return;
    }
    
    if (receiverEmail === user?.email) {
      toast.error('Bạn không thể tự tặng khóa học cho chính mình!');
      return;
    }

    if ((user?.balance || 0) < effectivePrice) {
      toast.error('Số dư không đủ để tặng. Vui lòng nạp thêm tiền!');
      navigate('/wallet');
      return;
    }

    setIsGifting(true);
    try {
      await giftCourseWithBalance(user!.id, receiverEmail.trim(), courseId, effectivePrice, course!.title, user!.fullname);
      toast.success(`Đã tặng thành công khóa học cho ${receiverEmail}!`);
      setIsGiftModalOpen(false);
      setReceiverEmail('');
      refreshUser();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tặng khóa học');
    } finally {
      setIsGifting(false);
    }
  };

  if (loading) return <FullScreenLoader message="Đang tải dữ liệu khóa học..." />;
  if (!course) return <div className="flex justify-center items-center min-h-screen text-red-500">Không tìm thấy khóa học.</div>;

  return (
    <div className="relative w-full min-h-screen bg-transparent text-white overflow-hidden">
      {/* Nền đồng bộ với trang Home */}
      <div className="gradient-bg"></div>
      <ParticleBackground />

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link to="/courses" className="hover:text-blue-400 transition-colors">Khóa học</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{course.title}</span>
          </div>

          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              {course.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{course.students || 0} học viên</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{course.duration || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{course.rating || 0}/5</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
                {/* Thumbnail Preview */}
                <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60"></div>
                </div>

                {/* Description Box */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <BookOpen className="text-blue-400" /> Giới thiệu khóa học
                    </h3>
                    <p className="text-gray-400 leading-relaxed text-lg">{course.description}</p>
                </div>

                {/* Lessons Box */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8">
                    <h3 className="text-2xl font-bold mb-6">Nội dung ({lessons.length} bài học)</h3>
                    <div className="space-y-3">
                        {lessons.length > 0 ? (
                            lessons.map((lesson, index) => (
                                <div key={lesson.id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group">
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-500 font-mono text-sm">{String(index + 1).padStart(2, '0')}</span>
                                        <span className="text-gray-200 font-medium group-hover:text-blue-400 transition-colors">{lesson.title}</span>
                                    </div>
                                    <Clock className="w-4 h-4 text-gray-600" />
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic">Chưa có bài học nào được cập nhật.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar Sticky */}
            <div className="lg:col-span-1">
                <div className="sticky top-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
                    {/* Background glow effect inside card */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div className="text-gray-400 text-sm mb-2 font-medium uppercase tracking-wider">Học phí</div>
                        <div className="text-4xl font-bold mb-8 text-blue-400">
                            {isTop1 && originalPrice > 0 ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl text-gray-500 line-through">{formatCurrency(originalPrice)}</span>
                                  <span className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-[#0f172a] font-bold px-2 py-1 rounded-full border border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)] flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" /> Đặc quyền Top 1 (-50%)
                                  </span>
                                </div>
                                <span>{formatCurrency(effectivePrice)}</span>
                              </div>
                            ) : (
                              formatCurrency(originalPrice)
                            )}
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm py-3 border-b border-white/5">
                                <span className="text-gray-400">Giảng viên:</span>
                                <span className="font-bold">{course.instructor || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm py-3 border-b border-white/5">
                                <span className="text-gray-400">Cấp độ:</span>
                                <span className="font-bold text-purple-400">{course.level || 'Cơ bản'}</span>
                            </div>
                        </div>

                        {isEnrolled ? (
                          <Link 
                            to={`/watch/${courseId}/lesson/${lessons[0]?.id || 1}`}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-2xl block text-center shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5"/> Vào học ngay
                          </Link>
                        ) : (
                          <button
                            onClick={handleEnrollClick}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-2xl block text-center shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all transform hover:-translate-y-1 active:scale-95"
                          >
                            Ghi danh ngay
                          </button>
                        )}
                        
                        {isTop1 && (
                          <button
                            onClick={() => setIsGiftModalOpen(true)}
                            className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all transform hover:-translate-y-1 active:scale-95"
                          >
                            <Gift className="w-5 h-5" /> Tặng khóa học này
                          </button>
                        )}

                        <p className="text-center text-xs text-gray-500 mt-6 italic">
                            Truy cập trọn đời • Chứng chỉ hoàn thành
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gift Modal */}
      {isGiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#1e293b] rounded-2xl p-8 max-w-md w-full relative shadow-2xl border border-slate-700">
            <button onClick={() => setIsGiftModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Tặng Khóa Học</h2>
              <p className="text-slate-400 mt-2">Nhập email của người mà bạn muốn tặng khóa học này.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email người nhận</label>
                <input
                  type="email"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                  placeholder="ví dụ: ban@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all"
                  disabled={isGifting}
                />
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-slate-300">Khóa học:</span>
                  <span className="text-white font-medium truncate ml-4">{course?.title}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Giá ưu đãi (Top 1):</span>
                  <span className="text-yellow-400 font-bold">{formatCurrency(effectivePrice)}</span>
                </div>
              </div>

              <button
                onClick={handleGiftCourse}
                disabled={isGifting || !receiverEmail.trim()}
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGifting ? 'Đang xử lý...' : 'Xác nhận tặng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetailPage;