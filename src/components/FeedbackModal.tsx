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
      // Gửi dữ liệu lên server
      await axios.post('/api/testimonials', {
        name: user.username,
        role: "Học viên",
        avatar: "https://i.pravatar.cc/150?u=" + user.id,
        content: content,
        rating: rating,
        id: Date.now()
      });
      
      alert("Cảm ơn bạn đã gửi đánh giá!");
      setContent('');
      setRating(5);
      onSuccess(); 
      onClose();
    } catch (error) {
      console.error("Lỗi khi gửi feedback:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Overlay nền tối hơn (bg-black/80) để làm nổi bật Modal
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      
      {/* Modal Container: Nền tối, viền tím mờ, đổ bóng tím nhẹ */}
      <div className="bg-[#0f172a] border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.15)] w-full max-w-md overflow-hidden relative animate-scale-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 border-b border-white/10">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
          <h3 className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Gửi đánh giá của bạn
          </h3>
          <p className="text-gray-400 text-sm mt-1">Ý kiến của bạn giúp chúng tôi tốt hơn!</p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Rating Stars */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm font-medium text-gray-300">Bạn đánh giá trải nghiệm thế nào?</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    // Ngôi sao không chọn sẽ có màu xám đậm (text-gray-700) để chìm vào nền tối
                    className={`w-10 h-10 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Content Input: Nền trong suốt, chữ trắng */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nội dung đánh giá</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Hãy chia sẻ cảm nhận của bạn về khóa học..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none transition-all"
            />
          </div>

          {/* Submit Button: Gradient nổi bật */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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