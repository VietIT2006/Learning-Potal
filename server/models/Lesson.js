const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  courseId: Number, // Liên kết với Course bằng ID số
  title: String,
  videoUrl: String,
  duration: String
});

module.exports = mongoose.model('Lesson', LessonSchema);