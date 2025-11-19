const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

// Import Models
const Course = require('./models/Course');
const User = require('./models/User');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const Testimonial = require('./models/Testimonial');
const Progress = require('./models/Progress');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 

// --- KẾT NỐI MONGODB ---
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error("❌ Lỗi: Chưa cấu hình MONGODB_URI trong file .env");
} else {
  mongoose.connect(mongoURI)
    .then(() => console.log("✅ Đã kết nối MongoDB Atlas thành công"))
    .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));
}

// ==========================================
// HÀM HELPER: Cập nhật tiến độ bài học
// ==========================================

const updateLessonProgress = async (userId, courseId, lessonId) => {
    const lessonIdNum = parseInt(lessonId);
    const courseIdNum = parseInt(courseId);
    const userIdNum = parseInt(userId);

    try {
        // 1. Cập nhật Progress record (Thêm lessonId vào mảng completedLessons)
        const progress = await Progress.findOneAndUpdate(
            { userId: userIdNum, courseId: courseIdNum, 'completedLessons': { $ne: lessonIdNum } },
            { $push: { completedLessons: lessonIdNum } },
            { new: true }
        );
        
        let finalProgress = progress;

        if (!progress || progress.completedLessons.length === 0 || !progress.completedLessons.includes(lessonIdNum)) {
             finalProgress = await Progress.findOne({ userId: userIdNum, courseId: courseIdNum });
             if (!finalProgress) {
                 return null;
             }
        }
        
        // 2. Tính toán lại Percentage
        const totalLessons = await Lesson.countDocuments({ courseId: courseIdNum });
        
        finalProgress.progressPercentage = totalLessons > 0 
            ? Math.round((finalProgress.completedLessons.length / totalLessons) * 100) 
            : 0;
            
        await finalProgress.save();
        
        return finalProgress;

    } catch (err) {
        console.error("❌ Lỗi Helper khi cập nhật tiến độ:", err);
        throw new Error("Lỗi cập nhật tiến độ.");
    }
};


// ==========================================
// 1. API KHÓA HỌC (COURSES) - FULL CRUD 
// ==========================================

// [GET] Lấy danh sách khóa học
app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [GET] Lấy chi tiết 1 khóa học theo ID
app.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ id: parseInt(req.params.id) });
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json(course);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [POST] Thêm khóa học mới
app.post('/courses', async (req, res) => {
  try {
    const lastCourse = await Course.findOne().sort({ id: -1 });
    const newId = lastCourse ? lastCourse.id + 1 : 1;

    const newCourse = new Course({
      id: newId,
      ...req.body,
      rating: 0,
      students: 0,
      reviews: 0
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    console.error("❌ Lỗi Mongoose khi thêm khóa học:", err.message);
    res.status(500).json({ 
      error: "Lỗi Server khi tạo khóa học", 
      details: err.message 
    }); 
  }
});

// [PUT] Cập nhật khóa học
app.put('/courses/:id', async (req, res) => {
  try {
    const updatedCourse = await Course.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    if (!updatedCourse) return res.status(404).json({ message: "Không tìm thấy để sửa" });
    res.json(updatedCourse);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [DELETE] Xóa khóa học
app.delete('/courses/:id', async (req, res) => {
  try {
    const deletedCourse = await Course.findOneAndDelete({ id: parseInt(req.params.id) });
    if (!deletedCourse) return res.status(404).json({ message: "Không tìm thấy để xóa" });
    res.json({ message: "Đã xóa khóa học thành công" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 2. API HỌC VIÊN (USERS) - FULL CRUD 
// ==========================================

// [GET] Lấy danh sách users
app.get('/users', async (req, res) => {
  try {
    const { username, password, role } = req.query;
    let query = {};

    if (username) query.username = username;
    if (password) query.password = password;
    if (role) query.role = role;

    const users = await User.find(query);
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [POST] Tạo user mới (Đăng ký)
app.post('/register', async (req, res) => {
  try {
    const { username, fullname, email, password } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });

    const lastUser = await User.findOne().sort({ id: -1 });
    const newId = lastUser ? lastUser.id + 1 : 1;
    
    const newUser = new User({
      id: newId,
      username,
      password,
      fullname,
      email,
      role: 'user',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      coursesEnrolled: [], 
      coursesEnrolledCount: 0 
    });

    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [PUT] Cập nhật user
app.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json(updatedUser);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [DELETE] Xóa user
app.delete('/users/:id', async (req, res) => {
  try {
    await User.findOneAndDelete({ id: parseInt(req.params.id) });
    res.json({ message: "Đã xóa user thành công" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 3. API GHI DANH & TIẾN ĐỘ HỌC (ENROLLMENT & PROGRESS)
// ==========================================

// [POST] Ghi danh vào Khóa học
app.post('/enroll', async (req, res) => {
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    return res.status(400).json({ message: "Thiếu userId hoặc courseId" });
  }

  try {
    const courseIdNum = parseInt(courseId);
    const userIdNum = parseInt(userId);
    
    // 1. Cập nhật User: Thêm courseId vào mảng coursesEnrolled
    const updatedUser = await User.findOneAndUpdate(
      { id: userIdNum, 'coursesEnrolled': { $ne: courseIdNum } }, 
      { 
        $push: { coursesEnrolled: courseIdNum },
        $inc: { coursesEnrolledCount: 1 }
      },
      { new: true }
    );

    if (!updatedUser) {
        return res.status(400).json({ message: "Bạn đã ghi danh khóa học này hoặc user không tồn tại." });
    }
    
    // 2. Cập nhật Course: Tăng số lượng học viên
    await Course.findOneAndUpdate(
        { id: courseIdNum },
        { $inc: { students: 1 } }
    );
    
    // 3. Khởi tạo Progress record
    const newProgress = new Progress({ userId: userIdNum, courseId: courseIdNum });
    await newProgress.save();

    res.json({ message: "Ghi danh thành công!", user: updatedUser });

  } catch (err) {
    console.error("❌ Lỗi Ghi danh:", err);
    res.status(500).json({ error: err.message });
  }
});

// [GET] Lấy tiến độ học của 1 User cho 1 Course
app.get('/progress', async (req, res) => {
    const { userId, courseId } = req.query;

    if (!userId || !courseId) {
        return res.status(400).json({ message: "Thiếu userId hoặc courseId để lấy tiến độ." });
    }

    try {
        const progress = await Progress.findOne({ userId: parseInt(userId), courseId: parseInt(courseId) });
        
        if (!progress) {
            return res.json({ completedLessons: [], progressPercentage: 0 });
        }
        
        res.json(progress);
    } catch (err) {
        console.error("❌ Lỗi lấy tiến độ:", err);
        res.status(500).json({ error: err.message });
    }
});

// [POST] Đánh dấu hoàn thành bài học
app.post('/progress/complete-lesson', async (req, res) => {
    const { userId, courseId, lessonId } = req.body;

    if (!userId || !courseId || !lessonId) {
        return res.status(400).json({ message: "Thiếu thông tin tiến độ." });
    }

    try {
        const lessonIdNum = parseInt(lessonId);
        const courseIdNum = parseInt(courseId);
        const userIdNum = parseInt(userId);
        
        // 1. Cập nhật Progress record
        const progress = await Progress.findOneAndUpdate(
            { userId: userIdNum, courseId: courseIdNum, 'completedLessons': { $ne: lessonIdNum } },
            { $push: { completedLessons: lessonIdNum } },
            { new: true }
        );
        
        let finalProgress = progress;

        if (!progress || progress.completedLessons.length === 0 || !progress.completedLessons.includes(lessonIdNum)) {
             finalProgress = await Progress.findOne({ userId: userIdNum, courseId: courseIdNum });
             if (!finalProgress) {
                 return res.status(404).json({ message: "Không tìm thấy tiến độ để cập nhật." });
             }
        }
        
        // 2. Tính toán lại Percentage
        const totalLessons = await Lesson.countDocuments({ courseId: courseIdNum });
        
        finalProgress.progressPercentage = totalLessons > 0 
            ? Math.round((finalProgress.completedLessons.length / totalLessons) * 100) 
            : 0;
            
        await finalProgress.save();

        res.json({ message: "Tiến độ đã được cập nhật.", progress: finalProgress });
        
    } catch (err) {
        console.error("❌ Lỗi cập nhật tiến độ:", err);
        res.status(500).json({ error: err.message });
    }
});

// [POST] Nộp bài Quiz (Kiểm tra 100% đúng) - [API ĐÃ SỬA LỖI]
app.post('/quizzes/submit', async (req, res) => {
  const { quizId, userAnswers, userId, lessonId } = req.body; 

  if (!userId || !quizId || !lessonId || !userAnswers || userAnswers.length === 0) {
    return res.status(400).json({ message: "Thiếu dữ liệu cần thiết (userId, quizId, userAnswers)." });
  }

  try {
    const quizIdNum = parseInt(quizId);
    const userIdNum = parseInt(userId);
    const lessonIdNum = parseInt(lessonId);

    // 1. Lấy Bài Quiz Gốc
    const quiz = await Quiz.findOne({ id: quizIdNum });
    if (!quiz) {
      return res.status(404).json({ message: 'Không tìm thấy Quiz.' });
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    
    // 2. Kiểm Tra Đáp Án Tuyệt Đối
    for (const userAnswer of userAnswers) {
      // Tìm câu hỏi tương ứng
      const question = quiz.questions.find(q => q.id === userAnswer.questionId); 

      // Kiểm tra đáp án (Nếu câu hỏi tồn tại VÀ đáp án người dùng chọn khớp với đáp án đúng)
      if (question && question.correctAnswerIndex === userAnswer.selectedAnswerIndex) {
        correctCount++;
      }
    }
    
    // Yêu cầu: Phải đúng hết 100%
    const allCorrect = correctCount === totalQuestions;

    let completionStatus = {
        passed: allCorrect,
        score: correctCount,
        message: allCorrect 
          ? 'Chúc mừng! Bạn đã trả lời đúng hết các câu hỏi.' 
          : `Rất tiếc, bạn chỉ đúng ${correctCount}/${totalQuestions} câu. Cần 100% để hoàn thành bài học.`,
        progressPercentage: null, 
        totalLessons: null
    };

    // 3. Nếu Đúng Hết - Cập Nhật Tiến Độ
    if (allCorrect) {
      // TÌM LESSON ĐỂ LẤY COURSE ID (Fix lỗi NaN)
      const lesson = await Lesson.findOne({ id: lessonIdNum });
      if (!lesson) {
          throw new Error(`Lesson ID ${lessonIdNum} not found.`);
      }
      const courseIdFromLesson = lesson.courseId; 

      const newProgress = await updateLessonProgress(userIdNum, courseIdFromLesson, lessonIdNum);
      
      if (newProgress) {
        completionStatus.progressPercentage = newProgress.progressPercentage;
        // Lấy tổng số lessons để hiển thị đúng tỉ lệ trên Frontend
        const totalLessons = await Lesson.countDocuments({ courseId: courseIdFromLesson });
        completionStatus.totalLessons = totalLessons;
      }
    }
    
    return res.status(200).json(completionStatus);

  } catch (error) {
    console.error("❌ Lỗi Server khi nộp bài Quiz:", error);
    res.status(500).json({ message: 'Lỗi máy chủ trong quá trình nộp bài Quiz.' });
  }
});


// ==========================================
// 4. CÁC API KHÁC (Lessons, Quizzes, Testimonials)
// ==========================================

// --- LESSONS API ---

// [GET] Lấy danh sách bài học (có thể lọc theo courseId)
app.get('/lessons', async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = courseId ? { courseId: parseInt(courseId) } : {};
    const lessons = await Lesson.find(query);
    res.json(lessons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [GET] Lấy chi tiết 1 bài học
app.get('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ id: parseInt(req.params.id) });
    res.json(lesson);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [POST] Thêm bài học mới (Lesson)
app.post('/lessons', async (req, res) => {
  try {
    const lastLesson = await Lesson.findOne().sort({ id: -1 });
    const newId = lastLesson ? lastLesson.id + 1 : 1;

    const newLesson = new Lesson({
      ...req.body,
      id: newId, 
    });

    await newLesson.save();
    res.status(201).json(newLesson);
  } catch (err) {
    console.error("❌ Lỗi khi thêm bài học:", err);
    res.status(500).json({ error: "Không thể thêm bài học. Chi tiết lỗi: " + err.message });
  }
});

// [PUT] Cập nhật bài học (Lesson)
app.put('/lessons/:id', async (req, res) => {
  try {
    const updatedLesson = await Lesson.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    if (!updatedLesson) return res.status(404).json({ message: "Không tìm thấy bài học để sửa" });
    res.json(updatedLesson);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [DELETE] Xóa bài học (Lesson)
app.delete('/lessons/:id', async (req, res) => {
  try {
    await Lesson.findOneAndDelete({ id: parseInt(req.params.id) });
    res.json({ message: "Đã xóa bài học thành công" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// --- QUIZZES API ---

// [GET] Lấy danh sách quiz (có thể lọc theo lessonId)
app.get('/quizzes', async (req, res) => {
  try {
    const { lessonId } = req.query;
    const query = lessonId ? { lessonId: parseInt(lessonId) } : {};
    const quizzes = await Quiz.find(query);
    res.json(quizzes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [GET] Lấy chi tiết 1 quiz
app.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ id: parseInt(req.params.id) });
    res.json(quiz);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [POST] Thêm Quiz mới
app.post('/quizzes', async (req, res) => {
  try {
    const lastQuiz = await Quiz.findOne().sort({ id: -1 });
    const newId = lastQuiz ? lastQuiz.id + 1 : 1;
    const newQuiz = new Quiz({ id: newId, ...req.body });
    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [PUT] Cập nhật Quiz
app.put('/quizzes/:id', async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true }
    );
    if (!updatedQuiz) return res.status(404).json({ message: "Không tìm thấy quiz để sửa" });
    res.json(updatedQuiz);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [DELETE] Xóa Quiz
app.delete('/quizzes/:id', async (req, res) => {
  try {
    await Quiz.findOneAndDelete({ id: parseInt(req.params.id) });
    res.json({ message: "Đã xóa quiz thành công" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// --- TESTIMONIALS API ---

// [GET] Lấy danh sách testimonial
app.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [POST] Thêm testimonial mới
app.post('/testimonials', async (req, res) => {
  try {
    const lastItem = await Testimonial.findOne().sort({ id: -1 });
    const newId = lastItem ? lastItem.id + 1 : 1;
    const newItem = new Testimonial({ id: newId, ...req.body });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// --- KHỞI CHẠY SERVER ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});