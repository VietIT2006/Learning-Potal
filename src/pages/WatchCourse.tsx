import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlayCircle, FileQuestion, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // <-- Import Auth

// Định nghĩa kiểu
interface Lesson {
  id: number;
  courseId: number;
  title: string;
  videoUrl: string;
  duration?: string; 
}

interface Progress {
    completedLessons: number[];
    progressPercentage: number;
}

// HÀM: Chuyển đổi URL xem (watch) thành URL nhúng (embed)
const getEmbedUrl = (watchUrl: string) => {
    try {
        const url = new URL(watchUrl);
        const v = url.searchParams.get('v'); // Lấy video ID
        if (v) {
            return `https://www.youtube.com/embed/${v}?autoplay=1&rel=0`;
        }
    } catch (e) {
        console.error("URL video không hợp lệ:", watchUrl);
    }
    return watchUrl;
};

function WatchCoursePage() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); 
  
  const courseIdNum = Number(courseId);
  const lessonIdNum = Number(lessonId);

  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [progress, setProgress] = useState<Progress>({ completedLessons: [], progressPercentage: 0 }); // <-- Progress State
  const [loading, setLoading] = useState(true);

  // Hàm Fetch Tiến độ
  const fetchProgress = async (userId: number) => {
    try {
        const res = await axios.get(`http://localhost:3001/progress?userId=${userId}&courseId=${courseIdNum}`);
        setProgress(res.data);
    } catch(err) {
        console.error("Lỗi tải tiến độ:", err);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      // Bảo vệ route, chỉ chạy khi đăng nhập
      if (!isAuthenticated || !user) {
          return;
      }
      
      try {
        setLoading(true);
        
        // 1. Lấy thông tin bài học hiện tại
        const lessonRes = await axios.get(`http://localhost:3001/lessons/${lessonId}`);
        setCurrentLesson(lessonRes.data);

        // 2. Lấy danh sách tất cả bài học của khóa này
        const allLessonsRes = await axios.get(`http://localhost:3001/lessons?courseId=${courseId}`);
        setAllLessons(allLessonsRes.data);

        // 3. Lấy tiến độ của người dùng
        await fetchProgress(user.id);

        // 4. Kiểm tra xem bài học này có Quiz không
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

    if (isAuthenticated && user) {
        fetchData();
    }
  }, [courseId, lessonId, isAuthenticated, user]);
  
  // Kiểm tra bài học hiện tại đã hoàn thành chưa
  const isLessonCompleted = progress.completedLessons.includes(lessonIdNum);
  
  // Hàm xử lý hoàn thành bài học
  const handleCompleteLesson = async () => {
      if (isLessonCompleted) return;

      try {
          await axios.post('http://localhost:3001/progress/complete-lesson', {
              userId: user!.id,
              courseId: courseIdNum,
              lessonId: lessonIdNum
          });
          
          alert('Bài học đã hoàn thành! Tiến độ đã được cập nhật.');
          
          // Tải lại progress để cập nhật UI
          await fetchProgress(user!.id);
          
      } catch(err) {
          console.error('Lỗi đánh dấu hoàn thành:', err);
          alert('Lỗi cập nhật tiến độ.');
      }
  }

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
            {/* Video Player Container */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative">
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(currentLesson.videoUrl)} 
                title={currentLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Lesson Info & Complete Button */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentLesson.title}</h1>
                <p className="text-gray-500 text-sm">Bài học {currentLesson.id} • Tiến độ: {progress.progressPercentage}%</p>
              </div>

              {/* NÚT QUIZ / HOÀN THÀNH */}
              {quizId ? (
                <button
                  onClick={() => navigate(`/quiz/${quizId}`)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 transition animate-bounce-small"
                >
                  <FileQuestion className="w-5 h-5" />
                  Làm bài kiểm tra
                </button>
              ) : (
                <button
                   onClick={handleCompleteLesson} 
                   disabled={isLessonCompleted}
                   className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition 
                     ${isLessonCompleted 
                        ? 'bg-green-100 text-green-700 cursor-default' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                     }`
                   }
                >
                  <CheckCircle className="w-5 h-5" /> 
                  {isLessonCompleted ? 'ĐÃ HOÀN THÀNH' : 'Đánh dấu hoàn thành'}
                </button>
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
                <p className="text-xs text-gray-500 mt-1">Tiến độ khóa học: {progress.progressPercentage}%</p>
                <div className="w-full h-1 bg-purple-200 rounded-full mt-2">
                    <div className="h-full bg-purple-600 rounded-full transition-all duration-500" style={{ width: `${progress.progressPercentage}%` }}></div>
                </div>
              </div>
              
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                {allLessons.map((lesson, index) => {
                  const isActive = lesson.id === lessonIdNum;
                  const isCompleted = progress.completedLessons.includes(lesson.id);
                  
                  return (
                    <Link
                      key={lesson.id}
                      to={`/watch/${courseId}/lesson/${lesson.id}`}
                      className={`flex items-start gap-3 p-4 border-b border-gray-50 transition hover:bg-purple-50 ${
                        isActive ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                      }`}
                    >
                      <div className="mt-1">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" /> 
                        ) : isActive ? (
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
                          <span>10:00</span> 
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