import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, Quote, MessageSquarePlus } from 'lucide-react';
import FeedbackModal from './FeedbackModal'; // Import modal vừa tạo
import { useAuth } from '../context/AuthContext';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  // Hàm load dữ liệu
  const fetchTestimonials = () => {
    axios.get('http://localhost:3001/testimonials')
      .then(res => {
        // Lấy 3 feedback mới nhất (đảo ngược mảng)
        const sortedData = res.data.reverse().slice(0, 3); 
        setTestimonials(sortedData);
      })
      .catch(err => console.error("Lỗi tải feedback:", err));
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Học viên nói gì về chúng tôi?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Hơn 10,000 học viên đã thay đổi sự nghiệp nhờ LearnHub
          </p>

          {/* Nút mở Modal Gửi đánh giá */}
          <button
            onClick={() => {
              if (user) setIsModalOpen(true);
              else alert("Vui lòng đăng nhập để viết đánh giá!");
            }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold hover:bg-purple-200 transition"
          >
            <MessageSquarePlus className="w-5 h-5" />
            Viết đánh giá của bạn
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div 
              key={item.id} 
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition duration-300 relative flex flex-col"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-purple-200 rotate-180" />

              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={item.avatar || "https://via.placeholder.com/150"} 
                  alt={item.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="font-bold text-gray-900">{item.name}</div>
                  <div className="text-sm text-purple-600 font-medium">{item.role}</div>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              
              <p className="text-gray-700 italic leading-relaxed flex-grow">
                "{item.content}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Render Modal */}
      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTestimonials} // Reload dữ liệu sau khi gửi thành công
      />
    </section>
  );
}