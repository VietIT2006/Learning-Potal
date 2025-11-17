const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // <-- Thêm dòng này ở đầu để đọc file .env

// Import Models
const Course = require('./models/Course');
const User = require('./models/User');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const Testimonial = require('./models/Testimonial');

const app = express();
app.use(cors());
app.use(express.json());

// KẾT NỐI MONGODB CLOUD
// Sử dụng process.env.MONGODB_URI lấy từ file .env
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("❌ Lỗi: Chưa cấu hình MONGODB_URI trong file .env");
  process.exit(1);
}

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Đã kết nối MongoDB Atlas"))
  .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));

// ... (Phần còn lại của các API giữ nguyên như cũ)

// KHỞI CHẠY SERVER
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});