import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Star, Quote, MessageSquarePlus } from 'lucide-react';
import FeedbackModal from './FeedbackModal'; 
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

  const fetchTestimonials = () => {
    axios.get('/api/testimonials')
      .then(res => {
        const sortedData = res.data.reverse().slice(0, 3); 
        setTestimonials(sortedData);
      })
      .catch(err => console.error("Lỗi tải feedback:", err));
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  return (
    // THAY ĐỔI: Bỏ bg-white, dùng nền trong suốt để lộ Particle Background
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Học viên nói gì về chúng tôi?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Hơn 10,000 học viên đã thay đổi sự nghiệp nhờ LearnHub
          </p>

          <button
            onClick={() => {
              if (user) setIsModalOpen(true);
              else alert("Vui lòng đăng nhập để viết đánh giá!");
            }}
            className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transition backdrop-blur-sm"
          >
            <MessageSquarePlus className="w-5 h-5" />
            Viết đánh giá của bạn
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div 
              key={item.id} 
              // THAY ĐỔI: Style thẻ kính mờ (Glassmorphism)
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl relative flex flex-col hover:-translate-y-2 transition duration-300 hover:bg-white/10"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-white/10 rotate-180" />

              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={item.avatar || "https://via.placeholder.com/150"} 
                  alt={item.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-purple-500 shadow-lg"
                />
                <div>
                  <div className="font-bold text-white">{item.name}</div>
                  <div className="text-sm text-purple-400 font-medium">{item.role}</div>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} 
                  />
                ))}
              </div>
              
              <p className="text-gray-300 italic leading-relaxed flex-grow">
                "{item.content}"
              </p>
            </div>
          ))}
        </div>
      </div>

      <FeedbackModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchTestimonials} 
      />
    </section>
  );
}