import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng (App Password)
  },
});

app.post('/api/send-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Thiếu email hoặc OTP' });
  }

  const mailOptions = {
    from: `"LearnHub Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Mã xác nhận khôi phục mật khẩu (OTP)',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0284c7; text-align: center;">Yêu Cầu Khôi Phục Mật Khẩu</h2>
        <p>Chào bạn,</p>
        <p>Bạn vừa yêu cầu khôi phục mật khẩu tại hệ thống LearnHub. Vui lòng sử dụng mã xác nhận (OTP) gồm 6 chữ số dưới đây để tiếp tục:</p>
        <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #0f172a; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #64748b; font-size: 14px;">Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Đã gửi OTP ${otp} đến email: ${email}`);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mailer API đang chạy tại http://localhost:${PORT}`);
});
