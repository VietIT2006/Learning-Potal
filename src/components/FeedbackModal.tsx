import React, { useState } from 'react';
import axios from 'axios';
import { X, Star, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Hàm callback để reload lại danh sách feedback sau khi gửi thành công
}

export default function FeedbackModal({ isOpen, onClose, onSuccess }: FeedbackModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Vui lòng đăng nhập để gửi đánh giá!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Gửi dữ liệu lên server (SỬA URL THÀNH /api)
      await axios.post('/api/testimonials', {
        name: user.username, // Hoặc user.fullname nếu có
        role: "Học viên",     // Mặc định vai trò
        avatar: "https://i.pravatar.cc/150?u=" + user.id, // Avatar giả lập theo ID
        content: content,
        rating: rating,
        id: Date.now() // Tạo ID ngẫu nhiên
      });
      
      alert("Cảm ơn bạn đã gửi đánh giá!");
      setContent('');
      setRating(5);
      onSuccess(); // Gọi hàm cập nhật lại danh sách bên ngoài
      onClose();   // Đóng modal
    } catch (error) {
      console.error("Lỗi khi gửi feedback:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
          <h3 className="text-xl font-bold">Gửi đánh giá của bạn</h3>
          <p className="text-purple-100 text-sm mt-1">Ý kiến của bạn giúp chúng tôi tốt hơn!</p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating Stars */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Bạn đánh giá trải nghiệm thế nào?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={`w-10 h-10 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung đánh giá</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hãy chia sẻ cảm nhận của bạn về khóa học..."
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? 'Đang gửi...' : (
              <>
                Gửi đánh giá <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}