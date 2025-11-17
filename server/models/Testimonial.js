const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  role: String,
  avatar: String,
  content: String,
  rating: Number
});

module.exports = mongoose.model('Testimonial', testimonialSchema);