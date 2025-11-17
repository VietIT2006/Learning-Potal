import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Star, TrendingUp, Award, Clock } from 'lucide-react';

// Dữ liệu giả lập cho phần Testimonials và Stats
const stats = [
  { label: 'Khóa học', value: '50+', icon: BookOpen },
  { label: 'Học viên', value: '10K+', icon: Users },
  { label: 'Giáo viên', value: '100+', icon: Star }
];

const testimonials = [
  {
    name: 'Hồ Thị Kim',
    role: 'Frontend Developer',
    image: '👩‍💼',
    text: 'Khóa học React của LearnHub đã thay đổi sự nghiệp của tôi. Giáo viên rất tận tâm!'
  },
  {
    name: 'Trương Văn Minh',
    role: 'Full Stack Developer',
    image: '👨‍💼',
    text: 'Chất lượng bài giảng tuyệt vời. Tôi đã tìm được công việc mơ ước sau khóa học này.'
  },
  {
    name: 'Ngô Mỹ Linh',
    role: 'UI/UX Designer',
    image: '👩‍🎨',
    text: 'Khóa web design giúp tôi nâng cao kỹ năng thiết kế một cách nhanh chóng.'
  }
];

function HomePage() {
  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 via-white to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Học tập <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">không giới hạn</span>
              </h1>
              <p className="text-xl text-gray-600">
                Khám phá hàng ngàn khóa học từ những chuyên gia hàng đầu. Nâng cao kỹ năng của bạn ngay hôm nay.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/courses" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition flex items-center justify-center gap-2">
                  Khám phá khóa học <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-50 transition">
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                <div className="text-9xl">🎓</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center p-6 hover:bg-gray-50 rounded-xl transition cursor-default">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Tại sao chọn LearnHub?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: TrendingUp, title: 'Nội dung cập nhật', desc: 'Các khóa học được cập nhật theo xu hướng công nghệ mới nhất' },
              { icon: Award, title: 'Chứng chỉ chuyên nghiệp', desc: 'Nhận chứng chỉ công nhân được công ty hàng đầu công nhận' },
              { icon: Clock, title: 'Học theo tốc độ của bạn', desc: 'Học bất kỳ lúc nào, bất kỳ nơi nào với tốc độ của riêng bạn' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Học viên nói gì về chúng tôi?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-4xl font-bold mb-4">Bắt đầu hành trình học tập của bạn</h2>
          <p className="text-lg mb-8 opacity-90">
            Tham gia cộng đồng 10,000+ học viên đang nâng cao kỹ năng của họ
          </p>
          <Link to="/courses" className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold hover:shadow-xl transition inline-block">
            Đăng ký miễn phí ngay
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;