import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLessons, createLesson, deleteLesson, getQuizzes, createQuiz, updateQuiz } from '../../lib/supabaseService';
import toast from 'react-hot-toast';
import { 
  Plus, Trash2, Save, Video, FileQuestion, 
  ChevronDown, ChevronUp, ArrowLeft, PlayCircle
} from 'lucide-react';

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
  const { id } = useParams(); 
  const courseId = Number(id);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      const data = await getLessons(courseId);
      setLessons(data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi tải bài học:", error);
    }
  };

  const handleSelectLesson = async (lessonId: number) => {
    if (activeLessonId === lessonId) {
      setActiveLessonId(null); 
      setQuiz(null);
      return;
    }
    setActiveLessonId(lessonId);
    try {
      const quizzes = await getQuizzes(lessonId);
      if (quizzes.length > 0) {
        setQuiz(quizzes[0]);
      } else {
        setQuiz({
          id: Date.now(), 
          lessonId: lessonId,
          title: 'Bài kiểm tra',
          questions: []
        });
      }
    } catch (error) {
      console.error("Lỗi tải quiz:", error);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle || !newVideoUrl) return toast.error("Vui lòng nhập đủ thông tin!", { style: { background: '#333', color: '#fff' } });

    try {
      await createLesson({
        courseId: courseId,
        title: newLessonTitle,
        videoUrl: newVideoUrl,
        duration: "10:00" 
      });
      toast.success("Thêm bài học thành công!", { style: { background: '#333', color: '#fff' } });
      setNewLessonTitle('');
      setNewVideoUrl('');
      fetchLessons();
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi thêm bài học", { style: { background: '#333', color: '#fff' } });
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài học này?")) return;
    try {
      await deleteLesson(lessonId);
      fetchLessons();
      toast.success("Đã xóa bài học", { style: { background: '#333', color: '#fff' } });
    } catch (error) {
      toast.error("Lỗi khi xóa", { style: { background: '#333', color: '#fff' } });
    }
  };

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
      const existingQuizzes = await getQuizzes(quiz.lessonId);
      
      if (existingQuizzes.length > 0) {
        const existingId = existingQuizzes[0].id;
        await updateQuiz(existingId, { ...quiz, id: existingId });
      } else {
        await createQuiz(quiz);
      }
      toast.success("Lưu câu hỏi trắc nghiệm thành công!", { style: { background: '#333', color: '#fff' } });
    } catch (error) {
      console.error("Lỗi lưu quiz:", error);
      toast.error("Có lỗi xảy ra khi lưu quiz.", { style: { background: '#333', color: '#fff' } });
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative">
      <div className="absolute top-[-50px] left-[-50px] w-64 h-64 bg-pink-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex items-center gap-4 relative z-10">
        <Link to="/admin/courses" className="p-2.5 bg-black/20 rounded-xl hover:bg-white/10 transition-colors border border-white/5 text-slate-300 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Nội dung khóa học</h2>
            <p className="text-sm text-slate-400 mt-1">ID Khóa học: {courseId}</p>
        </div>
      </div>

      <div className="bg-[#0a0a0f]/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/5 relative z-10 group hover:border-white/10 transition-all">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 border border-purple-500/20">
              <Video className="w-5 h-5" />
          </div>
          Thêm bài học mới
        </h3>
        <form onSubmit={handleAddLesson} className="flex flex-col md:flex-row gap-5 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tên bài học</label>
            <input 
              required
              type="text" 
              className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-600 transition-all outline-none" 
              placeholder="Ví dụ: Giới thiệu React Router"
              value={newLessonTitle}
              onChange={e => setNewLessonTitle(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Link Video (URL)</label>
            <input 
              required
              type="text" 
              className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white placeholder-slate-600 transition-all outline-none" 
              placeholder="https://..."
              value={newVideoUrl}
              onChange={e => setNewVideoUrl(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25 active:scale-95 border border-purple-400/20 shrink-0 w-full md:w-auto h-[50px]">
            <Plus className="w-5 h-5" /> Thêm bài học
          </button>
        </form>
      </div>

      <div className="space-y-4 relative z-10">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="relative w-12 h-12 mb-4">
                    <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin"></div>
                </div>
                <span className="text-slate-400">Đang tải nội dung...</span>
            </div>
        ) : lessons.map((lesson, index) => (
          <div key={lesson.id} className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl transition-all">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between bg-black/20 gap-4 sm:gap-0">
              <div className="flex items-center gap-4">
                <span className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm shrink-0 shadow-inner">
                  {index + 1}
                </span>
                <div>
                  <h4 className="font-bold text-slate-200">{lesson.title}</h4>
                  <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 mt-1 transition-colors">
                    <PlayCircle className="w-3 h-3" /> Xem video
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleSelectLesson(lesson.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 border ${
                    activeLessonId === lesson.id 
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <FileQuestion className="w-4 h-4" /> 
                  {activeLessonId === lesson.id ? 'Đóng Quiz' : 'Soạn Quiz'}
                  {activeLessonId === lesson.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => handleDeleteLesson(lesson.id)} 
                  className="p-2.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 border border-transparent hover:border-red-400 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {activeLessonId === lesson.id && quiz && (
              <div className="p-6 border-t border-white/5 animate-fade-in bg-black/40">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b border-white/5 pb-4">
                  <h5 className="font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                      Câu hỏi trắc nghiệm cho bài học này
                  </h5>
                  <button onClick={saveQuiz} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all shadow-lg font-medium">
                    <Save className="w-4 h-4" /> Lưu câu hỏi
                  </button>
                </div>

                <div className="space-y-6">
                  {quiz.questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-[#0a0a0f] p-6 rounded-2xl border border-white/5 shadow-inner relative group">
                      <span className="absolute top-5 right-5 text-[10px] font-bold text-slate-600 tracking-widest uppercase bg-white/5 px-2 py-1 rounded">Câu {qIndex + 1}</span>
                      
                      <div className="mb-6 mt-2">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Câu hỏi</label>
                        <input 
                          className="w-full p-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 text-white transition-all outline-none"
                          value={q.questionText}
                          onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                          placeholder="Nhập nội dung câu hỏi..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {q.options.map((opt, optIndex) => (
                          <div key={optIndex} className={`flex items-center gap-3 p-2 rounded-xl transition-colors border ${q.correctAnswerIndex === optIndex ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-transparent hover:bg-white/5'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 transition-colors ${
                                q.correctAnswerIndex === optIndex ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-black/50 text-slate-500 border-white/10'
                              }`}>
                              {['A','B','C','D'][optIndex]}
                            </div>
                            <input 
                              className={`flex-1 p-2.5 bg-black/30 border border-white/10 rounded-lg text-sm text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all ${q.correctAnswerIndex === optIndex ? 'border-emerald-500/50 text-emerald-200' : ''}`}
                              value={opt}
                              onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                              placeholder={`Đáp án ${optIndex + 1}`}
                            />
                            <div className="flex items-center justify-center w-8 shrink-0">
                                <input 
                                type="radio" 
                                name={`correct-${qIndex}`}
                                checked={q.correctAnswerIndex === optIndex}
                                onChange={() => updateQuestion(qIndex, 'correctAnswerIndex', optIndex)}
                                className="w-4 h-4 accent-emerald-500 cursor-pointer"
                                />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-end mt-4 pt-4 border-t border-white/5">
                          <button 
                            onClick={() => {
                            const newQuestions = quiz.questions.filter((_, i) => i !== qIndex);
                            setQuiz({ ...quiz, questions: newQuestions });
                            }}
                            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Xóa câu hỏi
                          </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={addQuestion}
                  className="mt-8 w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-slate-400 hover:border-purple-500/50 hover:text-purple-400 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Plus className="w-5 h-5" /> Thêm câu hỏi mới
                </button>
              </div>
            )}
          </div>
        ))}
        
        {lessons.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-[#0a0a0f]/40 backdrop-blur-md rounded-2xl border border-white/5 border-dashed">
            <Video className="w-12 h-12 mb-4 opacity-20" />
            <p>Chưa có bài học nào. Hãy thêm bài học đầu tiên của bạn!</p>
          </div>
        )}
      </div>
    </div>
  );
}