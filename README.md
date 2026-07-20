# LearnHub (E-Learning Platform)

Một nền tảng học tập trực tuyến hiện đại được xây dựng với React, Vite và Supabase.

## ✨ Tính năng nổi bật

- **Quản lý khóa học & Bài giảng:** Xem, theo dõi tiến độ học tập và tham gia các bài kiểm tra (Quiz).
- **Cấp phát Chứng chỉ:** Tự động tạo và gửi chứng chỉ qua email khi hoàn thành khóa học.
- **Cộng đồng (Forum):** Diễn đàn trao đổi và thảo luận giữa các học viên.
- **Thanh toán (Wallet):** Tích hợp cổng thanh toán PayOS để nạp tiền và mua khóa học.
- **Trang Quản trị (Admin Dashboard):**
  - Quản lý khóa học, bài học, người dùng và giao dịch.
  - Phân tích thống kê (Analytics) trực quan với Recharts.
  - Cài đặt hệ thống: Chế độ bảo trì, thông báo toàn trang (Global Announcement) và bật/tắt Giao diện Tối (Dark mode).
  - Gửi email thông báo cho học viên trực tiếp từ Admin.
  - Bảo mật 2 lớp (2FA) cho tài khoản Admin.

## 🛠 Công nghệ sử dụng

- **Frontend:** React 19 (Vite), Tailwind CSS v4, Lucide React, React Router, Recharts.
- **Backend / Database:** Supabase (PostgreSQL), Node.js (Express) xử lý email và webhook.
- **Công cụ hỗ trợ:** html2canvas & jsPDF (xuất PDF), i18next (đa ngôn ngữ).

## 🚀 Hướng dẫn cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (phiên bản v18 trở lên).
- Tài khoản Supabase, PayOS và cấu hình Email (Nodemailer).

### 1. Cài đặt thư viện
Tại thư mục gốc của dự án, chạy lệnh:
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` ở thư mục gốc và cung cấp các thông tin cần thiết (Supabase URL, API Key, Cấu hình SMTP cho mailer, cấu hình PayOS...).

### 3. Chạy dự án (Môi trường Dev)
Dự án sử dụng `concurrently` để chạy song song Frontend và Backend. Chỉ cần chạy 1 lệnh duy nhất:
```bash
npm run dev
```

- **Frontend (Vite):** thường chạy tại `http://localhost:5173`
- **Backend (Node.js Server):** thường chạy tại `http://localhost:3001`

### 4. Xây dựng bản Production (Build)
```bash
npm run build
```

## 📁 Cấu trúc thư mục chính

- `/src`: Toàn bộ mã nguồn Frontend (Components, Pages, Context, Utils...).
- `/server`: Mã nguồn Node.js Server (Xử lý gửi mail, webhooks, 2FA setup...).
- `database.sql` / `schema.sql`: File chứa cấu trúc Database của hệ thống (Supabase/PostgreSQL).