const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load biến môi trường từ file .env
const PayOS = require('@payos/node');

// Import Models
const Course = require('./models/Course');
const User = require('./models/User');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const Testimonial = require('./models/Testimonial');
const Progress = require('./models/Progress');
const Order = require('./models/Order');

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

// --- CẤU HÌNH PAYOS TỪ BIẾN MÔI TRƯỜNG ---
const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

// Kiểm tra xem đã cấu hình đủ chưa
if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
    console.error("⚠️ CẢNH BÁO: Chưa cấu hình đầy đủ PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY trong file .env");
}

const payos = new PayOS(
    PAYOS_CLIENT_ID,
    PAYOS_API_KEY,
    PAYOS_CHECKSUM_KEY
);

// ==========================================
// ROUTER CHÍNH
// ==========================================
const router = express.Router();

// --- Helper: Cập nhật tiến độ học tập ---
const updateLessonProgress = async (userId, courseId, lessonId) => {
    const lessonIdNum = parseInt(lessonId);
    const courseIdNum = parseInt(courseId);
    const userIdNum = parseInt(userId);

    try {
        const progress = await Progress.findOneAndUpdate(
            { userId: userIdNum, courseId: courseIdNum, 'completedLessons': { $ne: lessonIdNum } },
            { $push: { completedLessons: lessonIdNum } },
            { new: true }
        );
        
        let finalProgress = progress;
        if (!progress || !progress.completedLessons.includes(lessonIdNum)) {
             finalProgress = await Progress.findOne({ userId: userIdNum, courseId: courseIdNum });
             if (!finalProgress) return null;
        }
        
        const totalLessons = await Lesson.countDocuments({ courseId: courseIdNum });
        finalProgress.progressPercentage = totalLessons > 0 
            ? Math.round((finalProgress.completedLessons.length / totalLessons) * 100) 
            : 0;
            
        await finalProgress.save();
        return finalProgress;
    } catch (err) {
        console.error("❌ Lỗi Helper:", err);
        throw new Error("Lỗi cập nhật tiến độ.");
    }
};

// ==========================================
// 1. API PAYOS (THANH TOÁN)
// ==========================================

// Tạo link thanh toán
router.post('/payment/create-link', async (req, res) => {
    const { userId, courseId } = req.body;
  
    try {
      const course = await Course.findOne({ id: parseInt(courseId) });
      if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });
  
      if (!course.price || course.price === 0) {
          return res.status(400).json({ message: "Khóa học miễn phí không cần thanh toán qua cổng." });
      }
  
      // Tạo mã đơn hàng ngẫu nhiên (Số nguyên dương, < 9007199254740991)
      const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));
  
      // Lưu đơn hàng vào DB (trạng thái pending)
      await Order.create({
          orderCode,
          userId,
          courseId,
          amount: course.price,
          status: 'pending'
      });
  
      // Tạo link thanh toán PayOS
      // Lưu ý: returnUrl và cancelUrl là địa chỉ Frontend
      const paymentLinkData = {
        orderCode: orderCode,
        amount: course.price,
        description: `Thanh toan khoa hoc ${course.id}`,
        items: [
            {
                name: course.title,
                quantity: 1,
                price: course.price
            }
        ],
        returnUrl: `http://localhost:5173/payment-result`, 
        cancelUrl: `http://localhost:5173/course/${courseId}`
      };
  
      const paymentLink = await payos.createPaymentLink(paymentLinkData);
      res.json({ checkoutUrl: paymentLink.checkoutUrl });
  
    } catch (error) {
      console.error("Lỗi tạo link thanh toán:", error);
      res.status(500).json({ message: "Lỗi tạo giao dịch" });
    }
});
  
// Webhook nhận kết quả thanh toán từ PayOS
router.post('/payment/webhook', async (req, res) => {
    try {
      // Xác thực dữ liệu webhook để đảm bảo an toàn
      const webhookData = payos.verifyPaymentWebhookData(req.body);
  
      // Nếu thanh toán thành công (code '00')
      if (webhookData.code === '00') {
          const orderCode = webhookData.orderCode;
          const order = await Order.findOne({ orderCode });
          
          // Chỉ xử lý nếu đơn hàng đang ở trạng thái 'pending'
          if (order && order.status === 'pending') {
              
              // 1. Cập nhật trạng thái đơn hàng
              order.status = 'paid';
              await order.save();
  
              // 2. Kích hoạt khóa học cho User
              await User.findOneAndUpdate(
                  { id: order.userId, 'coursesEnrolled': { $ne: order.courseId } }, 
                  { $push: { coursesEnrolled: order.courseId }, $inc: { coursesEnrolledCount: 1 } }
              );
              
              // 3. Tạo bản ghi tiến độ học tập ban đầu
              await new Progress({ userId: order.userId, courseId: order.courseId }).save();
              
              console.log(`✅ Thanh toán thành công đơn ${orderCode}. Đã kích hoạt khóa học ${order.courseId} cho User ${order.userId}.`);
          }
      }
  
      res.json({ success: true });
    } catch (error) {
      console.error("Lỗi xử lý Webhook:", error);
      // Trả về 200 để PayOS không gửi lại webhook liên tục dù lỗi logic
      res.status(200).json({ message: "Webhook processed with error" });
    }
});

// ==========================================
// 2. API COURSES
// ==========================================
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ id: parseInt(req.params.id) });
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json(course);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/courses', async (req, res) => {
  try {
    const lastCourse = await Course.findOne().sort({ id: -1 });
    const newId = lastCourse ? lastCourse.id + 1 : 1;
    const newCourse = new Course({ id: newId, ...req.body, rating: 0, students: 0, reviews: 0 });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const updated = await Course.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    await Course.findOneAndDelete({ id: parseInt(req.params.id) });
    res.json({ message: "Đã xóa thành công" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 3. API USERS
// ==========================================
router.get('/users', async (req, res) => {
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

router.post('/register', async (req, res) => {
  try {
    const { username } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });

    const lastUser = await User.findOne().sort({ id: -1 });
    const newId = lastUser ? lastUser.id + 1 : 1;
    const newUser = new User({
      id: newId,
      ...req.body,
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

router.put('/users/:id', async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy" });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findOneAndDelete({ id: parseInt(req.params.id) });
    res.json({ message: "Đã xóa user thành công" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 4. ENROLL & PROGRESS (Cũ - Dùng cho khóa học miễn phí)
// ==========================================
router.post('/enroll', async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { id: parseInt(userId), 'coursesEnrolled': { $ne: parseInt(courseId) } }, 
      { $push: { coursesEnrolled: parseInt(courseId) }, $inc: { coursesEnrolledCount: 1 } },
      { new: true }
    );
    if (!updatedUser) return res.status(400).json({ message: "Đã ghi danh hoặc lỗi user." });
    
    await Course.findOneAndUpdate({ id: parseInt(courseId) }, { $inc: { students: 1 } });
    await new Progress({ userId: parseInt(userId), courseId: parseInt(courseId) }).save();

    res.json({ message: "Ghi danh thành công!", user: updatedUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/progress', async (req, res) => {
    const { userId, courseId } = req.query;
    try {
        const progress = await Progress.findOne({ userId: parseInt(userId), courseId: parseInt(courseId) });
        res.json(progress || { completedLessons: [], progressPercentage: 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/progress/complete-lesson', async (req, res) => {
    const { userId, courseId, lessonId } = req.body;
    try {
        const progress = await updateLessonProgress(userId, courseId, lessonId);
        if (!progress) return res.status(404).json({ message: "Lỗi cập nhật." });
        res.json({ message: "Đã cập nhật.", progress });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 5. QUIZ & SUBMIT
// ==========================================
router.post('/quizzes/submit', async (req, res) => {
  const { quizId, userAnswers, userId, lessonId } = req.body;
  try {
    const quiz = await Quiz.findOne({ id: parseInt(quizId) });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });

    let correctCount = 0;
    for (const ans of userAnswers) {
      const q = quiz.questions.find(qi => qi.id === ans.questionId);
      if (q && q.correctAnswerIndex === ans.selectedAnswerIndex) correctCount++;
    }
    
    const allCorrect = correctCount === quiz.questions.length;
    let result = {
        passed: allCorrect,
        score: correctCount,
        message: allCorrect ? 'Chúc mừng! Bạn đã hoàn thành.' : `Bạn đúng ${correctCount}/${quiz.questions.length} câu.`,
        progressPercentage: null,
        totalLessons: null
    };

    if (allCorrect) {
      const lesson = await Lesson.findOne({ id: parseInt(lessonId) });
      const newProgress = await updateLessonProgress(userId, lesson.courseId, lessonId);
      if (newProgress) {
        result.progressPercentage = newProgress.progressPercentage;
        const total = await Lesson.countDocuments({ courseId: lesson.courseId });
        result.totalLessons = total;
      }
    }
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 6. LESSONS, QUIZZES, TESTIMONIALS
// ==========================================
router.get('/lessons', async (req, res) => {
  try {
    const { courseId } = req.query;
    const lessons = await Lesson.find(courseId ? { courseId: parseInt(courseId) } : {});
    res.json(lessons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ id: parseInt(req.params.id) });
    res.json(lesson);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/lessons', async (req, res) => {
  try {
    const last = await Lesson.findOne().sort({ id: -1 });
    const newId = last ? last.id + 1 : 1;
    const item = new Lesson({ ...req.body, id: newId });
    await item.save();
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/lessons/:id', async (req, res) => {
  try {
    await Lesson.findOneAndDelete({ id: parseInt(req.params.id) });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/quizzes', async (req, res) => {
  try {
    const { lessonId } = req.query;
    const items = await Quiz.find(lessonId ? { lessonId: parseInt(lessonId) } : {});
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/quizzes/:id', async (req, res) => {
  try {
    const item = await Quiz.findOne({ id: parseInt(req.params.id) });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/quizzes', async (req, res) => {
  try {
    const last = await Quiz.findOne().sort({ id: -1 });
    const newId = last ? last.id + 1 : 1;
    const item = new Quiz({ ...req.body, id: newId });
    await item.save();
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/quizzes/:id', async (req, res) => {
  try {
    const updated = await Quiz.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/testimonials', async (req, res) => {
  try {
    const items = await Testimonial.find();
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/testimonials', async (req, res) => {
  try {
    const last = await Testimonial.findOne().sort({ id: -1 });
    const newId = last ? last.id + 1 : 1;
    const item = new Testimonial({ ...req.body, id: newId });
    await item.save();
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Áp dụng Router vào đường dẫn /api
app.use('/api', router);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});