import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, Trash2, Save, Video, FileQuestion, 
  ChevronDown, ChevronUp, ArrowLeft, CheckCircle 
} from 'lucide-react';

// --- Types ---
interface Lesson {
  id: number;
  courseId: number;
  title: string;
  videoUrl: string;
  duration: string;
}

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

interface Quiz {
  id: number;
  lessonId: number;
  title: string;
  questions: Question[];
}

export default function CourseContent() {
  const { id } = useParams(); // Lấy courseId từ URL
  const courseId = Number(id);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  
  // Form states
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Load danh sách bài học của khóa học này
  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/lessons?courseId=${courseId}`);
      setLessons(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi tải bài học:", error);
    }
  };

  // 2. Load Quiz khi chọn một bài học
  const handleSelectLesson = async (lessonId: number) => {
    if (activeLessonId === lessonId) {
      setActiveLessonId(null); // Toggle off
      setQuiz(null);
      return;
    }
    setActiveLessonId(lessonId);
    try {
      const res = await axios.get(`http://localhost:3001/quizzes?lessonId=${lessonId}`);
      if (res.data.length > 0) {
        setQuiz(res.data[0]);
      } else {
        // Tạo quiz rỗng tạm thời (chưa lưu DB)
        setQuiz({
          id: Date.now(), // ID tạm
          lessonId: lessonId,
          title: 'Bài kiểm tra',
          questions: []
        });
      }
    } catch (error) {
      console.error("Lỗi tải quiz:", error);
    }
  };

  // 3. Thêm bài học mới
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle || !newVideoUrl) return alert("Vui lòng nhập đủ thông tin!");

    try {
        // Lấy ID lớn nhất hiện tại để +1 (Logic đơn giản cho frontend)
       const allLessons = await axios.get('http://localhost:3001/lessons');
       const maxId = allLessons.data.reduce((max: number, l: any) => l.id > max ? l.id : max, 0);

      const newLesson = {
        id: maxId + 1,
        courseId: courseId,
        title: newLessonTitle,
        videoUrl: newVideoUrl,
        duration: "10:00" // Mặc định hoặc thêm input nhập
      };

      await axios.post('http://localhost:3001/lessons', newLesson);
      alert("Thêm bài học thành công!");
      setNewLessonTitle('');
      setNewVideoUrl('');
      fetchLessons();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi thêm bài học");
    }
  };

  // 4. Xóa bài học
  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài học này?")) return;
    try {
      await axios.delete(`http://localhost:3001/lessons/${lessonId}`);
      // Xóa luôn quiz liên quan (nếu muốn logic chặt chẽ hơn)
      fetchLessons();
    } catch (error) {
      alert("Lỗi khi xóa");
    }
  };

  // --- LOGIC XỬ LÝ QUIZ (QUESTION) ---

  const addQuestion = () => {
    if (!quiz) return;
    const newQuestion: Question = {
      id: Date.now().toString(),
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0
    };
    setQuiz({ ...quiz, questions: [...quiz.questions, newQuestion] });
  };

  const updateQuestion = (qIndex: number, field: keyof Question, value: any) => {
    if (!quiz) return;
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    if (!quiz) return;
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const saveQuiz = async () => {
    if (!quiz) return;
    try {
      // Kiểm tra xem quiz đã tồn tại trên DB chưa
      const checkRes = await axios.get(`http://localhost:3001/quizzes?lessonId=${quiz.lessonId}`);
      
      if (checkRes.data.length > 0) {
        // Update (PUT)
        const existingId = checkRes.data[0].id;
        await axios.put(`http://localhost:3001/quizzes/${existingId}`, { ...quiz, id: existingId });
      } else {
        // Create (POST)
        // Lấy max ID cho quiz
        const allQuizzes = await axios.get('http://localhost:3001/quizzes');
        const maxId = allQuizzes.data.reduce((max: number, q: any) => q.id > max ? q.id : max, 0);
        await axios.post('http://localhost:3001/quizzes', { ...quiz, id: maxId + 1 });
      }
      alert("Lưu câu hỏi trắc nghiệm thành công!");
    } catch (error) {
      console.error("Lỗi lưu quiz:", error);
      alert("Có lỗi xảy ra khi lưu quiz.");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/admin/courses" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-800">Nội dung khóa học (ID: {courseId})</h2>
      </div>

      {/* --- SECTION 1: THÊM BÀI HỌC --- */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-600" /> Thêm bài học mới
        </h3>
        <form onSubmit={handleAddLesson} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài học</label>
            <input 
              required
              type="text" 
              className="w-full p-2 border rounded-lg" 
              placeholder="Ví dụ: Giới thiệu React Router"
              value={newLessonTitle}
              onChange={e => setNewLessonTitle(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Video (URL)</label>
            <input 
              required
              type="text" 
              className="w-full p-2 border rounded-lg" 
              placeholder="https://..."
              value={newVideoUrl}
              onChange={e => setNewVideoUrl(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm
          </button>
        </form>
      </div>

      {/* --- SECTION 2: DANH SÁCH BÀI HỌC --- */}
      <div className="space-y-4">
        {loading ? <p>Đang tải...</p> : lessons.map((lesson, index) => (
          <div key={lesson.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Lesson Header */}
            <div className="p-4 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="bg-gray-200 text-gray-600 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-gray-800">{lesson.title}</h4>
                  <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                    Xem video
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleSelectLesson(lesson.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                    activeLessonId === lesson.id ? 'bg-purple-100 text-purple-700' : 'bg-white border hover:bg-gray-50'
                  }`}
                >
                  <FileQuestion className="w-4 h-4" /> 
                  {activeLessonId === lesson.id ? 'Đóng Quiz' : 'Soạn Quiz'}
                  {activeLessonId === lesson.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => handleDeleteLesson(lesson.id)} 
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* --- QUIZ EDITOR (Hiện ra khi bấm Soạn Quiz) --- */}
            {activeLessonId === lesson.id && quiz && (
              <div className="p-6 border-t border-gray-100 animate-fade-in bg-slate-50">
                <div className="flex justify-between items-center mb-6">
                  <h5 className="font-bold text-gray-700">Câu hỏi trắc nghiệm cho bài học này</h5>
                  <button onClick={saveQuiz} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 shadow-sm">
                    <Save className="w-4 h-4" /> Lưu câu hỏi
                  </button>
                </div>

                <div className="space-y-6">
                  {quiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative">
                      <span className="absolute top-4 right-4 text-xs font-bold text-gray-300">Câu {qIndex + 1}</span>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Câu hỏi</label>
                        <input 
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-purple-500 outline-none"
                          value={q.questionText}
                          onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                          placeholder="Nhập nội dung câu hỏi..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {q.options.map((opt, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                                q.correctAnswerIndex === optIndex ? 'bg-green-500 text-white border-green-500' : 'bg-gray-100 text-gray-500'
                              }`}>
                              {['A','B','C','D'][optIndex]}
                            </div>
                            <input 
                              className={`flex-1 p-2 border rounded text-sm ${q.correctAnswerIndex === optIndex ? 'border-green-500 bg-green-50' : ''}`}
                              value={opt}
                              onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                              placeholder={`Đáp án ${optIndex + 1}`}
                            />
                            <input 
                              type="radio" 
                              name={`correct-${qIndex}`}
                              checked={q.correctAnswerIndex === optIndex}
                              onChange={() => updateQuestion(qIndex, 'correctAnswerIndex', optIndex)}
                              className="w-4 h-4 accent-green-600 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => {
                          const newQuestions = quiz.questions.filter((_, i) => i !== qIndex);
                          setQuiz({ ...quiz, questions: newQuestions });
                        }}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline"
                      >
                        Xóa câu hỏi này
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={addQuestion}
                  className="mt-6 w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Thêm câu hỏi mới
                </button>
              </div>
            )}
          </div>
        ))}
        
        {lessons.length === 0 && (
          <div className="text-center py-10 text-gray-500">Chưa có bài học nào. Hãy thêm bài học mới!</div>
        )}
      </div>
    </div>
  );
}