const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


// const { PayOS } = require('@payos/node');

// Import Models
const Course = require('./models/Course');
const User = require('./models/User');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const Testimonial = require('./models/Testimonial');
const Progress = require('./models/Progress');
const Order = require('./models/Order');

const app = express();

app.use(cors());
app.use(express.json());

// --- 2. KẾT NỐI MONGODB ---
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
    console.error("❌ Lỗi: Chưa cấu hình MONGODB_URI trong file .env");
} else {
    mongoose.connect(mongoURI)
        .then(() => console.log("✅ Đã kết nối MongoDB Atlas thành công"))
        .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));
}

// --- 3. KHỞI TẠO PAYOS (ĐÃ BỎ) ---
/*
const PAYOS_CLIENT_ID = process.env.PAYOS_CLIENT_ID;
const PAYOS_API_KEY = process.env.PAYOS_API_KEY;
const PAYOS_CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

let payos;
try {
    payos = new PayOS(PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY);
    console.log("✅ Khởi tạo PayOS thành công");
} catch (error) {
    console.error("❌ Lỗi khởi tạo PayOS:", error);
}
*/

const router = express.Router();

// --- Helper: Cập nhật tiến độ ---
const updateLessonProgress = async (userId, courseId, lessonId) => {
    try {
        const lessonIdNum = parseInt(lessonId);
        const courseIdNum = parseInt(courseId);
        const userIdNum = parseInt(userId);

        let progress = await Progress.findOne({ userId: userIdNum, courseId: courseIdNum });
        if (!progress) {
            progress = new Progress({ userId: userIdNum, courseId: courseIdNum, completedLessons: [] });
        }

        if (!progress.completedLessons.includes(lessonIdNum)) {
            progress.completedLessons.push(lessonIdNum);
        }

        const totalLessons = await Lesson.countDocuments({ courseId: courseIdNum });
        progress.progressPercentage = totalLessons > 0
            ? Math.round((progress.completedLessons.length / totalLessons) * 100)
            : 0;

        await progress.save();
        return progress;
    } catch (err) {
        console.error("❌ Lỗi Helper:", err);
        return null;
    }
};

// ==========================================
// 4. API AUTH (LOGIN & REGISTER)
// ==========================================

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Vui lòng nhập tài khoản và mật khẩu" });
        }
        const user = await User.findOne({ username, password });
        if (!user) {
            return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
        }
        res.json(user);
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Lỗi server: " + err.message });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, email } = req.body;
        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) return res.status(400).json({ message: "Tên đăng nhập hoặc Email đã tồn tại" });

        const newId = Date.now();
        await new User({ id: newId, ...req.body, role: 'user', coursesEnrolled: [] }).save();
        res.json({ message: "Đăng ký thành công", user: { username, id: newId } });
    } catch (e) { res.status(500).json({ message: e.message }) }
});

router.get('/users', async (req, res) => {
    try {
        const { username, password, role } = req.query;
        let q = {};
        if (username) q.username = username;
        if (password) q.password = password;
        if (role) q.role = role;
        res.json(await User.find(q));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 5. API PAYOS (ĐÃ BỎ)
// ==========================================
// Các API /payment/create-link và /payment/webhook đã được xóa/comment
// để tránh lỗi khi không có cấu hình PayOS.

// ==========================================
// 6. CÁC API KHÁC (COURSES, LESSONS...)
// ==========================================

// API Đăng ký khóa học trực tiếp (Không cần thanh toán)
router.post('/enroll', async (req, res) => {
    try {
        const { userId, courseId } = req.body;
        const userIdNum = parseInt(userId);
        const courseIdNum = parseInt(courseId);

        // Kiểm tra xem đã đăng ký chưa để tránh trùng lặp
        const user = await User.findOne({ id: userIdNum });
        if (user && !user.coursesEnrolled.includes(courseIdNum)) {
            await User.findOneAndUpdate(
                { id: userIdNum },
                {
                    $push: { coursesEnrolled: courseIdNum },
                    $inc: { coursesEnrolledCount: 1 } // Tăng số lượng khóa học
                }
            );
            // Tạo progress mới
            await new Progress({ userId: userIdNum, courseId: courseIdNum }).save();
        }

        res.json({ message: "Success" });
    } catch (error) {
        console.error("Enroll error:", error);
        res.status(500).json({ message: "Lỗi server khi đăng ký" });
    }
});

// Courses
router.get('/courses', async (req, res) => {
    try { res.json(await Course.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/courses/:id', async (req, res) => {
    try { res.json(await Course.findOne({ id: parseInt(req.params.id) })); } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/courses', async (req, res) => {
    await new Course({ ...req.body, id: Date.now() }).save();
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

// Lessons & Quizzes
router.get('/lessons', async (req, res) => res.json(await Lesson.find(req.query.courseId ? { courseId: parseInt(req.query.courseId) } : {})));
router.get('/lessons/:id', async (req, res) => res.json(await Lesson.findOne({ id: parseInt(req.params.id) })));
router.post('/lessons', async (req, res) => { await new Lesson({ ...req.body, id: Date.now() }).save(); res.json({ msg: "Ok" }); });
router.delete('/lessons/:id', async (req, res) => { await Lesson.findOneAndDelete({ id: parseInt(req.params.id) }); res.json({ msg: "Ok" }); });

router.get('/quizzes', async (req, res) => res.json(await Quiz.find(req.query.lessonId ? { lessonId: parseInt(req.query.lessonId) } : {})));
router.get('/quizzes/:id', async (req, res) => res.json(await Quiz.findOne({ id: parseInt(req.params.id) })));
router.post('/quizzes/submit', async (req, res) => res.json({ passed: true, score: 10 }));

// Progress & Testimonials
router.get('/progress', async (req, res) => {
    const p = await Progress.findOne({ userId: parseInt(req.query.userId), courseId: parseInt(req.query.courseId) });
    res.json(p || { completedLessons: [], progressPercentage: 0 });
});
router.post('/progress/complete-lesson', async (req, res) => {
    await updateLessonProgress(req.body.userId, req.body.courseId, req.body.lessonId);
    res.json({ message: "Updated" });
});
router.get('/testimonials', async (req, res) => res.json(await Testimonial.find()));
router.post('/testimonials', async (req, res) => {
    await new Testimonial({ ...req.body, id: Date.now() }).save();
    res.json({ message: "Success" });
});

app.use('/api', router);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});