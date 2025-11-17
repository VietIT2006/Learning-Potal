const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import Models
const User = require('./models/User');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');
const Testimonial = require('./models/Testimonial');

// Kết nối DB
mongoose.connect('mongodb+srv://msvAdmin:MaiSonViet2006@@learning-potal.yotzhfw.mongodb.net/?appName=Learning-Potal')
  .then(() => console.log('Đã kết nối DB để seed dữ liệu...'))
  .catch(err => console.log(err));

// Đọc file db.json (File này nằm ở thư mục gốc dự án, nên cần ../)
const dbPath = path.join(__dirname, '../db.json');
const rawData = fs.readFileSync(dbPath);
const data = JSON.parse(rawData);

const importData = async () => {
  try {
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

    console.log('✅ Đã nạp dữ liệu thành công!');
    process.exit();
  } catch (error) {
    console.error('❌ Lỗi khi nạp dữ liệu:', error);
    process.exit(1);
  }
};

importData();