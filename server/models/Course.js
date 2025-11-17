const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // ID số cho frontend
  title: { type: String, required: true },
  description: String,
  thumbnail: String,
  category: String,
  level: String,
  price: Number,
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  students: { type: Number, default: 0 },
  duration: String,
  instructor: String
});

module.exports = mongoose.model('Course', courseSchema);