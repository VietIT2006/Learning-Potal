const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// --- 1. IMPORT VÀ CẤU HÌNH PAYOS (Đã sửa lỗi Import) ---
const payosLib = require('@payos/node');
// Lấy Class PayOS từ thư viện dựa trên log bạn cung cấp
const PayOS = payosLib.PayOS;

const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

// Kiểm tra biến môi trường
if (!PAYOS_CLIENT_ID || !PAYOS_API_KEY || !PAYOS_CHECKSUM_KEY) {
  console.error("⚠️ CẢNH BÁO: Chưa cấu hình đầy đủ biến môi trường PayOS trong file .env");
}

// Khởi tạo SDK
const payos = new PayOS(
  PAYOS_CLIENT_ID,
  PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY
);

// --- 2. IMPORT MODELS ---
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

// --- 3. KẾT NỐI MONGODB ---
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error("❌ Lỗi: Chưa cấu hình MONGODB_URI trong file .env");
} else {
  mongoose.connect(mongoURI)
    .then(() => console.log("✅ Đã kết nối MongoDB Atlas thành công"))
    .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));
}

const router = express.Router();

// --- Helper: Cập nhật tiến độ ---
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
// 4. API THANH TOÁN (PAYOS)
// ==========================================

// Tạo link thanh toán
router.post('/payment/create-link', async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const course = await Course.findOne({ id: parseInt(courseId) });
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });

    if (!course.price || course.price === 0) {
      return res.status(400).json({ message: "Miễn phí không cần thanh toán." });
    }

    // Tạo mã đơn hàng ngẫu nhiên
    const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));

    await Order.create({
      orderCode,
      userId,
      courseId,
      amount: course.price,
      status: 'pending'
    });

    // Tạo link thanh toán
    // Lưu ý: Đổi localhost thành domain thật của bạn (vietcloud.id.vn) khi chạy thật
    const domain = 'https://vietcloud.id.vn'; // Cập nhật theo domain của bạn
    const paymentLinkData = {
      orderCode: orderCode,
      amount: course.price,
      description: `Thanh toan khoa hoc ${course.id}`,
      items: [{ name: course.title, quantity: 1, price: course.price }],
      returnUrl: `${domain}/payment-result`,
      cancelUrl: `${domain}/course/${courseId}`
    };

    const paymentLink = await payos.createPaymentLink(paymentLinkData);
    res.json({ checkoutUrl: paymentLink.checkoutUrl });

  } catch (error) {
    console.error("Lỗi tạo link thanh toán:", error);
    res.status(500).json({ message: "Lỗi server tạo giao dịch" });
  }
});

// Webhook xử lý thanh toán thành công
router.post('/payment/webhook', async (req, res) => {
  try {
    const webhookData = payos.verifyPaymentWebhookData(req.body);

    if (webhookData.code === '00') {
      const orderCode = webhookData.orderCode;
      const order = await Order.findOne({ orderCode });

      if (order && order.status === 'pending') {
        // Cập nhật đơn hàng
        order.status = 'paid';
        await order.save();

        // Kích hoạt khóa học
        await User.findOneAndUpdate(
          { id: order.userId, 'coursesEnrolled': { $ne: order.courseId } },
          { $push: { coursesEnrolled: order.courseId }, $inc: { coursesEnrolledCount: 1 } }
        );

        // Tạo tiến độ
        await new Progress({ userId: order.userId, courseId: order.courseId }).save();

        console.log(`✅ Webhook: Đã kích hoạt đơn hàng ${orderCode}`);
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(200).json({ message: "Webhook processed with error" });
  }
});

// ==========================================
// 5. CÁC API KHÁC
// ==========================================

// Courses
router.get('/courses', async (req, res) => {
  try { res.json(await Course.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/courses/:id', async (req, res) => {
  try { res.json(await Course.findOne({ id: parseInt(req.params.id) })); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/courses', async (req, res) => {
  const last = await Course.findOne().sort({ id: -1 });
  const newId = last ? last.id + 1 : 1;
  await new Course({ id: newId, ...req.body }).save();
  res.json({ message: "Success" });
});
router.put('/courses/:id', async (req, res) => {
  await Course.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body);
  res.json({ message: "Updated" });
});
router.delete('/courses/:id', async (req, res) => {
  await Course.findOneAndDelete({ id: parseInt(req.params.id) });
  res.json({ message: "Deleted" });
});

// Users
router.get('/users', async (req, res) => {
  const { username, password, role } = req.query;
  let q = {};
  if (username) q.username = username;
  if (password) q.password = password;
  if (role) q.role = role;
  res.json(await User.find(q));
});
router.post('/register', async (req, res) => {
  const last = await User.findOne().sort({ id: -1 });
  const newId = last ? last.id + 1 : 1;
  await new User({ id: newId, ...req.body, role: 'user', coursesEnrolled: [] }).save();
  res.json({ message: "Success" });
});

// Enroll (Miễn phí)
router.post('/enroll', async (req, res) => {
  const { userId, courseId } = req.body;
  await User.findOneAndUpdate(
    { id: parseInt(userId), 'coursesEnrolled': { $ne: parseInt(courseId) } },
    { $push: { coursesEnrolled: parseInt(courseId) } }
  );
  await new Progress({ userId: parseInt(userId), courseId: parseInt(courseId) }).save();
  res.json({ message: "Success" });
});

// Lessons
router.get('/lessons', async (req, res) => {
  const { courseId } = req.query;
  res.json(await Lesson.find(courseId ? { courseId: parseInt(courseId) } : {}));
});
router.get('/lessons/:id', async (req, res) => {
  res.json(await Lesson.findOne({ id: parseInt(req.params.id) }));
});
router.post('/lessons', async (req, res) => {
  const last = await Lesson.findOne().sort({ id: -1 });
  await new Lesson({ ...req.body, id: last ? last.id + 1 : 1 }).save();
  res.json({ message: "Success" });
});
router.delete('/lessons/:id', async (req, res) => {
  await Lesson.findOneAndDelete({ id: parseInt(req.params.id) });
  res.json({ message: "Deleted" });
});

// Quizzes
router.get('/quizzes', async (req, res) => {
  const { lessonId } = req.query;
  res.json(await Quiz.find(lessonId ? { lessonId: parseInt(lessonId) } : {}));
});
router.get('/quizzes/:id', async (req, res) => {
  res.json(await Quiz.findOne({ id: parseInt(req.params.id) }));
});
router.post('/quizzes', async (req, res) => {
  const last = await Quiz.findOne().sort({ id: -1 });
  await new Quiz({ ...req.body, id: last ? last.id + 1 : 1 }).save();
  res.json({ message: "Success" });
});
router.put('/quizzes/:id', async (req, res) => {
  await Quiz.findOneAndUpdate({ id: parseInt(req.params.id) }, req.body);
  res.json({ message: "Updated" });
});
router.post('/quizzes/submit', async (req, res) => {
  res.json({ passed: true, score: 10, message: "Demo Passed" });
});

// Progress
router.get('/progress', async (req, res) => {
  const { userId, courseId } = req.query;
  const p = await Progress.findOne({ userId: parseInt(userId), courseId: parseInt(courseId) });
  res.json(p || { completedLessons: [], progressPercentage: 0 });
});
router.post('/progress/complete-lesson', async (req, res) => {
  await updateLessonProgress(req.body.userId, req.body.courseId, req.body.lessonId);
  res.json({ message: "Updated" });
});

// Testimonials
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

// Gán router vào /api
app.use('/api', router);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});