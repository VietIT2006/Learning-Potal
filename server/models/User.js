// server/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
  status: { type: String, default: 'active' },
  joinDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  coursesEnrolled: [{ type: Number }], // [SỬA ĐỔI] Mảng ID các khóa học đã đăng ký
  coursesEnrolledCount: { type: Number, default: 0 } // [THÊM]
});

module.exports = mongoose.model('User', userSchema);