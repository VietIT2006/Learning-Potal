// server/controllers/quizController.js (hoặc file xử lý tương tự)

import Quiz from '../models/Quiz.js';
import Lesson from '../models/Lesson.js';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';

export const submitQuiz = async (req, res) => {
  // Giả định nhận được userId từ Auth Middleware
  const { quizId, userAnswers, userId } = req.body; 

  try {
    // 1. Lấy Bài Quiz Gốc
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Không tìm thấy Quiz' });
    }

    let allCorrect = true;

    // 2. Kiểm Tra Đáp Án Tuyệt Đối
    for (const userAnswer of userAnswers) {
      const questionIndex = userAnswer.questionIndex;
      const selectedOptionIndex = userAnswer.selectedOptionIndex;

      const question = quiz.questions[questionIndex];
      if (!question) {
        allCorrect = false; 
        break;
      }

      const selectedOption = question.options[selectedOptionIndex];
      
      // Yêu cầu: PHẢI ĐÚNG HẾT (selectedOption.isCorrect = true)
      if (!selectedOption || !selectedOption.isCorrect) {
        allCorrect = false;
        break; // Dừng lại ngay nếu có câu trả lời sai
      }
    }

    let completionStatus = {
        passed: allCorrect,
        message: allCorrect 
          ? 'Chúc mừng! Bạn đã hoàn thành bài học.' 
          : 'Rất tiếc, bạn cần trả lời đúng hết tất cả các câu hỏi để hoàn thành bài học.',
        newProgress: null
    };

    // 3. Nếu Đúng Hết - Cập Nhật Tiến Độ
    if (allCorrect) {
      // Lấy Lesson và Course ID
      const lesson = await Lesson.findOne({ quiz: quizId });
      if (!lesson) {
          return res.status(500).json({ message: 'Lỗi liên kết: Không tìm thấy Lesson cho Quiz này' });
      }
      const lessonId = lesson._id;
      const courseId = lesson.course;

      // Cập nhật Progress
      let userProgress = await Progress.findOne({ user: userId, course: courseId });

      if (!userProgress) {
        // Tạo mới nếu chưa có
        userProgress = await Progress.create({
          user: userId,
          course: courseId,
          completedLessons: [lessonId],
        });
      } else if (!userProgress.completedLessons.includes(lessonId)) {
        // Thêm Lesson vào danh sách đã hoàn thành
        userProgress.completedLessons.push(lessonId);
      }

      // Tái tính toán Progress Percentage
      const allLessons = await Lesson.find({ course: courseId });
      const totalLessons = allLessons.length;
      const completedCount = userProgress.completedLessons.length;
      
      userProgress.progressPercentage = (completedCount / totalLessons) * 100;
      // Làm tròn 2 chữ số thập phân
      userProgress.progressPercentage = Math.round(userProgress.progressPercentage * 100) / 100; 

      await userProgress.save();
      
      completionStatus.newProgress = {
          completedLessons: completedCount,
          totalLessons: totalLessons,
          progressPercentage: userProgress.progressPercentage
      };
    }
    
    return res.status(200).json(completionStatus);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình nộp bài Quiz.' });
  }
};