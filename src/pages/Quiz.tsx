import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle, 
  ChevronRight,
  Award
} from 'lucide-react';

// Định nghĩa kiểu dữ liệu
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
interface SelectedAnswers {
  [questionId: string]: number;
}

function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SelectedAnswers>({});
  const [score, setScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:3001/quizzes/${quizId}`);
        setQuizData(res.data);
      } catch (err) {
        setError("Không thể tải bài kiểm tra. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleOptionSelect = (index: number) => {
    if (!quizData) return;
    const currentQuestionId = quizData.questions[currentQuestionIndex].id;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionId]: index,
    });
  };

  const handleNextOrSubmit = () => {
    if (!quizData) return;
    const isLastQuestion = currentQuestionIndex === quizData.questions.length - 1;

    if (isLastQuestion) {
      let finalScore = 0;
      quizData.questions.forEach(q => {
        if (selectedAnswers[q.id] === q.correctAnswerIndex) {
          finalScore++;
        }
      });
      setScore(finalScore);
      setIsSubmitted(true);
    } else {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error || !quizData || !quizData.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 mb-6">{error || "Không tìm thấy dữ liệu bài kiểm tra."}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition w-full"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // --- Render Result Screen ---
  if (isSubmitted) {
    const percentage = Math.round((score / quizData.questions.length) * 100);
    let message = "";
    let iconColor = "";
    
    if (percentage >= 80) {
      message = "Xuất sắc! Bạn đã nắm vững kiến thức.";
      iconColor = "text-green-600 bg-green-100";
    } else if (percentage >= 50) {
      message = "Khá tốt! Cố gắng hơn nữa nhé.";
      iconColor = "text-yellow-600 bg-yellow-100";
    } else {
      message = "Cần ôn tập thêm! Đừng nản chí.";
      iconColor = "text-red-600 bg-red-100";
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-fade-in-up">
          <div className={`w-20 h-20 ${iconColor} rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner`}>
            <Award className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Kết quả</h2>
          <p className="text-gray-600 mb-8">{message}</p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
            <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Điểm số của bạn</div>
            <div className="text-5xl font-black text-purple-600 mb-2">
              {score}<span className="text-2xl text-gray-400 font-medium">/{quizData.questions.length}</span>
            </div>
            <div className="text-sm font-medium text-gray-600 bg-white inline-block px-3 py-1 rounded-full border border-gray-200 shadow-sm">
              {percentage}% Chính xác
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)} // Quay lại trang bài học
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition duration-200 flex items-center justify-center gap-2"
            >
              Tiếp tục học <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white text-gray-700 border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 transition duration-200 flex items-center justify-center gap-2"
            >
              Làm lại <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Quiz Question ---
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const currentAnswer = selectedAnswers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Header Info */}
      <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quizData.title}</h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <HelpCircle className="w-4 h-4" /> 
            Câu hỏi {currentQuestionIndex + 1} trên {quizData.questions.length}
          </p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-900 font-medium text-sm"
        >
          Thoát
        </button>
      </div>

      {/* Main Quiz Card */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="p-8 md:p-10">
          {/* Question Text */}
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-8 leading-relaxed">
            {currentQuestion.questionText}
          </h3>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected = currentAnswer === index;
              return (
                <div
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4 group ${
                    isSelected 
                      ? 'border-purple-600 bg-purple-50 shadow-md' 
                      : 'border-gray-100 bg-white hover:border-purple-200 hover:bg-gray-50'
                  }`}
                >
                  {/* Radio Circle */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'border-purple-600' : 'border-gray-300 group-hover:border-purple-400'
                  }`}>
                    {isSelected && <div className="w-3 h-3 rounded-full bg-purple-600 animate-bounce-small" />}
                  </div>

                  <span className={`font-medium text-lg ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>
                    {option}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="mt-10 flex justify-end">
            <button
              onClick={handleNextOrSubmit}
              disabled={currentAnswer === undefined}
              className={`
                flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all duration-300
                ${currentAnswer === undefined 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:scale-105 shadow-md'}
              `}
            >
              {currentQuestionIndex === quizData.questions.length - 1 ? 'Nộp bài' : 'Câu tiếp theo'}
              {currentQuestionIndex !== quizData.questions.length - 1 && <ChevronRight className="w-5 h-5" />}
              {currentQuestionIndex === quizData.questions.length - 1 && <CheckCircle className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;