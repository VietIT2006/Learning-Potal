// server/models/Progress.js (TẠO FILE NÀY)
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  courseId: { type: Number, required: true },
  
  // Mảng các Lesson ID đã hoàn thành
  completedLessons: [{ type: Number }], 
  
  // Tính tổng tiến độ (ví dụ: 0 đến 100)
  progressPercentage: { type: Number, default: 0 },
  
  // Đảm bảo mỗi user chỉ có 1 progress record cho 1 course
  uniqueId: { type: String, unique: true }, 
});

// Logic tạo uniqueId trước khi lưu
progressSchema.pre('save', function(next) {
    this.uniqueId = `${this.userId}-${this.courseId}`;
    next();
});

module.exports = mongoose.model('Progress', progressSchema);