const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Lưu ý: Thực tế nên mã hóa password
  role: { type: String, default: 'user' }, // 'admin' hoặc 'user'
  fullname: String,
  email: String,
  phone: String,
  joinDate: String,
  status: { type: String, default: 'active' },
  coursesEnrolled: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);