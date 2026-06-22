import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { PayOS } from '@payos/node';

dotenv.config({ path: '../.env' }); // Load from root dir
dotenv.config();

const payos = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

app.post('/api/send-certificate', async (req, res) => {
  const { email, courseName, userName, pdfBase64 } = req.body;

  if (!email || !pdfBase64) {
    return res.status(400).json({ success: false, message: 'Thiếu email hoặc file chứng chỉ' });
  }

  const mailOptions = {
    from: `"LearnHub Certification" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎓 Chúc mừng! Chứng chỉ khóa học ${courseName} của bạn`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0284c7; text-align: center;">Chúc Mừng Bạn Đã Hoàn Thành Khóa Học!</h2>
        <p>Chào <strong>${userName}</strong>,</p>
        <p>Hệ thống LearnHub xin chúc mừng bạn đã xuất sắc hoàn thành khóa học <strong>${courseName}</strong>.</p>
        <p>Thành quả học tập của bạn đã được ghi nhận. Vui lòng kiểm tra file đính kèm để nhận chứng chỉ hoàn thành khóa học của mình.</p>
        <br/>
        <p>Chúc bạn gặt hái thêm nhiều thành công trên con đường học tập và sự nghiệp!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Hệ thống giáo dục trực tuyến LearnHub.</p>
      </div>
    `,
    attachments: [
      {
        filename: `ChungChi_${courseName.replace(/\s+/g, '_')}.pdf`,
        path: pdfBase64
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Đã gửi chứng chỉ đến email: ${email}`);
    res.json({ success: true, message: 'Certificate sent successfully' });
  } catch (error) {
    console.error('Lỗi khi gửi email chứng chỉ:', error);
    res.status(500).json({ success: false, message: 'Failed to send certificate' });
  }
});

app.post('/api/send-admin-email', async (req, res) => {
  const { emails, subject, content, level } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0 || !subject || !content) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin người nhận, tiêu đề hoặc nội dung' });
  }

  let color = '#3b82f6'; // info (blue)
  if (level === 'warning') color = '#f59e0b';
  if (level === 'error') color = '#ef4444';
  if (level === 'success') color = '#10b981';

  const mailOptions = {
    from: `"LearnHub System" <${process.env.EMAIL_USER}>`,
    to: emails.join(','), // Gửi BCC hoặc To danh sách
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 10px;">${subject}</h2>
        <div style="color: #334155; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${content}</div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">Đây là email tự động từ hệ thống giáo dục trực tuyến LearnHub. Vui lòng không trả lời trực tiếp email này.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Đã gửi thông báo Admin đến ${emails.length} người dùng.`);
    res.json({ success: true, message: 'Admin email sent successfully' });
  } catch (error) {
    console.error('Lỗi khi gửi Admin email:', error);
    res.status(500).json({ success: false, message: 'Failed to send admin email' });
  }
});

// PAYOS ROUTES
app.post('/api/create-payment-link', async (req, res) => {
  try {
    const { amount, description, returnUrl, cancelUrl } = req.body;
    
    // Check minimum 10.000 VND
    if (!amount || amount < 10000) {
      return res.status(400).json({ error: -1, message: 'Số tiền tối thiểu là 10.000 VNĐ', data: null });
    }

    const orderCode = Number(String(Date.now()).slice(-6));
    const body = {
      orderCode,
      amount,
      description: 'Thanh toan vi',
      returnUrl: returnUrl || 'http://localhost:5173/wallet',
      cancelUrl: cancelUrl || 'http://localhost:5173/wallet'
    };

    const paymentLinkRes = await payos.paymentRequests.create(body);
    res.json({ error: 0, message: 'Success', data: { checkoutUrl: paymentLinkRes.checkoutUrl, paymentLinkId: paymentLinkRes.id || paymentLinkRes.paymentLinkId, orderCode } });
  } catch (error) {
    console.error('Lỗi khi tạo payment link:', error);
    res.status(500).json({ error: -1, message: 'fail', data: null });
  }
});

app.get('/api/payment-info/:orderCode', async (req, res) => {
  try {
    const orderCode = String(req.params.orderCode);
    const paymentLinkInfo = await payos.paymentRequests.get(orderCode);
    res.json({ error: 0, message: 'Success', data: paymentLinkInfo });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin thanh toán:', error);
    res.status(500).json({ error: -1, message: 'fail', data: null });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mailer API đang chạy tại http://localhost:${PORT}`);
});
