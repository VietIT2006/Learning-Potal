import nodemailer from 'nodemailer';
import './env.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.VITE_EMAIL_USER,
    pass: process.env.VITE_EMAIL_PASS, // Mật khẩu ứng dụng (App Password)
  },
});

export default transporter;
