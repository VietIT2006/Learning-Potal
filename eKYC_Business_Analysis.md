# Phân Tích Nghiệp Vụ: Quy Trình eKYC Mở Tài Khoản Ngân Hàng Số

> [!NOTE]
> Tài liệu này được biên soạn bởi Senior Business Analyst cho dự án số hóa quy trình mở tài khoản của ABC Bank với mục tiêu "Zero manual operation".

## 1. Actors (Các tác nhân tham gia hệ thống)
- **Khách hàng (Customer)**: Người dùng cuối chưa có tài khoản, tải ứng dụng và thực hiện thao tác mở thẻ.
- **Hệ thống eKYC (Internal/Third-party)**: Hệ thống chuyên biệt xử lý nhận dạng ký tự quang học (OCR) trên giấy tờ tùy thân, kiểm tra thực thể sống (Liveness check) và so khớp khuôn mặt (Face Matching).
- **Core Banking System (Hệ thống lõi ngân hàng)**: Đảm nhận việc tạo CIF (Customer Information File) và sinh số tài khoản.
- **Hệ thống AML/Fraud Detection**: Hệ thống phòng chống rửa tiền và phát hiện gian lận tự động (kiểm tra Blacklist, độ tin cậy của thiết bị, v.v.).
- **SMS/Email Gateway**: Hệ thống gửi mã OTP xác thực và thông báo kết quả cuối cùng cho Khách hàng.

## 2. Business Flow (Luồng nghiệp vụ từng bước)
1. **Khởi tạo**: Khách hàng tải và mở ứng dụng ABC Bank, chọn "Mở tài khoản mới".
2. **Xác thực ban đầu**: Khách hàng nhập số điện thoại và xác thực bằng mã OTP.
3. **Thu thập dữ liệu giấy tờ**: Khách hàng chụp ảnh mặt trước và mặt sau CCCD.
4. **Trích xuất thông tin (OCR)**: Hệ thống eKYC trích xuất các thông tin văn bản từ hình ảnh chụp (Họ tên, ngày sinh, số CCCD, địa chỉ...).
5. **Xác nhận thông tin**: Khách hàng kiểm tra thông tin OCR trích xuất và xác nhận hoặc chỉnh sửa (nếu được phép/cần thiết).
6. **Kiểm tra thực thể sống (Liveness Check)**: Khách hàng thực hiện các thao tác theo hướng dẫn trên màn hình (quay trái/phải, mỉm cười...) để hệ thống ghi hình/chụp ảnh xác nhận là người thật.
7. **So khớp khuôn mặt (Face Match)**: Hệ thống so sánh ảnh tĩnh trên giấy tờ với hình ảnh thu thập được từ bước Liveness Check.
8. **Kiểm tra nghiệp vụ & Bảo mật**: Thông tin khách hàng được gửi đến Hệ thống AML/Fraud Detection để kiểm tra danh sách đen và tính hợp lệ.
9. **Cấp tài khoản tự động (Zero manual operation)**:
   - Nếu hợp lệ: Core Banking tự động tạo CIF và số tài khoản thanh toán.
   - Nếu không hợp lệ hoặc có dấu hiệu rủi ro: Tự động từ chối yêu cầu và thông báo lý do (hoặc yêu cầu ra quầy).
10. **Thông báo**: Gửi SMS/Email và thông báo trên App về kết quả tạo tài khoản thành công.

## 3. Functional Requirements (Yêu cầu chức năng)
- **FR01**: Hệ thống phải cho phép người dùng đăng ký bằng số điện thoại và nhận mã xác thực OTP qua SMS.
- **FR02**: Hệ thống phải cung cấp giao diện camera để chụp ảnh hai mặt giấy tờ tùy thân.
- **FR03**: Hệ thống phải tích hợp công nghệ OCR để đọc và bóc tách dữ liệu từ ảnh CCCD (ít nhất 95% độ chính xác đối với hình ảnh rõ nét).
- **FR04**: Hệ thống phải yêu cầu và ghi nhận quá trình Liveness Check để loại bỏ hành vi sử dụng ảnh/video giả mạo.
- **FR05**: Hệ thống phải thực hiện Face Matching và trả về điểm tỷ lệ trùng khớp (Match Score).
- **FR06**: Hệ thống phải tự động kiểm tra thông tin định danh (Tên, Số CCCD) với hệ thống AML và Blacklist.
- **FR07**: Hệ thống phải tự động kết nối qua API với Core Banking để mở CIF và số tài khoản khi mọi điều kiện xác thực được thỏa mãn.
- **FR08**: Hệ thống phải gửi thông báo kết quả cho khách hàng qua SMS/Email và In-app message.

## 4. Non-Functional Requirements (Yêu cầu phi chức năng)
- **Bảo mật (Security)**: Toàn bộ hình ảnh, video và dữ liệu cá nhân phải được mã hóa đầu cuối (E2EE) và khi lưu trữ (AES-256). Tuân thủ nghiêm ngặt quy định của NHNN và Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
- **Hiệu năng (Performance)**: 
  - Thời gian xử lý OCR và Face Match không vượt quá 5 giây/lượt.
  - API gọi sang Core Banking phản hồi trong vòng 3 giây.
- **Tính sẵn sàng (Availability)**: Hệ thống eKYC cần duy trì Uptime tối thiểu 99.9%.
- **Khả năng mở rộng (Scalability)**: Có khả năng xử lý lên tới 10,000 yêu cầu eKYC đồng thời (Concurrency) trong các chiến dịch marketing.
- **Trải nghiệm người dùng (Usability/UX)**: Luồng thao tác không quá 3 phút; có hướng dẫn trực quan (voice/animation) khi chụp ảnh và quét khuôn mặt.

## 5. Assumptions & Business Rules (Giả định & Quy tắc nghiệp vụ)
- **BR01 - Độ tuổi**: Khách hàng phải từ đủ 15 tuổi trở lên.
- **BR02 - Tính duy nhất**: Một số điện thoại và một số CCCD chỉ được liên kết với một CIF duy nhất tại ABC Bank.
- **BR03 - Tình trạng giấy tờ**: Khách hàng phải sử dụng bản gốc CCCD/CMND còn hiệu lực.
- **BR04 - Xử lý ngoại lệ**: Bất kỳ giao dịch nào không vượt qua được OCR độ tự tin > 90%, Face Match > 85%, hoặc dính Blacklist sẽ bị từ chối tự động (Auto-Reject) để đảm bảo mục tiêu "Zero manual operation".
- **Assumption**: Khách hàng sử dụng điện thoại thông minh có camera (tối thiểu 5MP) và kết nối internet ổn định.

---

## 6. Danh Sách User Story (Chuyển đổi Artifact)
1. **US01 (Đăng ký sđt)**: *As a new customer*, I want to register using my phone number and OTP *so that* my account is securely linked to my personal device.
2. **US02 (Chụp ảnh CCCD)**: *As a new customer*, I want to capture photos of my ID card *so that* the system can automatically extract my information without manual data entry.
3. **US03 (Xác thực khuôn mặt)**: *As a new customer*, I want to verify my identity via a quick liveness and face scan *so that* the bank knows I am the legitimate owner of the ID card.
4. **US04 (Kiểm tra AML)**: *As a Compliance Officer*, I want the system to automatically screen applicants against the AML blacklist *so that* the bank avoids regulatory fines and money laundering risks without needing manual review.
5. **US05 (Cấp tài khoản)**: *As a new customer*, I want to receive my new account number immediately upon successful verification *so that* I can start transferring money and using banking services right away.

## 7. Danh Sách Use Case (Chuyển đổi Artifact)
- **UC01**: Đăng ký và xác thực số điện thoại qua OTP (Register & Verify Phone Number).
- **UC02**: Chụp và trích xuất dữ liệu giấy tờ tùy thân bằng OCR (Capture ID & Extract Data).
- **UC03**: Thực hiện kiểm tra thực thể sống (Perform Liveness Check).
- **UC04**: So khớp khuôn mặt (Face Matching).
- **UC05**: Kiểm tra danh sách đen phòng chống rửa tiền (AML & Blacklist Screening).
- **UC06**: Tự động sinh CIF và cấp số tài khoản (Auto-issue CIF & Bank Account).
- **UC07**: Gửi thông báo kết quả (Send Result Notification).
