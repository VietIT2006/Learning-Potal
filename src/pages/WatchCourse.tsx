import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlayCircle, FileQuestion, ChevronRight, CheckCircle, Clock } from 'lucide-react';

// Định nghĩa kiểu
interface Lesson {
  id: number;
  courseId: number;
  title: string;
  videoUrl: string;
  duration?: string; // Thêm trường thời lượng giả lập
}

// HÀM MỚI: Chuyển đổi URL xem (watch) thành URL nhúng (embed) của YouTube
const getEmbedUrl = (watchUrl: string) => {
    try {
        const url = new URL(watchUrl);
        const v = url.searchParams.get('v'); // Lấy video ID
        if (v) {
            // Trả về định dạng nhúng, thêm autoplay và rel=0
            return `https://www.youtube.com/embed/${v}?autoplay=1&rel=0`;
        }
    } catch (e) {
        // Trường hợp URL không hợp lệ, trả về URL gốc
        console.error("URL video không hợp lệ:", watchUrl);
    }
    return watchUrl;
};

function WatchCoursePage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [quizId, setQuizId] = useState<number | null>(null); // State để lưu ID bài quiz nếu có
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Lấy thông tin bài học hiện tại
        const lessonRes = await axios.get(`http://localhost:3001/lessons/${lessonId}`);
        setCurrentLesson(lessonRes.data);

        // 2. Lấy danh sách tất cả bài học của khóa này
        const allLessonsRes = await axios.get(`http://localhost:3001/lessons?courseId=${courseId}`);
        setAllLessons(allLessonsRes.data);

        // 3. Kiểm tra xem bài học này có Quiz không
        const quizRes = await axios.get(`http://localhost:3001/quizzes?lessonId=${lessonId}`);
        if (quizRes.data.length > 0) {
          setQuizId(quizRes.data[0].id);
        } else {
          setQuizId(null);
        }

      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId]);

  if (loading) return <div className="flex h-screen items-center justify-center">Đang tải...</div>;
  if (!currentLesson) return <div className="flex h-screen items-center justify-center">Không tìm thấy bài học.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb đơn giản */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/courses" className="hover:text-purple-600">Khóa học</Link>
          <ChevronRight className="w-4 h-4" />
          <span>Chi tiết khóa học</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{currentLesson.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: Video Player & Thông tin bài học */}
          <div className="lg:col-span-2 space-y-6">
            {/* THAY THẾ MÔ PHỎNG BẰNG IFRAME NHÚNG VIDEO THỰC TẾ */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative">
              <iframe
                className="w-full h-full"
                // Sử dụng hàm mới để có URL nhúng
                src={getEmbedUrl(currentLesson.videoUrl)} 
                title={currentLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Lesson Info & Quiz Button */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentLesson.title}</h1>
                <p className="text-gray-500 text-sm">Bài học {currentLesson.id} • Cập nhật mới nhất</p>
              </div>

              {/* NÚT QUIZ */}
              {quizId ? (
                <button
                  onClick={() => navigate(`/quiz/${quizId}`)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 transition animate-bounce-small"
                >
                  <FileQuestion className="w-5 h-5" />
                  Làm bài kiểm tra
                </button>
              ) : (
                <div className="text-gray-400 text-sm italic flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
                   <CheckCircle className="w-4 h-4" /> Đã hoàn thành bài giảng
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Mô tả bài học</h3>
              <p className="text-gray-600 leading-relaxed">
                Trong bài học này, chúng ta sẽ tìm hiểu sâu về các khái niệm cốt lõi. 
                Hãy chắc chắn rằng bạn đã xem kỹ video trước khi làm bài tập kiểm tra kiến thức.
              </p>
            </div>
          </div>

          {/* CỘT PHẢI: Danh sách bài học */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900">Nội dung khóa học</h3>
                <p className="text-xs text-gray-500 mt-1">{allLessons.length} bài học</p>
              </div>
              
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                {allLessons.map((lesson, index) => {
                  const isActive = lesson.id === Number(lessonId);
                  return (
                    <Link
                      key={lesson.id}
                      to={`/watch/${courseId}/lesson/${lesson.id}`}
                      className={`flex items-start gap-3 p-4 border-b border-gray-50 transition hover:bg-purple-50 ${
                        isActive ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                      }`}
                    >
                      <div className="mt-1">
                        {isActive ? (
                          <PlayCircle className="w-5 h-5 text-purple-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium ${isActive ? 'text-purple-700' : 'text-gray-700'}`}>
                          {lesson.title}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>10:00</span> {/* Giả lập thời lượng */}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default WatchCoursePage;