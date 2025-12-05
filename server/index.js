const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

// --- 1. IMPORT PAYOS (CÁCH CHUẨN XÁC) ---
// Dùng destructuring để lấy Class PayOS
const { PayOS } = require('@payos/node');

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

// --- 3. KHỞI TẠO PAYOS ---
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
// 4. API AUTH (LOGIN & REGISTER) - QUAN TRỌNG
// ==========================================

// [MỚI] API Đăng nhập chuẩn (POST)
// Fix lỗi "Login vào là ra user đầu tiên"
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 1. Kiểm tra đầu vào
        if (!username || !password) {
            return res.status(400).json({ message: "Vui lòng nhập tài khoản và mật khẩu" });
        }

        // 2. Tìm user khớp chính xác
        const user = await User.findOne({ username, password });

        if (!user) {
            return res.status(401).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
        }

        // 3. Trả về user
        res.json(user);

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Lỗi server: " + err.message });
    }
});

// API Đăng ký (Có check trùng lặp)
router.post('/register', async (req, res) => {
    try {
        const { username, email } = req.body;
        const existing = await User.findOne({ $or: [{username}, {email}] });
        if(existing) return res.status(400).json({ message: "Tên đăng nhập hoặc Email đã tồn tại" });
        
        const newId = Date.now();
        await new User({ id: newId, ...req.body, role: 'user', coursesEnrolled: [] }).save();
        res.json({ message: "Đăng ký thành công", user: { username, id: newId } });
    } catch(e) { res.status(500).json({message: e.message}) }
});

// API lấy danh sách User (Dành cho Admin hoặc debug)
router.get('/users', async (req, res) => {
    try {
        const { username, password, role } = req.query;
        let q = {};
        if(username) q.username = username;
        if(password) q.password = password;
        if(role) q.role = role;
        res.json(await User.find(q));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================================
// 5. API PAYOS (THANH TOÁN)
// ==========================================
router.post('/payment/create-link', async (req, res) => {
    const { userId, courseId } = req.body;
    try {
        console.log("➡️ Tạo link thanh toán cho:", { userId, courseId });

        const course = await Course.findOne({ id: parseInt(courseId) });
        if (!course) return res.status(404).json({ message: "Không tìm thấy khóa học" });

        if (!course.price || course.price === 0) {
            return res.status(400).json({ message: "Miễn phí không cần thanh toán." });
        }

        const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));

        await Order.create({
            orderCode,
            userId,
            courseId,
            amount: course.price,
            status: 'pending'
        });

        // Cập nhật Domain thật
        const domain = 'https://vietcloud.id.vn'; 
        
        const paymentLinkData = {
            orderCode: orderCode,
            amount: course.price,
            description: `Thanh toan KH ${course.id}`,
            items: [{ name: course.title, quantity: 1, price: course.price }],
            returnUrl: `${domain}/payment-result`, 
            cancelUrl: `${domain}/course/${courseId}`
        };

        // Tự động chọn hàm đúng để tránh lỗi "is not a function"
        let paymentLink;
        if (payos && typeof payos.createPaymentLink === 'function') {
            paymentLink = await payos.createPaymentLink(paymentLinkData);
        } else if (payos && payos.paymentRequests && typeof payos.paymentRequests.create === 'function') {
            paymentLink = await payos.paymentRequests.create(paymentLinkData);
        } else {
            throw new Error("Lỗi thư viện PayOS: Không tìm thấy hàm tạo link.");
        }

        console.log("✅ Link PayOS:", paymentLink.checkoutUrl);
        res.json({ checkoutUrl: paymentLink.checkoutUrl });

    } catch (error) {
        console.error("❌ Lỗi PayOS:", error);
        res.status(500).json({ message: "Lỗi tạo giao dịch: " + error.message });
    }
});

router.post('/payment/webhook', async (req, res) => {
    try {
        // Fallback xác thực webhook
        let webhookData;
        if (payos && typeof payos.verifyPaymentWebhookData === 'function') {
             webhookData = payos.verifyPaymentWebhookData(req.body);
        } else {
             webhookData = req.body.data;
        }

        if (webhookData && webhookData.code === '00') {
            const orderCode = webhookData.orderCode;
            const order = await Order.findOne({ orderCode });
            
            if (order && order.status === 'pending') {
                order.status = 'paid';
                await order.save();
                
                await User.findOneAndUpdate(
                    { id: order.userId, 'coursesEnrolled': { $ne: order.courseId } }, 
                    { $push: { coursesEnrolled: order.courseId }, $inc: { coursesEnrolledCount: 1 } }
                );
                
                await new Progress({ userId: order.userId, courseId: order.courseId }).save();
                console.log(`✅ Webhook: Đã kích hoạt đơn hàng ${orderCode}`);
            }
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.json({ success: false }); 
    }
});

// ==========================================
// 6. CÁC API KHÁC (COURSES, LESSONS...)
// ==========================================

router.post('/enroll', async (req, res) => {
    const { userId, courseId } = req.body;
    await User.findOneAndUpdate({id: parseInt(userId)}, {$push: {coursesEnrolled: parseInt(courseId)}});
    await new Progress({ userId: parseInt(userId), courseId: parseInt(courseId) }).save();
    res.json({message: "Success"});
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
router.post('/lessons', async (req, res) => { await new Lesson({...req.body, id: Date.now()}).save(); res.json({msg:"Ok"}); });
router.delete('/lessons/:id', async (req, res) => { await Lesson.findOneAndDelete({id: parseInt(req.params.id)}); res.json({msg:"Ok"}); });

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