import supabase from '../config/supabase.js';
import transporter from '../config/nodemailer.js';
import { loginRequests } from '../store/store.js';
import { getIpLocation } from '../utils/ipLocation.js';
import { renderApprovalPage } from '../utils/htmlTemplate.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'learnhub-super-secret-key-2026';

// Helper: Tạo Pending Login và gửi thông báo
export async function createPendingLoginAndNotify(user, req) {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown IP';
  
  const locData = await getIpLocation(ip);
  ip = locData.ip;
  const location = locData.location;

  const requestId = crypto.randomUUID();
  loginRequests[requestId] = {
    id: requestId,
    user: user,
    email: user.email,
    role: user.role,
    ip: ip,
    location: location,
    device: req.headers['user-agent'] || 'Unknown Device',
    status: 'pending',
    timestamp: Date.now()
  };

  // Gửi email xác nhận cho Người dùng (User) đang cố gắng đăng nhập
  const mailOptions = {
    from: `"LearnHub Security" <${process.env.EMAIL_USER}>`,
    to: user.email, // Gửi về email của chính user đó
    subject: `🚨 Xác nhận yêu cầu đăng nhập LearnHub`,
    html: `
      <h2>Phát hiện đăng nhập mới vào tài khoản của bạn</h2>
      <p>Hệ thống ghi nhận một phiên đăng nhập mới với thông tin sau:</p>
      <p><strong>Tài khoản:</strong> ${user.email} (${user.role})</p>
      <p><strong>IP:</strong> ${ip}</p>
      <p><strong>Vị trí:</strong> ${location}</p>
      <p><strong>Thiết bị:</strong> ${req.headers['user-agent']}</p>
      <p>Nếu đây là bạn, vui lòng bấm CHẤP NHẬN để đăng nhập. Nếu không, hãy bấm TỪ CHỐI để bảo vệ tài khoản.</p>
      <br/>
      <a href="http://localhost:3001/api/auth/email-approve?id=${requestId}&action=approve" style="padding: 10px 20px; background: #10b981; color: white; text-decoration: none; border-radius: 5px;">✅ CHẤP NHẬN ĐĂNG NHẬP</a>
      <a href="http://localhost:3001/api/auth/email-approve?id=${requestId}&action=reject" style="padding: 10px 20px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin-left: 10px;">❌ TỪ CHỐI</a>
    `
  };
  transporter.sendMail(mailOptions).catch(console.error);

  return requestId;
}

export const loginRequest = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !user) return res.status(401).json({ success: false, message: 'Sai email hoặc mật khẩu' });
    if (user.status === 'inactive') return res.status(403).json({ success: false, message: 'Tài khoản đã bị khóa' });

    const requestId = await createPendingLoginAndNotify(user, req);
    res.json({ success: true, pendingApproval: true, requestId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

export const checkLoginStatus = (req, res) => {
  const { requestId } = req.query;
  const reqData = loginRequests[requestId];
  
  if (!reqData) return res.json({ status: 'not_found' });
  
  if (reqData.status === 'approved') {
    const token = jwt.sign(
      { id: reqData.user.id, email: reqData.user.email, role: reqData.user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    // Xoá request sau khi đã trả token thành công
    delete loginRequests[requestId];
    
    return res.json({
      status: 'approved',
      token: token,
      user: reqData.user
    });
  }
  
  if (reqData.status === 'rejected') {
    delete loginRequests[requestId];
    return res.json({ status: 'rejected' });
  }
  
  res.json({ status: 'pending' });
};

export const emailApprove = (req, res) => {
  const { id, action } = req.query;
  const reqData = loginRequests[id];
  if (!reqData) return res.send(renderApprovalPage('warning', 'Yêu cầu không tồn tại, đã hết hạn hoặc đã được xử lý. Vui lòng thử lại.'));
  
  if (action === 'approve') {
    reqData.status = 'approved';
    res.send(renderApprovalPage('success', 'Đã CHẤP NHẬN đăng nhập thành công!<br/>Trình duyệt ở thiết bị kia sẽ tự động đăng nhập.'));
  } else {
    reqData.status = 'rejected';
    res.send(renderApprovalPage('error', 'Đã TỪ CHỐI đăng nhập thành công để bảo vệ tài khoản.'));
  }
};

export const getPendingLogins = (req, res) => {
  const pending = Object.values(loginRequests).filter(r => r.status === 'pending');
  res.json({ success: true, requests: pending });
};

export const approveLogin = (req, res) => {
  const { requestId, action } = req.body;
  if (loginRequests[requestId]) {
    loginRequests[requestId].status = action === 'approve' ? 'approved' : 'rejected';
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Not found' });
  }
};
