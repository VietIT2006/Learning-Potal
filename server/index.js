const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Models
const Course = require('./models/Course');
const User = require('./models/User');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const Testimonial = require('./models/Testimonial');

const app = express();
app.use(cors());
app.use(express.json());

// KẾT NỐI MONGODB (Thay đổi chuỗi kết nối nếu cần)
mongoose.connect('mongodb+srv://msvAdmin:MaiSonViet2006@@learning-potal.yotzhfw.mongodb.net/?appName=Learning-Potal')
  .then(() => console.log("✅ Đã kết nối MongoDB"))
  .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));

// --- 1. API KHÓA HỌC (COURSES) ---

// Lấy danh sách khóa học
app.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Lấy chi tiết 1 khóa học
app.get('/courses/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ id: parseInt(req.params.id) });
    if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });
    res.json(course);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [ADMIN] Thêm khóa học mới
app.post('/courses', async (req, res) => {
  try {
    // Tự động tạo ID mới bằng cách lấy ID lớn nhất + 1 (giả lập auto-increment)
    const lastCourse = await Course.findOne().sort({ id: -1 });
    const newId = lastCourse ? lastCourse.id + 1 : 1;

    const newCourse = new Course({ ...req.body, id: newId });
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [ADMIN] Cập nhật khóa học
app.put('/courses/:id', async (req, res) => {
  try {
    const updatedCourse = await Course.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      req.body,
      { new: true } // Trả về data mới sau khi update
    );
    res.json(updatedCourse);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [ADMIN] Xóa khóa học
app.delete('/courses/:id', async (req, res) => {
  try {
    await Course.findOneAndDelete({ id: parseInt(req.params.id) });
    res.json({ message: "Đã xóa khóa học thành công" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// --- 2. API HỌC VIÊN (USERS) ---

// Lấy danh sách users (hỗ trợ lọc login và tìm kiếm)
app.get('/users', async (req, res) => {
  try {
    const { username, password, role } = req.query;
    let query = {};

    // Logic cho Login
    if (username && password) {
      query.username = username;
      query.password = password;
    }
    
    // Logic lọc theo role (cho trang StudentManagement)
    if (role) {
      query.role = role;
    }

    const users = await User.find(query);
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [ADMIN] Xóa học viên
app.delete('/users/:id', async (req, res) => {
  try {
    await User.findOneAndDelete({ id: parseInt(req.params.id) });
    res.json({ message: "Đã xóa user thành công" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// [ADMIN] Thêm học viên (Optional)
app.post('/users', async (req, res) => {
  try {
    const lastUser = await User.findOne().sort({ id: -1 });
    const newId = lastUser ? lastUser.id + 1 : 1;
    const newUser = new User({ ...req.body, id: newId });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// --- 3. API BÀI HỌC (LESSONS) ---

// Lấy bài học (hỗ trợ lọc theo courseId cho trang CourseDetail)
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


// --- 4. API TRẮC NGHIỆM (QUIZZES) ---

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


// --- 5. API ĐÁNH GIÁ (TESTIMONIALS) ---

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
    const newItem = new Testimonial({ ...req.body, id: newId });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// KHỞI CHẠY SERVER
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});