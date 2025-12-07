import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRight, Clock, Users, DollarSign, CheckCircle } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext'; 
// import PaymentConfirmModal from '../components/PaymentConfirmModal'; // ĐÃ BỎ MODAL

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
  
  // Đã bỏ các State cho Modal Thanh toán

  const isEnrolled = user?.coursesEnrolled?.includes(courseId) || false;

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseRes = await axios.get(`/api/courses/${courseId}`);
        setCourse(courseRes.data);

        const lessonsRes = await axios.get(`/api/lessons?courseId=${courseId}`);
        setLessons(lessonsRes.data);
      } catch (err) {
        console.error("Lỗi tải dữ liệu khóa học:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);
  
  // Xử lý khi bấm nút "Ghi danh ngay"
  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để ghi danh khóa học!");
      navigate('/login');
      return;
    }

    // Luôn cho phép đăng ký trực tiếp (Bỏ qua kiểm tra giá và thanh toán)
    enrollDirectly();
  };

  // Logic đăng ký khóa học trực tiếp
  const enrollDirectly = async () => {
      try {
          const res = await axios.post('/api/enroll', { 
            userId: user!.id, 
            courseId: courseId 
          });
          if (res.status === 200 || res.status === 201) {
            alert("Ghi danh thành công! Bạn có thể vào học ngay.");
            refreshUser(); // Làm mới thông tin user để cập nhật trạng thái đã học
          }
      } catch (err: any) {
          alert(`Lỗi: ${err.response?.data?.message || 'Không thể ghi danh'}`);
      }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Đang tải...</div>;
  if (!course) return <div className="flex justify-center items-center min-h-screen text-red-500">Không tìm thấy khóa học.</div>;

  return (
    <div className="bg-gray-50 pt-8 pb-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/courses" className="hover:text-purple-600">Khóa học</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{course.title}</span>
        </div>

        {/* Course Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{course.title}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">{course.description}</p>
          
          <div className="flex items-center justify-center gap-6 text-gray-700 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>{course.students || 0} học viên</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>{course.duration || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-purple-600">{formatCurrency(course.price)}</span>
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div className="flex justify-center mb-10">
            <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="rounded-xl shadow-xl border border-gray-100 max-w-3xl w-full h-96 object-cover" 
            />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Giới thiệu khóa học</h3>
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Nội dung ({lessons.length} bài học)</h3>
                    <ul className="space-y-3">
                        {lessons.length > 0 ? (
                            lessons.map((lesson, index) => (
                                <li key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="bg-purple-100 text-purple-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold">{index + 1}</span>
                                    <span className="text-gray-800 font-medium">{lesson.title}</span>
                                </li>
                            ))
                        ) : (<li className="text-gray-500 italic">Chưa có bài học nào.</li>)}
                    </ul>
                </div>
            </div>

            <div className="lg:col-span-1 sticky top-24 h-fit">
                <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Thông tin khóa học</h3>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex justify-between"><span>Giảng viên:</span><span>{course.instructor || 'N/A'}</span></li>
                        <li className="flex justify-between"><span>Cấp độ:</span><span>{course.level || 'N/A'}</span></li>
                        <li className="flex justify-between"><span>Đánh giá:</span><span>{course.rating || 0} / 5</span></li>
                    </ul>
                    
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h4 className="text-xl font-bold text-gray-900 mb-3">
                            Giá: <span className="text-purple-600">{formatCurrency(course.price)}</span>
                        </h4>
                        
                        {isEnrolled ? (
                          <Link 
                            to={`/watch/${courseId}/lesson/${lessons[0]?.id || 1}`}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-xl block text-center hover:bg-green-700 transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5"/> Vào học ngay
                          </Link>
                        ) : (
                          <button
                            onClick={handleEnrollClick}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl block text-center hover:shadow-lg transition transform hover:scale-105"
                          >
                            Ghi danh ngay
                          </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailPage;