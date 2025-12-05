const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderCode: { type: Number, required: true, unique: true }, // Mã đơn hàng (số) bắt buộc của PayOS
  userId: { type: Number, required: true },
  courseId: { type: Number, required: true },
  amount: Number,
  status: { type: String, default: 'pending', enum: ['pending', 'paid', 'cancelled'] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);