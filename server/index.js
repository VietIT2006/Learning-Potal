const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Đọc file .env

// Import Models
const Course = require('./models/Course');
const User = require('./models/User');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const Testimonial = require('./models/Testimonial');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Cho phép đọc JSON từ body request

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
  } catch (err) { res.status(500).json({ error: err.message }); }
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

// [GET] Lấy danh sách users (ĐÃ SỬA LOGIC LỌC ĐỂ FIX LỖI F5)
app.get('/users', async (req, res) => {
  try {
    const { username, password, role } = req.query;
    let query = {};

    // Logic lọc độc lập: Có cái nào lọc theo cái đó
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
      coursesEnrolled: 0
    });

    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công", user: newUser });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [POST] Thêm user từ Admin (có thể tái sử dụng logic trên hoặc viết riêng)
app.post('/users', async (req, res) => {
    try {
      const lastUser = await User.findOne().sort({ id: -1 });
      const newId = lastUser ? lastUser.id + 1 : 1;
      const newUser = new User({ id: newId, ...req.body });
      await newUser.save();
      res.status(201).json(newUser);
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
// 3. CÁC API KHÁC
// ==========================================

app.get('/lessons', async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = courseId ? { courseId: parseInt(courseId) } : {};
    const lessons = await Lesson.find(query);
    res.json(lessons);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/lessons/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ id: parseInt(req.params.id) });
    res.json(lesson);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/quizzes', async (req, res) => {
  try {
    const { lessonId } = req.query;
    const query = lessonId ? { lessonId: parseInt(lessonId) } : {};
    const quizzes = await Quiz.find(query);
    res.json(quizzes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ id: parseInt(req.params.id) });
    res.json(quiz);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

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