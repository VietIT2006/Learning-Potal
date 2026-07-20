import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Khai báo các bản dịch
const resources = {
  vi: {
    translation: {
      navbar: {
        home: "Trang chủ",
        courses: "Khóa học",
        practice: "Luyện thi",
        forum: "Diễn đàn",
        news: "Tin tức",
        search: "Tìm kiếm",
        search_placeholder: "Tìm khóa học...",
        points: "Điểm",
        profile: "Hồ sơ",
        wallet: "Ví của tôi",
        settings: "Cài đặt",
        logout: "Đăng xuất",
        login: "Đăng nhập",
        register: "Đăng ký",
        admin_panel: "Bảng điều khiển Admin"
      },
      home: {
        hero_title: "Nền Tảng Học Tập Trực Tuyến Hàng Đầu",
        hero_subtitle: "Khám phá hàng ngàn khóa học chất lượng cao từ các chuyên gia hàng đầu. Nâng tầm kiến thức của bạn ngay hôm nay.",
        start_learning: "Bắt đầu học ngay",
        explore_courses: "Khám phá khóa học",
        trusted_by: "Được tin dùng bởi hơn 100.000 học viên",
        features_title: "Tại sao chọn chúng tôi?",
        feature_1_title: "Giảng viên chuyên gia",
        feature_1_desc: "Học từ những người giỏi nhất trong ngành với nhiều năm kinh nghiệm thực tế.",
        feature_2_title: "Học mọi lúc mọi nơi",
        feature_2_desc: "Truy cập khóa học 24/7 trên mọi thiết bị. Học theo tốc độ của riêng bạn.",
        feature_3_title: "Chứng chỉ hoàn thành",
        feature_3_desc: "Nhận chứng chỉ uy tín sau khi hoàn thành mỗi khóa học để nâng cấp hồ sơ của bạn.",
        feature_4_title: "Cộng đồng năng động",
        feature_4_desc: "Tham gia diễn đàn, thảo luận và học hỏi cùng hàng ngàn học viên khác."
      }
    }
  },
  en: {
    translation: {
      navbar: {
        home: "Home",
        courses: "Courses",
        practice: "Practice",
        forum: "Forum",
        news: "News",
        search: "Search",
        search_placeholder: "Search courses...",
        points: "Points",
        profile: "Profile",
        wallet: "My Wallet",
        settings: "Settings",
        logout: "Logout",
        login: "Login",
        register: "Register",
        admin_panel: "Admin Panel"
      },
      home: {
        hero_title: "Leading Online Learning Platform",
        hero_subtitle: "Discover thousands of high-quality courses from top experts. Elevate your knowledge today.",
        start_learning: "Start Learning Now",
        explore_courses: "Explore Courses",
        trusted_by: "Trusted by over 100,000 students",
        features_title: "Why choose us?",
        feature_1_title: "Expert Instructors",
        feature_1_desc: "Learn from the best in the industry with years of practical experience.",
        feature_2_title: "Learn Anywhere, Anytime",
        feature_2_desc: "Access courses 24/7 on any device. Learn at your own pace.",
        feature_3_title: "Certificate of Completion",
        feature_3_desc: "Get a prestigious certificate after completing each course to upgrade your profile.",
        feature_4_title: "Active Community",
        feature_4_desc: "Join the forum, discuss, and learn together with thousands of other students."
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'vi', // Ngôn ngữ mặc định
    interpolation: {
      escapeValue: false // React đã chống XSS mặc định
    }
  });

export default i18n;
