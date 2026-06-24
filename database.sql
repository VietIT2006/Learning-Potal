-- ============================================================
-- Learning Portal Database
-- Generated from db.json
-- ============================================================

-- ============================================================
-- 1. BẢNG USERS
-- ============================================================
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'support')),
    full_name TEXT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    join_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    courses_enrolled_count INT DEFAULT 0,
    avatar_url TEXT,
    two_factor_secret TEXT,
    two_factor_enabled BOOLEAN DEFAULT FALSE
);

INSERT INTO users (id, username, password, role, full_name, email, phone, join_date, status, courses_enrolled_count) VALUES
(1,  'hocvien01',      '123', 'user',  'Nguyễn Văn An',     'an.nguyen@example.com',      '0901234567', '2023-10-15', 'active', 3),
(2,  'hocvien02',      '123', 'user',  'Trần Thị Bích',     'bich.tran@example.com',      '0909888777', '2024-01-10', 'active', 2),
(3,  'dev_pro',        '123', 'user',  'Lê Hoàng Nam',      'nam.dev@example.com',        '0912345678', '2024-02-20', 'active', 4),
(4,  'designer_cool',  '123', 'user',  'Phạm Thanh Hằng',   'hang.design@example.com',    '0923456789', '2024-03-05', 'active', 2),
(5,  'marketer_top',   '123', 'user',  'Đỗ Quang Minh',     'minh.marketing@example.com', '0934567890', '2024-03-18', 'active', 2),
(6,  'english_master', '123', 'user',  'Ngô Bảo Ngọc',      'ngoc.ngo@example.com',       '0945678901', '2024-04-01', 'active', 2),
(7,  'newbie_coder',   '123', 'user',  'Vũ Tiến Đạt',       'dat.vu@example.com',         '0956789012', '2024-04-22', 'active', 1),
(8,  'business_man',   '123', 'user',  'Hoàng Quốc Việt',   'viet.hoang@example.com',     '0967890123', '2024-05-10', 'active', 2),
(9,  'data_science',   '123', 'user',  'Trương Mỹ Lan',     'lan.truong@example.com',     '0978901234', '2024-06-01', 'active', 1),
(10, 'fullstack_dev',  '123', 'user',  'Lý Hải',            'hai.ly@example.com',         '0989012345', '2024-06-15', 'active', 3),
(98, 'support_agent',  '123', 'support', 'Nhân viên Hỗ trợ', 'support@learnhub.com',       '0911111111', '2024-06-20', 'active', 0),
(99, 'admin',          '123', 'admin', 'Super Admin',        'admin@learnhub.com',         '0900000000', '2023-01-01', 'active', 0);

-- ============================================================
-- 2. BẢNG COURSES
-- ============================================================
CREATE TABLE courses (
    id INT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    category TEXT,
    level TEXT,
    price INT DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    reviews INT DEFAULT 0,
    students INT DEFAULT 0,
    duration VARCHAR(10),
    instructor TEXT,
    created_at DATE
);

INSERT INTO courses (id, title, description, thumbnail, category, level, price, rating, reviews, students, duration, instructor, created_at) VALUES
(1,  'Nhập môn Lập trình Web (HTML/CSS)', 'Xây dựng nền tảng vững chắc với HTML5 và CSS3. Khóa học dành cho người mới bắt đầu hoàn toàn, giúp bạn tự tay code giao diện website chuẩn SEO.', 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop', 'Programming', 'Beginner', 500000, 4.6, 120, 1500, '10h', 'Xuân Quang Thái', '2023-09-01'),
(2,  'ReactJS Masterclass 2024', 'Khóa học ReactJS chuyên sâu: Hooks, Context API, Redux Toolkit và React Query. Xây dựng dự án E-commerce thực tế.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop', 'Programming', 'Advanced', 1500000, 4.9, 85, 600, '25h', 'Nguyễn Minh Khôi', '2023-11-15'),
(3,  'UI/UX Design với Figma', 'Từ ý tưởng đến bản thiết kế hoàn chỉnh. Học cách tư duy sản phẩm, wireframe, prototype và design system chuyên nghiệp.', 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?q=80&w=800&auto=format&fit=crop', 'Design', 'Intermediate', 1200000, 4.7, 42, 350, '18h', 'Lê Thu Hà', '2024-01-10'),
(4,  'Tiếng Anh Giao Tiếp Công Sở', 'Tự tin giao tiếp trong môi trường quốc tế. Các mẫu câu thông dụng, kỹ năng thuyết trình và viết email chuyên nghiệp.', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop', 'Language', 'Beginner', 800000, 4.5, 60, 900, '12h', 'David Wilson', '2024-02-01'),
(5,  'Node.js & Express API', 'Học Backend với JavaScript. Xây dựng RESTful API, kết nối MongoDB, xác thực JWT và deploy server lên cloud.', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=800&auto=format&fit=crop', 'Programming', 'Intermediate', 1100000, 4.8, 35, 420, '20h', 'Trần Văn Hậu', '2024-02-20'),
(6,  'Digital Marketing Thực Chiến', 'Thành thạo Facebook Ads, Google Ads và SEO. Chiến lược content marketing để bùng nổ doanh số bán hàng.', 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=800&auto=format&fit=crop', 'Marketing', 'All Levels', 2000000, 4.4, 150, 2100, '30h', 'Phạm Văn Dũng', '2024-03-01'),
(7,  'Python cho Phân tích Dữ liệu', 'Nhập môn Data Science với Python. Sử dụng Pandas, NumPy, Matplotlib để xử lý và trực quan hóa dữ liệu.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop', 'Data Science', 'Beginner', 900000, 4.6, 20, 180, '15h', 'Ngô Bảo Châu', '2024-03-15'),
(8,  'Kỹ năng Quản lý Thời gian', 'Phương pháp Pomodoro, Ma trận Eisenhower và các công cụ giúp bạn làm việc hiệu quả hơn gấp 2 lần.', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop', 'Business', 'Beginner', 0, 4.9, 300, 5000, '4h', 'Nguyễn Hữu Trí', '2024-04-01'),
(9,  'Khởi nghiệp Tinh gọn (Lean Startup)', 'Học cách xây dựng mô hình kinh doanh, validate ý tưởng và gọi vốn đầu tư cho Startup của bạn.', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop', 'Business', 'Intermediate', 2500000, 4.7, 50, 300, '22h', 'Shark Hưng', '2024-04-20'),
(10, 'Luyện thi IELTS 7.0+', 'Chiến thuật làm bài 4 kỹ năng Nghe, Nói, Đọc, Viết. Tài liệu độc quyền và bài sửa chi tiết từ giám khảo.', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop', 'Language', 'Advanced', 3000000, 4.8, 200, 850, '40h', 'Ms. Jenny Nguyen', '2024-05-01');

-- ============================================================
-- 3. BẢNG USER_COURSES (Quan hệ N-N: User đăng ký khóa học)
-- ============================================================
CREATE TABLE user_courses (
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

INSERT INTO user_courses (user_id, course_id) VALUES
-- User 1: coursesEnrolled [1, 2, 5]
(1, 1), (1, 2), (1, 5),
-- User 2: coursesEnrolled [3, 4]
(2, 3), (2, 4),
-- User 3: coursesEnrolled [1, 2, 6, 7]
(3, 1), (3, 2), (3, 6), (3, 7),
-- User 4: coursesEnrolled [3, 8]
(4, 3), (4, 8),
-- User 5: coursesEnrolled [6, 9]
(5, 6), (5, 9),
-- User 6: coursesEnrolled [4, 10]
(6, 4), (6, 10),
-- User 7: coursesEnrolled [1]
(7, 1),
-- User 8: coursesEnrolled [8, 9]
(8, 8), (8, 9),
(9, 7),
-- User 10: coursesEnrolled [1, 2, 5]
(10, 1), (10, 2), (10, 5);

-- ============================================================
-- 4. BẢNG CHAT_MESSAGES (Hệ thống Hỗ trợ Realtime)
-- ============================================================
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    image_url TEXT,
    is_internal BOOLEAN DEFAULT FALSE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bật realtime cho chat_messages (nếu chưa bật)
-- alter publication supabase_realtime add table chat_messages;

-- ==========================================
-- 8. STORAGE (Lưu trữ ảnh chat)
-- ==========================================
-- Tạo bucket 'chat_images' (Cần thực hiện qua Supabase Dashboard hoặc script Storage API, giả lập SQL dưới đây)
-- insert into storage.buckets (id, name, public) values ('chat_images', 'chat_images', true);

-- Bật tính năng Realtime cho bảng chat_messages
-- Chú ý: Bạn cần phải enable Realtime cho bảng này trên giao diện Supabase (Database -> Replication)
-- hoặc chạy lệnh publication:
-- alter publication supabase_realtime add table chat_messages;

-- ============================================================
-- 4. BẢNG LESSONS
-- ============================================================
CREATE TABLE lessons (
    id INT PRIMARY KEY,
    course_id INT NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT,
    duration TEXT,
    lesson_order INT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

INSERT INTO lessons (id, course_id, title, video_url, duration, lesson_order) VALUES
(1,  1,  'Bài 1: Giới thiệu khóa học & Cài đặt VS Code',    'https://www.youtube.com/watch?v=kUMe1FH4CHE', '10:00', 1),
(2,  1,  'Bài 2: Các thẻ HTML thông dụng',                    'https://www.youtube.com/watch?v=qz0aGYrrlhU', '15:30', 2),
(3,  1,  'Bài 3: CSS Selectors cơ bản',                       'https://www.youtube.com/watch?v=1PnVor36_40', '20:00', 3),
(4,  2,  'Bài 1: React là gì? Virtual DOM',                   'https://www.youtube.com/watch?v=SqcY0GlETPk', '12:00', 1),
(5,  2,  'Bài 2: State và Props trong React',                 'https://www.youtube.com/watch?v=4ORZ1GmjaMc', '25:00', 2),
(6,  3,  'Bài 1: Làm quen giao diện Figma',                  'https://www.youtube.com/watch?v=4W4LvQNkTQM', '15:00', 1),
(7,  5,  'Bài 1: Khởi tạo Server ExpressJS',                  'https://www.youtube.com/watch?v=L72fhGm1tfE', '18:00', 1),
(8,  4,  'Bài 1: Giới thiệu bản thân bằng tiếng Anh',        'https://www.youtube.com/watch?v=EqJgZ6i7a_0', '10:00', 1),
(9,  6,  'Bài 1: Tư duy Marketing tổng thể',                  'https://www.youtube.com/watch?v=nU-IIXBWlS4', '22:00', 1),
(10, 7,  'Bài 1: Cài đặt Python và Anaconda',                 'https://www.youtube.com/watch?v=Y8Tko2YC5hA', '14:00', 1),
(11, 8,  'Bài 1: Ma trận Eisenhower là gì?',                  'https://www.youtube.com/watch?v=tT89OZ7TNwc', '08:00', 1),
(12, 9,  'Bài 1: Tìm kiếm ý tưởng khởi nghiệp',             'https://www.youtube.com/watch?v=Jj7pDNDuoWA', '30:00', 1),
(13, 10, 'Bài 1: Tổng quan bài thi IELTS',                    'https://www.youtube.com/watch?v=x5K2pD8_8co', '16:00', 1);

-- ============================================================
-- 5. BẢNG QUIZZES
-- ============================================================
CREATE TABLE quizzes (
    id INT PRIMARY KEY,
    lesson_id INT NOT NULL,
    title TEXT NOT NULL,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

INSERT INTO quizzes (id, lesson_id, title) VALUES
(101,  1,  'Kiểm tra Bài 1: Môi trường'),
(102,  2,  'Kiểm tra Bài 2: Thẻ HTML'),
(201,  4,  'Quiz: React Concept'),
(202,  5,  'Quiz: State & Props'),
(301,  6,  'Quiz: Figma Basics'),
(501,  7,  'Quiz: Node.js Basic'),
(601,  9,  'Quiz: Marketing Mindset'),
(701,  10, 'Quiz: Python Setup'),
(801,  11, 'Quiz: Time Management'),
(1001, 13, 'Quiz: IELTS Overview');

-- ============================================================
-- 6. BẢNG QUIZ_QUESTIONS
-- ============================================================
CREATE TABLE quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INT NOT NULL,
    question_code VARCHAR(10) NOT NULL,
    question_text TEXT NOT NULL,
    correct_answer_index INT NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

INSERT INTO quiz_questions (quiz_id, question_code, question_text, correct_answer_index) VALUES
-- Quiz 101
(101, 'q1', 'VS Code là sản phẩm của công ty nào?', 2),
-- Quiz 102
(102, 'q1', 'Thẻ nào dùng để xuống dòng?', 1),
(102, 'q2', 'Thẻ <a> dùng để làm gì?', 1),
-- Quiz 201
(201, 'q1', 'React sử dụng cơ chế nào để tối ưu hiệu năng?', 2),
-- Quiz 202
(202, 'q1', 'Props trong React có thể thay đổi được không?', 1),
-- Quiz 301
(301, 'q1', 'Phím tắt để tạo Frame trong Figma là gì?', 2),
-- Quiz 501
(501, 'q1', 'File chính để chạy server Node.js thường đặt tên là gì?', 3),
-- Quiz 601
(601, 'q1', '4P trong Marketing bao gồm?', 0),
-- Quiz 701
(701, 'q1', 'Lệnh in ra màn hình trong Python là?', 2),
-- Quiz 801
(801, 'q1', 'Một Pomodoro tiêu chuẩn kéo dài bao lâu?', 1),
-- Quiz 1001
(1001, 'q1', 'Bài thi IELTS có bao nhiêu kỹ năng?', 2);

-- ============================================================
-- 7. BẢNG QUIZ_OPTIONS (Các đáp án cho mỗi câu hỏi)
-- ============================================================
CREATE TABLE quiz_options (
    id SERIAL PRIMARY KEY,
    question_id INT NOT NULL,
    option_index INT NOT NULL,
    option_text TEXT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

-- Lấy question_id dựa trên thứ tự INSERT ở trên (auto_increment bắt đầu từ 1)
-- Question 1 (quiz 101, q1): VS Code là sản phẩm của công ty nào?
INSERT INTO quiz_options (question_id, option_index, option_text) VALUES
(1, 0, 'Google'), (1, 1, 'Facebook'), (1, 2, 'Microsoft'), (1, 3, 'JetBrains'),
-- Question 2 (quiz 102, q1): Thẻ nào dùng để xuống dòng?
(2, 0, '<lb>'), (2, 1, '<br>'), (2, 2, '<break>'), (2, 3, '<newline>'),
-- Question 3 (quiz 102, q2): Thẻ <a> dùng để làm gì?
(3, 0, 'Tạo ảnh'), (3, 1, 'Tạo liên kết (Link)'), (3, 2, 'Tạo đoạn văn'), (3, 3, 'Tạo bảng'),
-- Question 4 (quiz 201, q1): React sử dụng cơ chế nào...
(4, 0, 'Real DOM'), (4, 1, 'Shadow DOM'), (4, 2, 'Virtual DOM'), (4, 3, 'No DOM'),
-- Question 5 (quiz 202, q1): Props trong React...
(5, 0, 'Có'), (5, 1, 'Không (Read-only)'), (5, 2, 'Tùy trường hợp'), (5, 3, 'Chỉ trong Class Component'),
-- Question 6 (quiz 301, q1): Phím tắt để tạo Frame...
(6, 0, 'R'), (6, 1, 'T'), (6, 2, 'F'), (6, 3, 'A'),
-- Question 7 (quiz 501, q1): File chính để chạy server...
(7, 0, 'server.js'), (7, 1, 'app.js'), (7, 2, 'index.js'), (7, 3, 'Tất cả đều được'),
-- Question 8 (quiz 601, q1): 4P trong Marketing...
(8, 0, 'Product, Price, Place, Promotion'), (8, 1, 'People, Process, Product, Price'), (8, 2, 'Plan, Place, Promotion, People'), (8, 3, 'Tất cả đều sai'),
-- Question 9 (quiz 701, q1): Lệnh in ra màn hình...
(9, 0, 'console.log()'), (9, 1, 'echo'), (9, 2, 'print()'), (9, 3, 'System.out.println()'),
-- Question 10 (quiz 801, q1): Một Pomodoro tiêu chuẩn...
(10, 0, '15 phút'), (10, 1, '25 phút'), (10, 2, '45 phút'), (10, 3, '60 phút'),
-- Question 11 (quiz 1001, q1): Bài thi IELTS...
(11, 0, '2'), (11, 1, '3'), (11, 2, '4'), (11, 3, '5');

-- ============================================================
-- 8. BẢNG TESTIMONIALS
-- ============================================================
CREATE TABLE testimonials (
    id INT PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    role TEXT,
    avatar VARCHAR(500),
    content TEXT,
    rating INT DEFAULT 5
);

INSERT INTO testimonials (id, name, role, avatar, content, rating) VALUES
(1,  'Trần Minh Tuấn',  'Frontend Developer @ VNG',  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop', 'Khóa học ReactJS rất chuyên sâu. Nhờ nó mà mình đã pass phỏng vấn vào công ty hiện tại.', 5),
(2,  'Lê Thị Mai',       'Designer Freelancer',       'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop', 'Khóa học UI/UX rất thực tế, giảng viên nhiệt tình hỗ trợ sửa bài tập.', 5),
(3,  'Hoàng Văn Nam',    'Sinh viên Bách Khoa',       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop', 'Giá khóa học sinh viên nhưng chất lượng quốc tế. Rất đáng tiền!', 4),
(4,  'Phạm Hương',       'Marketing Executive',       'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop', 'Khóa Digital Marketing giúp mình hiểu rõ bức tranh tổng quan và chạy ads hiệu quả hơn hẳn.', 5),
(5,  'Nguyễn Quốc Bảo',  'Data Analyst',              'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100&auto=format&fit=crop', 'Giảng viên dạy Python rất dễ hiểu, phù hợp cho người mới bắt đầu lập trình.', 4),
(6,  'Vũ Thu Trang',     'HR Manager',                'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=100&auto=format&fit=crop', 'Khóa Tiếng Anh giao tiếp giúp mình tự tin hơn hẳn khi phỏng vấn ứng viên nước ngoài.', 5),
(7,  'Trịnh Văn Quyết',  'Entrepreneur',              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop', 'Kiến thức về khởi nghiệp rất thực tế, không lý thuyết suông. Cảm ơn thầy Shark Hưng.', 5),
(8,  'Đặng Tiểu Bình',   'Sale Manager',              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop', 'Khóa quản lý thời gian đã thay đổi hoàn toàn cách tôi làm việc. Năng suất tăng gấp đôi.', 5),
(9,  'Hồ Ngọc Hà',       'Singer',                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop', 'Web học rất đẹp, dễ sử dụng. Nội dung phong phú.', 4),
(10, 'Bùi Tiến Dũng',    'Football Player',           'https://images.unsplash.com/photo-1521119989659-a83eee488058?q=80&w=100&auto=format&fit=crop', 'Tranh thủ lúc rảnh rỗi học thêm kỹ năng mới rất tiện lợi trên điện thoại.', 5);

-- ============================================================
-- 9. BẢNG PROGRESSES (Tiến độ học tập)
-- ============================================================
CREATE TABLE progresses (
    id INT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    progress_percentage INT DEFAULT 0,
    unique_id VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

INSERT INTO progresses (id, user_id, course_id, progress_percentage, unique_id) VALUES
(1,  1,  1,  66,  '1-1'),
(2,  1,  2,  50,  '1-2'),
(3,  1,  5,  100, '1-5'),
(4,  2,  3,  20,  '2-3'),
(5,  2,  4,  0,   '2-4'),
(6,  3,  1,  100, '3-1'),
(7,  3,  2,  100, '3-2'),
(8,  3,  6,  100, '3-6'),
(9,  3,  7,  0,   '3-7'),
(10, 4,  3,  0,   '4-3'),
(11, 4,  8,  100, '4-8'),
(12, 5,  6,  30,  '5-6'),
(13, 5,  9,  0,   '5-9'),
(14, 6,  4,  100, '6-4'),
(15, 6,  10, 10,  '6-10'),
(16, 7,  1,  33,  '7-1'),
(17, 8,  8,  100, '8-8'),
(18, 8,  9,  25,  '8-9'),
(19, 9,  7,  100, '9-7'),
(20, 10, 1,  66,  '10-1'),
(21, 10, 2,  0,   '10-2'),
(22, 10, 5,  0,   '10-5');

-- ============================================================
-- 10. BẢNG PROGRESS_COMPLETED_LESSONS (Bài học đã hoàn thành)
-- ============================================================
CREATE TABLE progress_completed_lessons (
    progress_id INT NOT NULL,
    lesson_id INT NOT NULL,
    PRIMARY KEY (progress_id, lesson_id),
    FOREIGN KEY (progress_id) REFERENCES progresses(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

INSERT INTO progress_completed_lessons (progress_id, lesson_id) VALUES
-- Progress 1 (user 1, course 1): completedLessons [1, 2]
(1, 1), (1, 2),
-- Progress 2 (user 1, course 2): completedLessons [4]
(2, 4),
-- Progress 3 (user 1, course 5): completedLessons [7]
(3, 7),
-- Progress 4 (user 2, course 3): completedLessons [6]
(4, 6),
-- Progress 5 (user 2, course 4): completedLessons [] (trống)
-- Progress 6 (user 3, course 1): completedLessons [1, 2, 3]
(6, 1), (6, 2), (6, 3),
-- Progress 7 (user 3, course 2): completedLessons [4, 5]
(7, 4), (7, 5),
-- Progress 8 (user 3, course 6): completedLessons [9]
(8, 9),
-- Progress 9 (user 3, course 7): completedLessons [] (trống)
-- Progress 10 (user 4, course 3): completedLessons [] (trống)
-- Progress 11 (user 4, course 8): completedLessons [11]
(11, 11),
-- Progress 12 (user 5, course 6): completedLessons [9]
(12, 9),
-- Progress 13 (user 5, course 9): completedLessons [] (trống)
-- Progress 14 (user 6, course 4): completedLessons [8]
(14, 8),
-- Progress 15 (user 6, course 10): completedLessons [13]
(15, 13),
-- Progress 16 (user 7, course 1): completedLessons [1]
(16, 1),
-- Progress 17 (user 8, course 8): completedLessons [11]
(17, 11),
-- Progress 18 (user 8, course 9): completedLessons [12]
(18, 12),
-- Progress 19 (user 9, course 7): completedLessons [10]
(19, 10),
-- Progress 20 (user 10, course 1): completedLessons [1, 2]
(20, 1), (20, 2);
-- Progress 21, 22: completedLessons [] (trống)

-- ============================================================
-- 11. BẢNG ORDERS (Đơn hàng)
-- ============================================================
CREATE TABLE orders (
    id INT PRIMARY KEY,
    order_code INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    amount INT DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'cancelled')),
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

INSERT INTO orders (id, order_code, user_id, course_id, amount, status, created_at) VALUES
(1,  1001, 1,  1,  500000,  'paid', '2023-10-15 08:30:00'),
(2,  1002, 1,  2,  1500000, 'paid', '2023-11-20 14:00:00'),
(3,  1003, 1,  5,  1100000, 'paid', '2024-01-05 09:15:00'),
(4,  1004, 2,  3,  1200000, 'paid', '2024-01-10 10:00:00'),
(5,  1005, 2,  4,  800000,  'paid', '2024-01-15 11:30:00'),
(6,  1006, 3,  1,  500000,  'paid', '2024-02-20 07:45:00'),
(7,  1007, 3,  2,  1500000, 'paid', '2024-02-25 16:20:00'),
(8,  1008, 3,  6,  2000000, 'paid', '2024-03-10 13:00:00'),
(9,  1009, 3,  7,  900000,  'paid', '2024-03-20 08:00:00'),
(10, 1010, 4,  3,  1200000, 'paid', '2024-03-05 12:00:00'),
(11, 1011, 4,  8,  0,       'paid', '2024-03-10 09:00:00'),
(12, 1012, 5,  6,  2000000, 'paid', '2024-03-18 15:30:00'),
(13, 1013, 5,  9,  2500000, 'paid', '2024-04-01 10:45:00'),
(14, 1014, 6,  4,  800000,  'paid', '2024-04-01 14:20:00'),
(15, 1015, 6,  10, 3000000, 'paid', '2024-04-10 08:30:00'),
(16, 1016, 7,  1,  500000,  'paid', '2024-04-22 11:00:00'),
(17, 1017, 8,  8,  0,       'paid', '2024-05-10 07:00:00'),
(18, 1018, 8,  9,  2500000, 'paid', '2024-05-15 16:00:00'),
(19, 1019, 9,  7,  900000,  'paid', '2024-06-01 09:30:00'),
(20, 1020, 10, 1,  500000,  'paid', '2024-06-15 10:15:00'),
(21, 1021, 10, 2,  1500000, 'paid', '2024-06-20 13:45:00'),
(22, 1022, 10, 5,  1100000, 'paid', '2024-07-01 08:00:00');

-- ============================================================
-- 12. BẢNG QUIZ_RESULTS (Kết quả làm bài kiểm tra)
-- ============================================================
CREATE TABLE quiz_results (
    id INT PRIMARY KEY,
    unique_id VARCHAR(20),
    lesson_id INT NOT NULL,
    user_id INT NOT NULL,
    score INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    completed_at TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO quiz_results (id, unique_id, lesson_id, user_id, score, total_questions, completed_at) VALUES
(1, '1-1',  1,  1, 1, 1, '2023-10-20 10:00:00'),
(2, '2-1',  2,  1, 2, 2, '2023-10-25 14:30:00'),
(3, '4-3',  4,  3, 1, 1, '2024-03-01 09:00:00'),
(4, '5-3',  5,  3, 1, 1, '2024-03-05 11:00:00'),
(5, '6-4',  6,  4, 0, 1, '2024-03-12 15:00:00'),
(6, '11-4', 11, 4, 1, 1, '2024-03-15 10:30:00'),
(7, '10-9', 10, 9, 1, 1, '2024-06-05 08:45:00'),
(8, '1-7',  1,  7, 1, 1, '2024-04-25 16:00:00');

-- ============================================================
-- 13. BẢNG QUIZ_RESULT_ANSWERS (Chi tiết câu trả lời)
-- ============================================================
CREATE TABLE quiz_result_answers (
    id SERIAL PRIMARY KEY,
    quiz_result_id INT NOT NULL,
    question_index INT NOT NULL,
    selected_option_index INT NOT NULL,
    FOREIGN KEY (quiz_result_id) REFERENCES quiz_results(id) ON DELETE CASCADE
);

INSERT INTO quiz_result_answers (quiz_result_id, question_index, selected_option_index) VALUES
-- Quiz Result 1
(1, 0, 2),
-- Quiz Result 2
(2, 0, 1),
(2, 1, 1),
-- Quiz Result 3
(3, 0, 2),
-- Quiz Result 4
(4, 0, 1),
-- Quiz Result 5
(5, 0, 0),
-- Quiz Result 6
(6, 0, 1),
-- Quiz Result 7
(7, 0, 2),
-- Quiz Result 8
(8, 0, 2);
