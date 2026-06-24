import supabase from '../config/supabase.js';
import transporter from '../config/nodemailer.js';
import { emailOtpStore } from '../store/store.js';
import { createPendingLoginAndNotify } from './auth.controller.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Kiểm tra DB
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu' });
    }

    if (user.role !== 'admin' && user.role !== 'support') {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
    }

    // Nếu là admin/support, kiểm tra 2FA
    if (!user.two_factor_secret) {
      // Chưa cài 2FA -> Chuyển sang chờ duyệt luôn
      const requestId = await createPendingLoginAndNotify(user, req);
      return res.json({
        success: true,
        pendingApproval: true,
        requestId,
        message: 'Đang chờ Admin phê duyệt...'
      });
    }

    // Đã cài 2FA -> Yêu cầu mã 2FA
    res.json({
      success: true,
      message: 'Vui lòng nhập mã 2FA từ ứng dụng Authenticator',
      require2FA: true,
      email
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export const sendBackupOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Gửi OTP qua email
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    emailOtpStore[email] = { otp: emailOtp, expires: Date.now() + 5 * 60000 };

    const mailOptions = {
      from: `"LearnHub System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Mã xác thực dự phòng 2FA',
      html: `<h2>Mã OTP dự phòng của bạn là: ${emailOtp}</h2><p>Mã này có hiệu lực trong 5 phút.</p>`
    };
    await transporter.sendMail(mailOptions);
    
    res.json({ success: true, message: 'Đã gửi mã dự phòng qua email' });
  } catch (err) {
    console.error("Lỗi gửi email backup 2FA:", err);
    res.status(500).json({ success: false, message: 'Lỗi gửi email' });
  }
};

export const setup2FA = async (req, res) => {
  try {
    const { email } = req.body;
    const secretData = speakeasy.generateSecret({ name: 'LearnHub (Admin)', issuer: 'LearnHub' });
    const qrCodeUrl = await QRCode.toDataURL(secretData.otpauth_url);
    
    res.json({ success: true, secret: secretData.base32, qrCodeUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export const confirm2FA = async (req, res) => {
  try {
    const { email, secret, code } = req.body;
    
    const isValid = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 4
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Mã xác nhận không đúng' });
    }

    // Lưu vào database
    const { error: updateError } = await supabase.from('users').update({ 
      two_factor_secret: secret,
      two_factor_enabled: true 
    }).eq('email', email);

    if (updateError) {
      return res.status(500).json({ success: false, message: 'Lỗi Database: Cột two_factor_secret không tồn tại. Vui lòng thêm cột này vào bảng users trên Supabase.' });
    }

    res.json({ success: true, message: 'Cài đặt xác minh 2 lớp thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export const disable2FA = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Lưu vào database
    const { error: updateError } = await supabase.from('users').update({ 
      two_factor_secret: null,
      two_factor_enabled: false 
    }).eq('email', email);

    if (updateError) {
      return res.status(500).json({ success: false, message: 'Lỗi khi hủy 2FA.' });
    }

    res.json({ success: true, message: 'Đã tắt xác minh 2 bước thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export const verify2FA = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    // Lấy thông tin user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(401).json({ success: false, message: 'User không tồn tại' });

    let isValid = false;

    // Kiểm tra Authenticator App
    if (user.two_factor_secret) {
      isValid = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: code,
        window: 4 // allow 2 minutes drift
      });
    }

    // Kiểm tra Email OTP nếu Authenticator sai
    if (!isValid && emailOtpStore[email]) {
      const storedData = emailOtpStore[email];
      if (storedData.otp === code && Date.now() < storedData.expires) {
        isValid = true;
        delete emailOtpStore[email]; // Xoá sau khi dùng
      }
    }

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Mã xác thực không hợp lệ hoặc đã hết hạn' });
    }

    // Xác thực 2FA đúng -> Chuyển sang chờ duyệt
    const requestId = await createPendingLoginAndNotify(user, req);

    res.json({
      success: true,
      pendingApproval: true,
      requestId,
      message: 'Mã đúng. Đang chờ Admin phê duyệt...'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
