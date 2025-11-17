const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // <-- Thêm dòng này

// Import Models
const User = require('./models/User');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const Testimonial = require('./models/Testimonial');

const dbPath = path.join(__dirname, '../db.json');
const rawData = fs.readFileSync(dbPath);
const data = JSON.parse(rawData);

const runSeed = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) throw new Error("Chưa có MONGODB_URI trong .env");

    await mongoose.connect(mongoURI);
    console.log('✅ Đã kết nối MongoDB Atlas để seed dữ liệu...');

    // Xóa dữ liệu cũ
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();
    await Quiz.deleteMany();
    await Testimonial.deleteMany();

    // Thêm dữ liệu mới
    if(data.users) await User.create(data.users);
    if(data.courses) await Course.create(data.courses);
    if(data.lessons) await Lesson.create(data.lessons);
    if(data.quizzes) await Quiz.create(data.quizzes);
    if(data.testimonials) await Testimonial.create(data.testimonials);

    console.log('🎉 Đã nạp dữ liệu lên Cloud thành công!');
    process.exit();
  } catch (error) {
    console.error('❌ Lỗi khi nạp dữ liệu:', error);
    process.exit(1);
  }
};

runSeed();