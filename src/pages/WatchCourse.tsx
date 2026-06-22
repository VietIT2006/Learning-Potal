import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getLessonById, getLessons, getProgress, getQuizzes, completeLesson } from '../lib/supabaseService';
import { PlayCircle, FileQuestion, ChevronRight, CheckCircle, Clock, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FullScreenLoader } from '../components/LoadingSpinner'; 
import toast from 'react-hot-toast';
import ParticleBackground from '../components/ParticleBackground';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Certificate from '../components/Certificate';
import { getCourseById } from '../lib/supabaseService';

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

const getEmbedUrl = (watchUrl: string) => {
    try {
        const url = new URL(watchUrl);
        const v = url.searchParams.get('v');
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
  const [progress, setProgress] = useState<{ completedLessons: number[], progressPercentage: number }>({ completedLessons: [], progressPercentage: 0 });
  const [courseTitle, setCourseTitle] = useState('');
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const certificateRef = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async (userId: number) => {
    try {
        // SỬA URL THÀNH /api
        const progressData = await getProgress(userId, courseIdNum);
        setProgress(progressData);
    } catch(err) {
        console.error("Lỗi tải tiến độ:", err);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user) {
          return;
      }
      
      try {
        setLoading(true);
        
        // SỬA URL THÀNH /api
        const lessonData = await getLessonById(lessonIdNum);
        setCurrentLesson(lessonData);

        const courseData = await getCourseById(courseIdNum);
        if (courseData) setCourseTitle(courseData.title);

        // SỬA URL THÀNH /api
        const allLessonsData = await getLessons(courseIdNum);
        setAllLessons(allLessonsData);

        await fetchProgress(user.id);

        // SỬA URL THÀNH /api
        const quizzesData = await getQuizzes(lessonIdNum);
        if (quizzesData.length > 0) {
          setQuizId(quizzesData[0].id);
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
  
  const isLessonCompleted = progress.completedLessons.includes(lessonIdNum);
  
  const handleCompleteLesson = async () => {
      if (isLessonCompleted) return;

      try {
          // SỬA URL THÀNH /api
          await completeLesson(user!.id, courseIdNum, lessonIdNum);
          
          toast.success('Bài học đã hoàn thành! Tiến độ đã được cập nhật.');
          await fetchProgress(user!.id);
          
      } catch(err) {
          console.error('Lỗi đánh dấu hoàn thành:', err);
          toast.error('Lỗi cập nhật tiến độ.');
      }
  }

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current || !user) return;
    try {
      setIsGeneratingCertificate(true);
      toast.loading("Đang tạo chứng chỉ...", { id: "cert-loading" });
      
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // jspdf default points or mm, we use landscape A4 equivalent or specific size
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [800, 600]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, 800, 600);
      pdf.save(`ChungChi_${courseTitle.replace(/\s+/g, '_')}.pdf`);
      
      const pdfBase64 = pdf.output('datauristring');
      
      // Send to server
      const response = await fetch('http://localhost:3001/api/send-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          userName: user.fullname,
          courseName: courseTitle,
          pdfBase64
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Lỗi server: ${response.status} - ${errText}`);
      }
      toast.success("Đã tải xuống chứng chỉ và gửi về email của bạn!", { id: "cert-loading" });
    } catch (error: any) {
      console.error('Lỗi khi tạo chứng chỉ:', error);
      toast.error(`Có lỗi: ${error?.message || "Không xác định"}`, { id: "cert-loading" });
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  if (loading) return <FullScreenLoader message="Đang tải dữ liệu bài học..." />;
  if (!currentLesson) return <div className="flex h-screen items-center justify-center">Không tìm thấy bài học.</div>;

  return (
    <div className="relative w-full min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <div className="gradient-bg"></div>
      <ParticleBackground />

      <div className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/courses" className="hover:text-purple-400 transition-colors">Khóa học</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Chi tiết khóa học</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{currentLesson.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
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

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{currentLesson.title}</h1>
                <p className="text-gray-400 text-sm">Bài học {currentLesson.id} • Tiến độ: {progress.progressPercentage}%</p>
              </div>

              {progress.progressPercentage === 100 && (
                <button
                  onClick={handleDownloadCertificate}
                  disabled={isGeneratingCertificate}
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-105 transition mb-4 sm:mb-0 ml-auto"
                >
                  <Trophy className="w-5 h-5" />
                  {isGeneratingCertificate ? "Đang xử lý..." : "Nhận chứng chỉ"}
                </button>
              )}

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
                        ? 'bg-green-500/20 text-green-400 border border-green-500/20 cursor-default' 
                        : 'bg-green-600 text-white hover:bg-green-500'
                     }`
                   }
                >
                  <CheckCircle className="w-5 h-5" /> 
                  {isLessonCompleted ? 'ĐÃ HOÀN THÀNH' : 'Đánh dấu hoàn thành'}
                </button>
              )}
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/10">
              <h3 className="font-bold text-white mb-4">Mô tả bài học</h3>
              <p className="text-gray-400 leading-relaxed">
                Trong bài học này, chúng ta sẽ tìm hiểu sâu về các khái niệm cốt lõi. 
                Hãy chắc chắn rằng bạn đã xem kỹ video trước khi làm bài tập kiểm tra kiến thức.
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 overflow-hidden sticky top-24">
              <div className="p-4 border-b border-white/10 bg-white/5">
                <h3 className="font-bold text-white">Nội dung khóa học</h3>
                <p className="text-xs text-gray-400 mt-1">Tiến độ khóa học: {progress.progressPercentage}%</p>
                <div className="w-full h-1 bg-white/10 rounded-full mt-2">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress.progressPercentage}%` }}></div>
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
                      className={`flex items-start gap-3 p-4 border-b border-white/5 transition hover:bg-white/5 ${
                        isActive ? 'bg-purple-500/10 border-l-4 border-l-purple-500' : ''
                      }`}
                    >
                      <div className="mt-1">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-400" /> 
                        ) : isActive ? (
                          <PlayCircle className="w-5 h-5 text-purple-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-600 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium ${isActive ? 'text-purple-400' : 'text-gray-300'}`}>
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

      {/* Hidden Certificate Generator */}
      <div style={{ position: 'fixed', top: '200%', left: '200%', pointerEvents: 'none' }}>
        <div ref={certificateRef}>
          <Certificate 
            studentName={user?.fullname || 'Học viên'} 
            courseName={courseTitle || 'Khóa học của bạn'} 
            date={new Date().toLocaleDateString('vi-VN')} 
          />
        </div>
      </div>
    </div>
  </div>
  );
}

export default WatchCoursePage;