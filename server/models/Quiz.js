const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  lessonId: { type: Number, required: true }, // Liên kết với Lesson
  title: String,
  questions: [
    {
      id: String,
      questionText: String,
      options: [String],
      correctAnswerIndex: Number
    }
  ]
});

module.exports = mongoose.model('Quiz', quizSchema);